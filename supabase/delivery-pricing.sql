-- Configurable standard delivery plus optional per-product per-unit surcharges.
begin;

alter table public.products
  add column if not exists delivery_fee numeric(12, 2) not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.products'::regclass and conname = 'products_delivery_fee_nonnegative'
  ) then
    alter table public.products add constraint products_delivery_fee_nonnegative check (delivery_fee >= 0);
  end if;
end $$;

create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  default_delivery_fee numeric(12, 2) not null default 0 check (default_delivery_fee >= 0),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id, default_delivery_fee)
values (true, 0)
on conflict (id) do nothing;

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;
grant select on public.store_settings to anon, authenticated;
grant insert, update on public.store_settings to authenticated;
drop policy if exists "Public can read delivery settings" on public.store_settings;
create policy "Public can read delivery settings" on public.store_settings
  for select to anon, authenticated using (true);
drop policy if exists "Admins manage delivery settings" on public.store_settings;
create policy "Admins manage delivery settings" on public.store_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

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

  -- Keep the RPC signature stable, but always calculate delivery from trusted DB values.
  select coalesce(s.default_delivery_fee, 0)
    into v_shipping
    from public.store_settings s
    where s.id = true;
  v_shipping := coalesce(v_shipping, 0);

  select v_shipping + coalesce(sum(greatest(p.delivery_fee, 0) * greatest(x.quantity, 0)), 0)
    into v_shipping
    from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer)
    join public.products p on p.id = x.product_id;

  insert into public.orders (
    customer_name, customer_phone, customer_email, address, city, notes, payment_method, shipping_fee, user_id
  ) values (
    trim(p_customer_name),
    trim(p_customer_phone),
    nullif(trim(coalesce(p_customer_email, '')), ''),
    trim(p_address),
    trim(p_city),
    nullif(trim(coalesce(p_notes, '')), ''),
    p_payment_method,
    v_shipping,
    case when public.is_admin() then null else auth.uid() end
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

grant execute on function public.place_order(text, text, text, text, text, text, text, numeric, jsonb) to anon, authenticated;

commit;
