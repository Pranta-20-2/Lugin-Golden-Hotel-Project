"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import BillingSummary from "@/components/ui/BillingSummary";
import ProcessLoader from "@/components/ui/ProcessLoader";
import { calculateDueAmount } from "@/lib/bookingCalculations";
import { formatAmount, roundMoney } from "@/lib/formatCurrency";

type InvoiceGenerateCardProps = {
  type: "booking" | "group";
  sourceId: number;
  title: string;
  subtitle: string;
  nights: number;
  totalBill: number;
  advancePaid: number;
  dueAmount: number;
  roomCount?: number;
  existingInvoiceId?: number | null;
};

export default function InvoiceGenerateCard({
  type,
  sourceId,
  title,
  subtitle,
  nights,
  totalBill,
  advancePaid,
  dueAmount: initialDueAmount,
  roomCount,
}: InvoiceGenerateCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recentPayment, setRecentPayment] = useState(
    String(roundMoney(initialDueAmount))
  );

  const recentPaymentValue = Number(recentPayment) || 0;
  const amountPaid = roundMoney(Number(advancePaid) + recentPaymentValue);
  const dueAmount = useMemo(
    () => calculateDueAmount(totalBill, amountPaid),
    [totalBill, amountPaid]
  );
  const paymentExceedsTotal = amountPaid > totalBill;
  const hasValidBilling = nights > 0 && totalBill > 0;
  const hasDueRemaining = dueAmount > 0;
  const canGenerate = hasValidBilling && !paymentExceedsTotal && !hasDueRemaining;

  async function handleGenerate() {
    if (paymentExceedsTotal) {
      toast.error("Total paid amount cannot exceed total bill");
      return;
    }
    if (hasDueRemaining) {
      toast.error("Due amount must be 0 before generating invoice");
      return;
    }

    setLoading(true);
    const payload =
      type === "booking"
        ? { booking_id: sourceId, advance_paid: amountPaid }
        : { group_id: sourceId, advance_paid: amountPaid };

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Failed to generate invoice");
      setLoading(false);
      return;
    }

    toast.success("Invoice generated successfully");
    router.push(`/invoices/${data.id}`);
    router.refresh();
  }

  return (
    <Card className="mb-5 border border-primary/20 bg-blue-50/40">
      <ProcessLoader visible={loading} label="Generating invoice" />
      <h2 className="text-base font-semibold text-slate-900">Generate Invoice</h2>
      <p className="mt-1 text-sm text-slate-600">
        {title} · {subtitle}
      </p>
      <div className="mt-4">
        <BillingSummary
          roomCount={roomCount}
          nights={nights}
          ratePerNight={0}
          showRatePerNight={false}
          totalBill={totalBill}
          dueAmount={dueAmount}
          advancePaid={advancePaid}
          recentPaymentInput={{
            id: "invoiceRecentPayment",
            value: recentPayment,
            onChange: setRecentPayment,
          }}
        />
      </div>
      {paymentExceedsTotal && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          Total paid amount cannot exceed total bill ({formatAmount(totalBill)}).
        </p>
      )}
      <div className="mt-4">
        <label
          htmlFor="invoiceDueAmount"
          className="mb-1.5 block text-sm font-medium text-slate-600"
        >
          Due Amount
        </label>
        <input
          id="invoiceDueAmount"
          type="text"
          value={formatAmount(dueAmount)}
          readOnly
          className={`h-11 w-full rounded-xl border-0 bg-white px-4 text-sm font-semibold ring-1 focus:outline-none ${
            hasDueRemaining
              ? "text-amber-700 ring-amber-200"
              : "text-emerald-700 ring-emerald-200"
          }`}
        />
      </div>
      {hasDueRemaining ? (
        <p className="mt-3 text-sm text-amber-700" role="alert">
          Invoice can be generated only after the full bill is paid in cash.
          Enter the remaining cash amount in Recent Payment until due amount is{" "}
          {formatAmount(0)}.
        </p>
      ) : (
        <p className="mt-3 text-sm font-medium text-emerald-700">
          Full bill paid. Invoice is ready to generate.
        </p>
      )}
      <p className="mt-3 text-sm text-slate-600">
        Advance payment is the existing paid amount. Add the latest cash
        received as recent payment before generating the invoice.
      </p>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !canGenerate}
        className="mt-4 h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Invoice"}
      </button>
    </Card>
  );
}
