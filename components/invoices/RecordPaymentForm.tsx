"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import ProcessLoader from "@/components/ui/ProcessLoader";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/types/invoice";
import { formatAmount } from "@/lib/formatCurrency";

type RecordPaymentFormProps = {
  invoiceId: number;
  dueAmount: number;
  disabled?: boolean;
};

const inputClass =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

export default function RecordPaymentForm({
  invoiceId,
  dueAmount,
  disabled = false,
}: RecordPaymentFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(dueAmount));
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        payment_method: method,
        reference,
        notes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.error ?? "Failed to record payment";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    toast.success("Payment recorded successfully");
    router.refresh();
    setLoading(false);
  }

  if (disabled || dueAmount <= 0) {
    return (
      <Card>
        <p className="text-sm text-emerald-700">This invoice is fully paid.</p>
      </Card>
    );
  }

  return (
    <Card>
      <ProcessLoader visible={loading} label="Recording payment" />
      <h3 className="mb-4 text-base font-semibold text-slate-900">Record Payment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              max={dueAmount}
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Maximum due: {formatAmount(dueAmount)}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className={inputClass}
            >
              {PAYMENT_METHODS.map((item) => (
                <option key={item} value={item}>
                  {PAYMENT_METHOD_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Reference <span className="text-slate-400">(optional)</span>
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className={inputClass}
            placeholder="Receipt or transaction ref"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Notes <span className="text-slate-400">(optional)</span>
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Saving..." : "Record Payment"}
        </button>
      </form>
    </Card>
  );
}
