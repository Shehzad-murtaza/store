import { Check, X } from "lucide-react";
import { ORDER_PROGRESS, orderStatusLabel } from "@/lib/catalog/orders";
import type { OrderStatus } from "@/types";

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="order-timeline-cancelled"><X size={15} />This order was cancelled.</p>;
  }

  const currentIndex = ORDER_PROGRESS.indexOf(status);

  return <ol className="order-timeline">
    {ORDER_PROGRESS.map((step, index) => {
      const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "todo";
      return <li key={step} className={`order-timeline-step ${state}`}>
        <span className="order-timeline-marker">{state === "done" ? <Check size={14} strokeWidth={2.5} /> : <span className="order-timeline-dot" />}</span>
        <span className="order-timeline-title">{orderStatusLabel(step)}</span>
      </li>;
    })}
  </ol>;
}
