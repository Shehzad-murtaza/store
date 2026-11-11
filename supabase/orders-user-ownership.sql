-- Adds customer ownership to orders for the current checkout RPC and account history.
-- Safe to run on an existing store: existing orders remain guest orders (user_id NULL).
begin;

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_user_id_idx on public.orders(user_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
grant select, insert, update, delete on public.orders, public.order_items to authenticated;

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders" on public.orders
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers read own order items" on public.order_items;
create policy "Customers read own order items" on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create or replace function public.clear_admin_customer_order_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is not null and exists (
    select 1 from public.admin_users a where a.user_id = new.user_id
  ) then
    new.user_id := null;
  end if;
  return new;
end;
$$;

revoke all on function public.clear_admin_customer_order_owner() from public, anon, authenticated;
drop trigger if exists orders_clear_admin_customer_owner on public.orders;
create trigger orders_clear_admin_customer_owner
  before insert or update of user_id on public.orders
  for each row execute function public.clear_admin_customer_order_owner();

update public.orders o
set user_id = null
where exists (
  select 1 from public.admin_users a where a.user_id = o.user_id
);

commit;

notify pgrst, 'reload schema';
