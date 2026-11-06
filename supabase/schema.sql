-- SHEZY catalog schema. Run this file in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null,
  discount_price numeric(12, 2),
  category_id uuid references public.categories(id) on delete set null,
  is_sold boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  sort_order integer not null default 0
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_featured_created_idx on public.products(is_featured desc, created_at desc);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists product_images_product_sort_idx on public.product_images(product_id, sort_order);
create unique index if not exists product_images_one_primary_per_product_idx
  on public.product_images(product_id) where is_primary;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories
  for select to anon, authenticated using (true);
drop policy if exists "Authenticated users can insert categories" on public.categories;
create policy "Authenticated users can insert categories" on public.categories
  for insert to authenticated with check (auth.uid() is not null);
drop policy if exists "Authenticated users can update categories" on public.categories;
create policy "Authenticated users can update categories" on public.categories
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "Authenticated users can delete categories" on public.categories;
create policy "Authenticated users can delete categories" on public.categories
  for delete to authenticated using (auth.uid() is not null);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products
  for select to anon, authenticated using (true);
drop policy if exists "Authenticated users can insert products" on public.products;
create policy "Authenticated users can insert products" on public.products
  for insert to authenticated with check (auth.uid() is not null);
drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products" on public.products
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "Authenticated users can delete products" on public.products;
create policy "Authenticated users can delete products" on public.products
  for delete to authenticated using (auth.uid() is not null);

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images" on public.product_images
  for select to anon, authenticated using (true);
drop policy if exists "Authenticated users can insert product images" on public.product_images;
create policy "Authenticated users can insert product images" on public.product_images
  for insert to authenticated with check (auth.uid() is not null);
drop policy if exists "Authenticated users can update product images" on public.product_images;
create policy "Authenticated users can update product images" on public.product_images
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "Authenticated users can delete product images" on public.product_images;
create policy "Authenticated users can delete product images" on public.product_images
  for delete to authenticated using (auth.uid() is not null);

-- Public image delivery; only signed-in users can upload or delete objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and auth.uid() is not null);
drop policy if exists "Authenticated users can delete product images" on storage.objects;
create policy "Authenticated users can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and auth.uid() is not null);

-- ─────────────────────────────────────────────────────────────────────────────
-- Storefront orders and stock tracking.
-- Customers order as guests: writes happen only through the security-definer
-- functions below, so the tables themselves expose no anon access.
-- ─────────────────────────────────────────────────────────────────────────────

-- Adds stock tracking. The very first time this column is created, existing
-- products receive a starting stock of 10 so the storefront stays orderable;
-- edit each product afterwards to set its real quantity.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'stock_quantity'
  ) then
    alter table public.products add column stock_quantity integer not null default 0;
    update public.products set stock_quantity = 10 where is_sold = false;
  end if;
end $$;

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || nextval('public.order_number_seq')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text not null,
  city text not null,
  notes text,
  payment_method text not null check (payment_method in ('cod', 'bank')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(12, 2) not null default 0,
  shipping_fee numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text,
  unit_price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant select, insert, update, delete on public.orders, public.order_items to authenticated;

drop policy if exists "Authenticated users manage orders" on public.orders;
create policy "Authenticated users manage orders" on public.orders
  for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "Authenticated users manage order items" on public.order_items;
create policy "Authenticated users manage order items" on public.order_items
  for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

-- Places a guest order atomically: validates stock, snapshots prices, inserts the
-- order and items, and decrements stock. Prices always come from the products
-- table, never from the client.
create or replace function public.place_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_address text,
  p_city text,
  p_notes text,
  p_payment_method text,
  p_shipping_fee numeric,
  p_items jsonb
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_shipping numeric(12, 2);
  v_subtotal numeric(12, 2) := 0;
  v_item record;
  v_product record;
  v_unit_price numeric(12, 2);
  v_quantity integer;
begin
  if coalesce(trim(p_customer_name), '') = '' then raise exception 'Customer name is required'; end if;
  if coalesce(trim(p_customer_phone), '') = '' then raise exception 'Customer phone is required'; end if;
  if coalesce(trim(p_address), '') = '' then raise exception 'Delivery address is required'; end if;
  if coalesce(trim(p_city), '') = '' then raise exception 'City is required'; end if;
  if p_payment_method not in ('cod', 'bank') then raise exception 'Unsupported payment method'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty';
  end if;

  v_shipping := greatest(coalesce(p_shipping_fee, 0), 0);

  insert into public.orders (
    customer_name, customer_phone, customer_email, address, city, notes, payment_method, shipping_fee
  ) values (
    trim(p_customer_name),
    trim(p_customer_phone),
    nullif(trim(coalesce(p_customer_email, '')), ''),
    trim(p_address),
    trim(p_city),
    nullif(trim(coalesce(p_notes, '')), ''),
    p_payment_method,
    v_shipping
  )
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer) loop
    v_quantity := coalesce(v_item.quantity, 0);
    if v_quantity <= 0 then raise exception 'Invalid quantity'; end if;

    select id, name, slug, price, discount_price, stock_quantity, is_sold
      into v_product
      from public.products
      where id = v_item.product_id
      for update;

    if not found then raise exception 'A product in your cart is no longer available'; end if;
    if v_product.is_sold or v_product.stock_quantity < v_quantity then
      raise exception 'Not enough stock for %', v_product.name;
    end if;

    v_unit_price := coalesce(v_product.discount_price, v_product.price);

    insert into public.order_items (order_id, product_id, product_name, product_slug, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.slug, v_unit_price, v_quantity, v_unit_price * v_quantity);

    v_subtotal := v_subtotal + (v_unit_price * v_quantity);

    update public.products
      set stock_quantity = stock_quantity - v_quantity,
          is_sold = (stock_quantity - v_quantity) <= 0
      where id = v_product.id;
  end loop;

  update public.orders
    set subtotal = v_subtotal,
        total = v_subtotal + v_shipping
    where id = v_order_id;

  return json_build_object(
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping,
    'total', v_subtotal + v_shipping
  );
