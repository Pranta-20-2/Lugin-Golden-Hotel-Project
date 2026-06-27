import Card from "@/components/ui/Card";
import type { RevenueByRoomType } from "@/types/dashboard";
import { formatAmount } from "@/lib/formatCurrency";

type RevenueByRoomTypeChartProps = {
  data: RevenueByRoomType[];
};

export default function RevenueByRoomTypeChart({
  data,
}: RevenueByRoomTypeChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const hasRevenue = data.some((d) => d.revenue > 0);
  const chartData = data.slice(0, 6);

  return (
    <Card className="h-full">
      <h2 className="mb-1 text-base font-semibold text-slate-900 sm:text-lg">
        Revenue by Room Type
      </h2>
      <p className="mb-5 text-xs text-slate-500 sm:text-sm">
        Total booking revenue grouped by room type
      </p>

      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Add room types to see this chart.
        </p>
      ) : (
        <div>
          <div className="flex h-60 items-end gap-3 rounded-2xl bg-slate-50 px-3 pb-3 pt-6 sm:gap-4 sm:px-5">
            {chartData.map((item) => {
              const height = `${Math.max((item.revenue / maxRevenue) * 100, item.revenue > 0 ? 4 : 0)}%`;

              return (
                <div key={item.name} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                    {formatAmount(item.revenue)}
                  </span>
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm transition-all"
                      style={{ height }}
                    />
                  </div>
                  <span className="w-full truncate text-center text-[10px] font-medium text-slate-500 sm:text-xs">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>

          {!hasRevenue && (
            <p className="pt-2 text-center text-xs text-slate-400">
              No booking revenue yet. Data updates when bookings are created.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
