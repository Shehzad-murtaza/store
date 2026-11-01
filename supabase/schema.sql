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