end;
$$;

-- Lets a guest read a single order by matching the order number with the phone
-- used at checkout. Returns null when nothing matches.
create or replace function public.lookup_order(p_order_number text, p_phone text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result json;
begin
  select json_build_object(
    'order', to_jsonb(o),
    'items', coalesce(
      (select json_agg(to_jsonb(i) order by i.id) from public.order_items i where i.order_id = o.id),
      '[]'::json
    )
  )
  into v_result
  from public.orders o
  where upper(trim(o.order_number)) = upper(trim(p_order_number))
    and right(regexp_replace(o.customer_phone, '\D', '', 'g'), 10)
        = right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);

  return v_result;
end;
$$;

grant execute on function public.place_order(text, text, text, text, text, text, text, numeric, jsonb) to anon, authenticated;
grant execute on function public.lookup_order(text, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Verified-purchase reviews. A review can only be written by matching an order
-- number with the phone used at checkout. Reviews start as 'pending' and become
-- public once an admin approves them.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.products add column if not exists rating_average numeric(3, 2) not null default 0;
alter table public.products add column if not exists rating_count integer not null default 0;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One review per product per order.
create unique index if not exists reviews_order_product_idx on public.reviews(order_id, product_id) where order_id is not null;
create index if not exists reviews_product_status_idx on public.reviews(product_id, status);
create index if not exists reviews_status_created_idx on public.reviews(status, created_at desc);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

-- Keeps each product's public rating summary in sync with its approved reviews.
create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
begin
  v_product_id := coalesce(new.product_id, old.product_id);
  update public.products p
    set rating_average = coalesce((select round(avg(r.rating)::numeric, 2) from public.reviews r where r.product_id = v_product_id and r.status = 'approved'), 0),
        rating_count = (select count(*) from public.reviews r where r.product_id = v_product_id and r.status = 'approved')
    where p.id = v_product_id;
  return null;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

alter table public.reviews enable row level security;

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;

drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews" on public.reviews
  for select to anon, authenticated using (status = 'approved');
drop policy if exists "Authenticated users manage reviews" on public.reviews;
create policy "Authenticated users manage reviews" on public.reviews
  for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

-- Submits a verified-purchase review after matching the order number and phone.
create or replace function public.submit_review(
  p_order_number text,
  p_phone text,
  p_product_id uuid,
  p_rating integer,
  p_comment text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Choose a rating between 1 and 5';
  end if;
  if p_product_id is null then
    raise exception 'Missing product';
  end if;

  select o.id, o.customer_name, o.status
    into v_order
    from public.orders o
    where upper(trim(o.order_number)) = upper(trim(coalesce(p_order_number, '')))
      and right(regexp_replace(o.customer_phone, '\D', '', 'g'), 10)
          = right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);

  if not found then
    raise exception 'We could not find that order. Please check the order number and phone.';
  end if;
  if v_order.status = 'cancelled' then
    raise exception 'This order was cancelled and cannot be reviewed.';
  end if;

  if not exists (select 1 from public.order_items i where i.order_id = v_order.id and i.product_id = p_product_id) then
    raise exception 'This product is not part of that order.';
  end if;

  insert into public.reviews (product_id, order_id, customer_name, rating, comment)
  values (p_product_id, v_order.id, v_order.customer_name, p_rating, nullif(trim(coalesce(p_comment, '')), ''))
  on conflict do nothing;

  if not found then
    raise exception 'You have already reviewed this product.';
  end if;

  return json_build_object('status', 'pending');
end;
$$;

grant execute on function public.submit_review(text, text, uuid, integer, text) to anon, authenticated;
