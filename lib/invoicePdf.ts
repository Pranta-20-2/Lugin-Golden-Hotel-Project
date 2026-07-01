import type { InvoiceDocumentData } from "@/lib/invoiceDocument";
import { getInvoicePdfFilename } from "@/lib/invoiceDocument";

const HOTEL_NAME = "Al Asdiqa Al Masia Hotel";
const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addSectionTitle(doc: import("jspdf").jsPDF, title: string, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2);
  return y + 10;
}

function addField(
  doc: import("jspdf").jsPDF,
  label: string,
  value: string,
  y: number
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(label, MARGIN, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const lines = doc.splitTextToSize(value, CONTENT_WIDTH - 55);
  doc.text(lines, MARGIN + 55, y);
  return y + Math.max(lines.length * 5, 6) + 2;
}

export async function downloadInvoicePdf(data: InvoiceDocumentData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text(HOTEL_NAME, MARGIN, y);

  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Invoice", MARGIN, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No: ${data.invoiceNo}`, MARGIN, y);
  doc.text(`Issued: ${data.issuedAt}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });

  y += 6;
  doc.text(`Status: ${data.status}`, MARGIN, y);

  y += 12;
  y = addSectionTitle(doc, "Guest Information", y);
  y = addField(doc, "Guest", data.guest, y);
  y = addField(doc, "Mobile", data.mobile, y);

  y += 4;
  y = addSectionTitle(doc, "Booking Details", y);
  y = addField(doc, "Source", data.source, y);
  y = addField(doc, "Stay", data.stay, y);
  y = addField(doc, "Nights", String(data.nights), y);

  y += 4;
  y = addSectionTitle(doc, "Billing Summary", y);
  y = addField(doc, "Total Bill", data.totalBill, y);
  y = addField(doc, "Amount Paid", data.amountPaid, y);
  y = addField(doc, "Due Amount", data.dueAmount, y);

  if (data.fullyPaid) {
    y += 4;
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(4, 120, 87);
    doc.text("Invoice is fully paid.", MARGIN + 4, y + 2);
    y += 12;
  }

  y += 4;
  y = addSectionTitle(doc, "Notes", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const noteLines = doc.splitTextToSize(data.notes, CONTENT_WIDTH);
  doc.text(noteLines, MARGIN, y);

  y += noteLines.length * 5 + 10;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Thank you for staying with us.", MARGIN, Math.min(y, 285));

  doc.save(getInvoicePdfFilename(data.invoiceNo));
}
