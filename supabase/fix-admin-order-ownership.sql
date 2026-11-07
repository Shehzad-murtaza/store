-- Prevent storefront checkouts made during an admin session from appearing
-- in the admin's personal customer account, and detach existing misattributed
-- orders without deleting any order or order-item data.
begin;

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
