type StatCardProps = {
  label: string;
  value: string;
  trend?: {
    value: string;
    positive: boolean;
  };
};

export default function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </p>
        {trend && (
          <span
            className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend.positive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {trend.positive ? "+" : "-"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
