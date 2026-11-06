import { formatPKR } from "@/lib/catalog/format";
import type { RevenuePoint } from "@/lib/supabase/analytics";

const PLOT_HEIGHT = 200;

export function RevenueChart({ points }: { points: RevenuePoint[] }) {
  const max = Math.max(0, ...points.map((point) => point.revenue));
  const step = Math.max(1, Math.ceil(points.length / 8));
  const hasRevenue = max > 0;

  return <div className="analytics-chart">
    <div className="analytics-chart-plot">
      {points.map((point) => {
        const height = hasRevenue ? Math.max(2, Math.round((point.revenue / max) * PLOT_HEIGHT)) : 0;
        return <div key={point.key} className="analytics-bar-col" title={`${point.label} · ${formatPKR(point.revenue)} · ${point.orders} ${point.orders === 1 ? "order" : "orders"}`}>
          <div className="analytics-bar" style={{ height }} />
        </div>;
      })}
    </div>
    <div className="analytics-chart-axis" aria-hidden="true">
      {points.map((point, index) => <span key={point.key} className="analytics-axis-label">{index % step === 0 ? point.label : ""}</span>)}
    </div>
    {!hasRevenue && <p className="analytics-chart-empty">No sales recorded in this period.</p>}
  </div>;
}
