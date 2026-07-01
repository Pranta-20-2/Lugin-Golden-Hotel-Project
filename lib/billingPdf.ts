import type { BillingDocumentData } from "@/lib/billingDocument";
import { getBillingPdfFilename } from "@/lib/billingDocument";

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

export async function downloadBillingPdf(data: BillingDocumentData) {
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
  doc.text(data.documentTitle, MARGIN, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Reference: ${data.referenceNo}`, MARGIN, y);
  doc.text(`Status: ${data.status}`, PAGE_WIDTH - MARGIN, y, { align: "right" });

  y += 12;
  y = addSectionTitle(doc, "Guest Information", y);
  y = addField(doc, "Guest", data.guest, y);
  y = addField(doc, "Mobile", data.mobile, y);

  y += 4;
  y = addSectionTitle(doc, "Booking Details", y);
  y = addField(doc, "Source", data.source, y);
  y = addField(doc, "Stay", data.stay, y);
  y = addField(doc, "Nights", String(data.nights), y);
  if (data.roomCount != null) {
    y = addField(doc, "Rooms", String(data.roomCount), y);
  }
  if (data.showRatePerNight && data.ratePerNight) {
    y = addField(doc, "Rate / Night", data.ratePerNight, y);
  }

  if (data.roomTypeLines && data.roomTypeLines.length > 0) {
    y += 4;
    y = addSectionTitle(doc, "Room Types", y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Room Type", MARGIN, y);
    doc.text("Nights", MARGIN + 70, y);
    doc.text("Rate", MARGIN + 95, y);
    doc.text("Total", MARGIN + 130, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    for (const line of data.roomTypeLines) {
      doc.text(line.name, MARGIN, y);
      doc.text(String(line.nights), MARGIN + 70, y);
      doc.text(line.rate, MARGIN + 95, y);
      doc.text(line.total, MARGIN + 130, y);
      y += 6;
    }
  }

  y += 4;
  y = addSectionTitle(doc, "Billing Summary", y);
  y = addField(doc, "Total Bill", data.totalBill, y);
  y = addField(doc, "Advance Paid", data.advancePaid, y);
  y = addField(doc, "Due Amount", data.dueAmount, y);

  if (data.fullyPaid) {
    y += 4;
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(4, 120, 87);
    doc.text("Fully paid.", MARGIN + 4, y + 2);
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

  doc.save(getBillingPdfFilename(data.referenceNo));
}
