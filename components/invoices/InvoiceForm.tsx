"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { InvoiceWithRelations } from "@/types/invoice";
import { getInvoiceGuest } from "@/types/invoice";
import Card from "@/components/ui/Card";
import BillingSummary from "@/components/ui/BillingSummary";
import ProcessLoader from "@/components/ui/ProcessLoader";
import { calculateDueAmount, calculateNights } from "@/lib/bookingCalculations";
import { formatAmount, roundMoney } from "@/lib/formatCurrency";
import { updateInvoiceSchema } from "@/validators/invoice.schema";

type InvoiceFormProps = {
  invoice: InvoiceWithRelations;
};

export default function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter();
  const advancePaid = roundMoney(Number(invoice.amount_paid ?? 0));
  const [recentPayment, setRecentPayment] = useState(
    String(roundMoney(Number(invoice.due_amount ?? 0)))
  );
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const booking = invoice.bookings;
  const group = invoice.booking_groups;
  const nights =
    booking?.nights ??
    (group ? calculateNights(group.check_in, group.check_out) : 0);
  const totalBill = Number(invoice.total_bill ?? 0);
  const recentPaymentValue = Number(recentPayment) || 0;
  const amountPaid = roundMoney(advancePaid + recentPaymentValue);
  const dueAmount = useMemo(
    () => calculateDueAmount(totalBill, amountPaid),
    [totalBill, amountPaid]
  );
  const paymentExceedsTotal = amountPaid > totalBill;
  const hasDueRemaining = dueAmount > 0;

  function goBack() {
    router.push(`/invoices/${invoice.id}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = updateInvoiceSchema.safeParse({
      amount_paid: amountPaid,
      notes,
    });

    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      setError(message);
      toast.error(message);
      return;
    }

    if (paymentExceedsTotal) {
      const message = "Total paid amount cannot exceed total bill";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/invoices/${invoice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.error ?? "Something went wrong";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    toast.success("Invoice updated successfully");
    router.push(`/invoices/${invoice.id}`);
    router.refresh();
  }

  return (
    <Card>
      <ProcessLoader visible={loading} label="Updating invoice" />
      <h2 className="mb-1 text-base font-semibold text-slate-900 sm:text-lg">
        Edit Invoice
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        {invoice.invoice_no} · {getInvoiceGuest(invoice)}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <BillingSummary
          nights={nights}
          ratePerNight={0}
          showRatePerNight={false}
          alwaysShowAmounts
          totalBill={totalBill}
          dueAmount={dueAmount}
          advancePaid={advancePaid}
          recentPaymentInput={{
            id: "invoiceEditRecentPayment",
            value: recentPayment,
            onChange: setRecentPayment,
          }}
        />

        {paymentExceedsTotal && (
          <p className="text-sm text-red-600" role="alert">
            Total paid amount cannot exceed total bill ({formatAmount(totalBill)}).
          </p>
        )}

        <div>
          <label
            htmlFor="invoiceEditDueAmount"
            className="mb-1.5 block text-sm font-medium text-slate-600"
          >
            Due Amount
          </label>
          <input
            id="invoiceEditDueAmount"
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

        <p className="text-sm text-slate-600">
          Advance payment is the amount already paid. Update recent payment to
          reflect the latest cash received.
        </p>

        <div>
          <label
            htmlFor="invoiceNotes"
            className="mb-1.5 block text-sm font-medium text-slate-600"
          >
            Notes
          </label>
          <textarea
            id="invoiceNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Optional notes"
          />
        </div>

        {error && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={loading || paymentExceedsTotal}
            className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update"}
          </button>
          <button
            type="button"
            onClick={goBack}
            className="h-11 rounded-xl bg-slate-100 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}
