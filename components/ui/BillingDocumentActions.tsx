"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import type { BillingDocumentData } from "@/lib/billingDocument";

type BillingDocumentActionsProps = {
  documentData: BillingDocumentData;
};

export default function BillingDocumentActions({
  documentData,
}: BillingDocumentActionsProps) {
  const [downloading, setDownloading] = useState(false);

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf() {
    setDownloading(true);

    try {
      const { downloadBillingPdf } = await import("@/lib/billingPdf");
      await downloadBillingPdf(documentData);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
      >
        Print
      </button>
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={downloading}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
      >
        {downloading ? "Downloading..." : "Download PDF"}
      </button>
    </>
  );
}
