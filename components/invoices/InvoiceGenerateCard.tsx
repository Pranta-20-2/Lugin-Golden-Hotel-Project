"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import BillingSummary from "@/components/ui/BillingSummary";
import ProcessLoader from "@/components/ui/ProcessLoader";
import { calculateDueAmount } from "@/lib/bookingCalculations";
import { formatAmount } from "@/lib/formatCurrency";

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
  roomCount,
}: InvoiceGenerateCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [advancePaidInput, setAdvancePaidInput] = useState(String(advancePaid));

  const advanceValue = Number(advancePaidInput) || 0;
  const dueAmount = useMemo(
    () => calculateDueAmount(totalBill, advanceValue),
    [totalBill, advanceValue]
  );
  const advanceExceedsTotal = advanceValue > totalBill;
  const hasValidBilling = nights > 0 && totalBill > 0;

  async function handleGenerate() {
    if (advanceExceedsTotal) {
      toast.error("Advance payment cannot exceed total bill");
      return;
    }

    setLoading(true);
    const payload =
      type === "booking"
        ? { booking_id: sourceId, advance_paid: advanceValue }
        : { group_id: sourceId, advance_paid: advanceValue };

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
          advanceInput={{
            id: "invoiceAdvancePaid",
            value: advancePaidInput,
            onChange: setAdvancePaidInput,
          }}
        />
      </div>
      {advanceExceedsTotal && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          Advance payment cannot exceed total bill ({formatAmount(totalBill)}).
        </p>
      )}
      <p className="mt-3 text-sm text-slate-600">
        Adjust advance payment before generating. The booking and invoice will use
        these amounts.
      </p>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !hasValidBilling || advanceExceedsTotal}
        className="mt-4 h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Invoice"}
      </button>
    </Card>
  );
}
