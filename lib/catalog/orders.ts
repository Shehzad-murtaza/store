import type { OrderStatus, PaymentMethod, PaymentStatus, Product } from "@/types";

/** Flat delivery charge applied to every order. Set to 0 for free delivery. */
export const SHIPPING_FEE = 0;

export const ORDER_STATUSES: Array<{ value: OrderStatus; label: string; tone: "pending" | "progress" | "done" | "cancelled" }> = [
  { value: "pending", label: "Pending", tone: "pending" },
  { value: "confirmed", label: "Confirmed", tone: "progress" },
  { value: "packed", label: "Packed", tone: "progress" },
  { value: "shipped", label: "Shipped", tone: "progress" },
  { value: "delivered", label: "Delivered", tone: "done" },
  { value: "cancelled", label: "Cancelled", tone: "cancelled" },
];

/** Ordered fulfilment flow shown to customers (cancelled is handled separately). */
export const ORDER_PROGRESS: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "delivered"];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  bank: "Bank transfer",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  partial: "Partially paid",
  paid: "Paid",
};

/** Derives the payment status from how much has actually been received. */
export function paymentStatusFromAmount(total: number, amountPaid: number): PaymentStatus {
  if (amountPaid <= 0) return "unpaid";
  if (amountPaid >= total) return "paid";
  return "partial";
}

/** The next step in the fulfilment flow, or null when the order is finished. */
export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_PROGRESS.indexOf(status);
  if (index < 0 || index >= ORDER_PROGRESS.length - 1) return null;
  return ORDER_PROGRESS[index + 1];
}

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUSES.find((entry) => entry.value === status)?.label ?? status;
}

export function orderStatusTone(status: OrderStatus) {
  return ORDER_STATUSES.find((entry) => entry.value === status)?.tone ?? "pending";
}

/** A product cannot be ordered when it is flagged as sold or has no stock left. */
export function isOutOfStock(product: Pick<Product, "is_sold" | "stock_quantity">): boolean {
  return product.is_sold || product.stock_quantity <= 0;
}

/** Converts a local Pakistani number (03XX…) into the international wa.me format. */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}
