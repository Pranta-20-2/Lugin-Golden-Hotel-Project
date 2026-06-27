import Card from "@/components/ui/Card";
import type { BookingsByStatus } from "@/types/dashboard";
import { BOOKING_STATUS_COLORS } from "@/types/dashboard";

type BookingsByStatusChartProps = {
  data: BookingsByStatus[];
};

export default function BookingsByStatusChart({
  data,
}: BookingsByStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const activeData = data.filter((d) => d.count > 0);

  const circumference = 2 * Math.PI * 54;
  const chartSegments = activeData.map((item, index) => {
    const previousTotal = activeData
      .slice(0, index)
      .reduce((sum, current) => sum + current.count, 0);
    const segment = (item.count / total) * circumference;

    return {
      item,
      dashArray: `${segment} ${circumference - segment}`,
      dashOffset: -((previousTotal / total) * circumference),
    };
  });

  return (
    <Card className="h-full">
      <h2 className="mb-1 text-base font-semibold text-slate-900 sm:text-lg">
        Bookings by Status
      </h2>
      <p className="mb-5 text-xs text-slate-500 sm:text-sm">
        Live count from your bookings table
      </p>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-100">
            <span className="text-2xl font-bold text-slate-400">0</span>
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">
            No bookings yet. Status breakdown appears after bookings are added.
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
                  stroke={BOOKING_STATUS_COLORS[item.status]}
                  strokeWidth="12"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{total}</span>
              <span className="text-xs text-slate-500">Total</span>
            </div>
          </div>

          <div className="space-y-3">
            {data.map((item) => {
              const width = `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 6 : 0)}%`;

              return (
                <div key={item.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: BOOKING_STATUS_COLORS[item.status],
                        }}
                      />
                      <span className="font-medium text-slate-700">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width,
                        backgroundColor: BOOKING_STATUS_COLORS[item.status],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
