import Card from "@/components/ui/Card";
import type { InvoicesByStatus } from "@/types/reports";
import { INVOICE_STATUS_COLORS } from "@/types/invoice";
import { formatAmount } from "@/lib/formatCurrency";

type InvoicesByStatusChartProps = {
  data: InvoicesByStatus[];
};

export default function InvoicesByStatusChart({
  data,
}: InvoicesByStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  const circumference = 2 * Math.PI * 54;
  const chartSegments = data.map((item, index) => {
    const previousTotal = data
      .slice(0, index)
      .reduce((sum, current) => sum + current.count, 0);
    const segment = total > 0 ? (item.count / total) * circumference : 0;

    return {
      item,
      dashArray: `${segment} ${circumference - segment}`,
      dashOffset: total > 0 ? -((previousTotal / total) * circumference) : 0,
    };
  });

  return (
    <Card className="h-full">
      <h2 className="mb-1 text-base font-semibold text-slate-900 sm:text-lg">
        Invoices by Status
      </h2>
      <p className="mb-5 text-xs text-slate-500 sm:text-sm">
        Live invoice counts and collected amounts from your database
      </p>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-100">
            <span className="text-2xl font-bold text-slate-400">0</span>
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">
            No invoices yet. Status breakdown appears after invoices are created.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
          <div className="relative mx-auto h-40 w-40 sm:h-44 sm:w-44">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="12"
              />
              {chartSegments.map(({ item, dashArray, dashOffset }) => (
                <circle
                  key={item.status}
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={INVOICE_STATUS_COLORS[item.status]}
                  strokeWidth="12"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{total}</span>
              <span className="text-xs text-slate-500">Invoices</span>
            </div>
          </div>

          <div className="space-y-3">
            {data.map((item) => {
              const width = `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 6 : 0)}%`;

              return (
                <div key={item.status}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: INVOICE_STATUS_COLORS[item.status],
                        }}
                      />
                      <span className="truncate font-medium text-slate-700">
                        {item.label}
                      </span>
                    </div>
                    <span className="shrink-0 font-semibold text-slate-900">
                      {item.count}
                    </span>
                  </div>
                  <div className="mb-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width,
                        backgroundColor: INVOICE_STATUS_COLORS[item.status],
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Collected: {formatAmount(item.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
