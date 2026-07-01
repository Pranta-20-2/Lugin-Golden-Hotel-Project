import type { InvoiceWithRelations } from "@/types/invoice";
import DeleteInvoiceButton from "@/components/invoices/DeleteInvoiceButton";
import InvoiceDocumentActions from "@/components/invoices/InvoiceDocumentActions";
import InvoicePrintContent from "@/components/invoices/InvoicePrintContent";
import { buildInvoiceDocumentData } from "@/lib/invoiceDocument";

type InvoiceDetailProps = {
  invoice: InvoiceWithRelations;
};

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const documentData = buildInvoiceDocumentData(invoice);

  return (
    <InvoicePrintContent
      invoice={invoice}
      visible
      editHref={`/invoices/${invoice.id}/edit`}
      extraActions={<InvoiceDocumentActions documentData={documentData} />}
      deleteSlot={
        <DeleteInvoiceButton
          id={invoice.id}
          invoiceNo={invoice.invoice_no}
        />
      }
    />
  );
}
