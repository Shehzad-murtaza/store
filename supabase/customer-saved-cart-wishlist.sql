-- Persist cart and wishlist rows for authenticated customers only.
-- Anonymous cart and wishlist data remains browser-session-only.
begin;

create table if not exists public.customer_cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity between 1 and 99),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.customer_wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists customer_cart_items_user_updated_idx
  on public.customer_cart_items(user_id, updated_at desc);
create index if not exists customer_wishlist_items_user_created_idx
  on public.customer_wishlist_items(user_id, created_at desc);

alter table public.customer_cart_items enable row level security;
alter table public.customer_wishlist_items enable row level security;
grant select, insert, update, delete on public.customer_cart_items, public.customer_wishlist_items to authenticated;

drop policy if exists "Customers manage their own cart" on public.customer_cart_items;
create policy "Customers manage their own cart" on public.customer_cart_items
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Customers manage their own wishlist" on public.customer_wishlist_items;
create policy "Customers manage their own wishlist" on public.customer_wishlist_items
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.sync_customer_cart(p_items jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then raise exception 'Invalid cart data'; end if;
  delete from public.customer_cart_items where user_id = auth.uid();
  insert into public.customer_cart_items (user_id, product_id, quantity)
  select auth.uid(), x.product_id, least(greatest(x.quantity, 1), 99)
  from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer)
  join public.products p on p.id = x.product_id
  where x.quantity > 0 and p.is_sold = false and p.stock_quantity > 0
  on conflict (user_id, product_id) do update
    set quantity = excluded.quantity, updated_at = now();
end;
$$;

create or replace function public.sync_customer_wishlist(p_product_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from public.customer_wishlist_items where user_id = auth.uid();
  insert into public.customer_wishlist_items (user_id, product_id)
  select auth.uid(), p.id from public.products p
  where p.id = any(coalesce(p_product_ids, array[]::uuid[]))
  on conflict (user_id, product_id) do nothing;
end;
$$;

revoke all on function public.sync_customer_cart(jsonb) from public, anon;
revoke all on function public.sync_customer_wishlist(uuid[]) from public, anon;
grant execute on function public.sync_customer_cart(jsonb) to authenticated;
grant execute on function public.sync_customer_wishlist(uuid[]) to authenticated;

commit;
