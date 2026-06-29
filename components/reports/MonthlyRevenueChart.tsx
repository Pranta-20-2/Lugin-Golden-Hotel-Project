import Card from "@/components/ui/Card";
import type { MonthlyRevenue } from "@/types/reports";
import { formatAmount } from "@/lib/formatCurrency";

type MonthlyRevenueChartProps = {
  data: MonthlyRevenue[];
};

export default function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <Card className="h-full">
      <h2 className="mb-1 text-base font-semibold text-slate-900 sm:text-lg">
        Monthly Collected Revenue
      </h2>
      <p className="mb-5 text-xs text-slate-500 sm:text-sm">
        Cash collected from invoices grouped by issue month
      </p>

      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No invoice revenue yet. Data appears after invoices are generated.
        </p>
      ) : (
        <div className="flex h-64 items-end gap-3 rounded-2xl bg-slate-50 px-3 pb-3 pt-6 sm:gap-4 sm:px-5">
          {data.map((item) => {
            const height = `${Math.max((item.revenue / maxRevenue) * 100, item.revenue > 0 ? 4 : 0)}%`;

            return (
              <div
                key={item.month}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                  {formatAmount(item.revenue)}
                </span>
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-primary to-blue-400 shadow-sm transition-all"
                    style={{ height }}
                  />
                </div>
                <span className="w-full truncate text-center text-[10px] font-medium text-slate-500 sm:text-xs">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
