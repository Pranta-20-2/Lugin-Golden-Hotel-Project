import { formatAmount } from "@/lib/formatCurrency";

type BillingSummaryProps = {
  nights: number;
  ratePerNight: number;
  totalBill: number;
  dueAmount: number;
  advancePaid?: number;
  paidLabel?: string;
  advanceInput?: {
    id: string;
    value: string;
    onChange: (value: string) => void;
  };
  recentPaymentInput?: {
    id: string;
    value: string;
    onChange: (value: string) => void;
  };
  roomCount?: number;
  showRatePerNight?: boolean;
  alwaysShowAmounts?: boolean;
};

function SummaryRow({
  label,
  value,
  highlight,
  bold,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 py-3 last:border-b-0">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span
        className={`text-sm tabular-nums ${
          bold || highlight
            ? "text-base font-bold text-emerald-600"
            : "font-semibold text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function BillingSummary({
  nights,
  ratePerNight,
  totalBill,
  dueAmount,
  advancePaid,
  paidLabel = "Advance Payment",
  advanceInput,
  recentPaymentInput,
  roomCount,
  showRatePerNight = true,
  alwaysShowAmounts = false,
}: BillingSummaryProps) {
  const showNights = nights > 0;
  const showTotals = alwaysShowAmounts || showNights;
  const advanceValue = advanceInput
    ? Number(advanceInput.value) || 0
    : (advancePaid ?? 0);

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Billing Calculation
      </p>

      <div className="space-y-0">
        {roomCount != null && roomCount > 0 && (
          <SummaryRow label="Total Rooms" value={String(roomCount)} />
        )}
        <SummaryRow
          label="Nights"
          value={showNights ? String(nights) : "—"}
        />
        {showRatePerNight && (
          <SummaryRow
            label="Rate / Night"
            value={ratePerNight > 0 ? formatAmount(ratePerNight) : "—"}
          />
        )}
        <SummaryRow
          label="Total Bill"
          value={showTotals ? formatAmount(totalBill) : "—"}
          highlight
          bold
        />

        {advanceInput ? (
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 py-3">
            <label
              htmlFor={advanceInput.id}
              className="text-sm font-medium text-slate-600"
            >
              {paidLabel}
            </label>
            <input
              id={advanceInput.id}
              type="number"
              min="0"
              step="1"
              value={advanceInput.value}
              onChange={(e) => advanceInput.onChange(e.target.value)}
              className="h-10 w-36 rounded-lg border-0 bg-white px-3 text-right text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        ) : (
          <SummaryRow
            label={paidLabel}
            value={formatAmount(advanceValue)}
          />
        )}

        {recentPaymentInput && (
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 py-3">
            <label
              htmlFor={recentPaymentInput.id}
              className="text-sm font-medium text-slate-600"
            >
              Recent Payment
            </label>
            <input
              id={recentPaymentInput.id}
              type="number"
              min="0"
              step="1"
              value={recentPaymentInput.value}
              onChange={(e) => recentPaymentInput.onChange(e.target.value)}
              className="h-10 w-36 rounded-lg border-0 bg-white px-3 text-right text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <SummaryRow
          label="Due Amount"
          value={showTotals ? formatAmount(dueAmount) : "—"}
          highlight
          bold
        />
      </div>
    </div>
  );
}
