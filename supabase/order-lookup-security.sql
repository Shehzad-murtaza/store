-- Run this migration to secure guest order tracking.
-- Phone numbers are validated as complete Pakistani mobile numbers and are never
-- returned with the public tracking payload.
begin;

create or replace function public.lookup_order(p_order_number text, p_phone text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result json;
  v_phone_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if coalesce(trim(p_order_number), '') = '' or length(trim(p_order_number)) > 40 then
    return null;
  end if;

  if not (
    (length(v_phone_digits) = 11 and left(v_phone_digits, 2) = '03')
    or (length(v_phone_digits) = 12 and left(v_phone_digits, 3) = '923')
  ) then
    return null;
  end if;

  select json_build_object(
    'order', json_build_object(
      'order_number', o.order_number,
      'payment_method', o.payment_method,
      'payment_status', o.payment_status,
      'amount_paid', o.amount_paid,
      'status', o.status,
      'tracking_number', o.tracking_number,
      'subtotal', o.subtotal,
      'shipping_fee', o.shipping_fee,
      'total', o.total,
      'shipped_at', o.shipped_at,
      'delivered_at', o.delivered_at,
      'created_at', o.created_at
    ),
    'items', coalesce((
      select json_agg(json_build_object(
        'id', i.id,
        'order_id', i.order_id,
        'product_id', i.product_id,
        'product_name', i.product_name,
        'product_slug', i.product_slug,
        'unit_price', i.unit_price,
        'quantity', i.quantity,
        'line_total', i.line_total
      ) order by i.id)
      from public.order_items i where i.order_id = o.id
    ), '[]'::json)
  )
  into v_result
  from public.orders o
  where upper(trim(o.order_number)) = upper(trim(p_order_number))
    and right(regexp_replace(coalesce(o.customer_phone, ''), '\D', '', 'g'), 10)
        = right(v_phone_digits, 10);

  return v_result;
end;
$$;

revoke all on function public.lookup_order(text, text) from public;
grant execute on function public.lookup_order(text, text) to anon, authenticated;

commit;
