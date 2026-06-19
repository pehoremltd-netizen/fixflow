import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type ReportActivity,
  type ReportEntry,
  type ReportFrequency,
  type CoverMemo,
  getReportActivities,
  getReportSections,
  loadReport,
} from "@/lib/store/facility-reports";

const HEADERS = ["S/No", "Activities", "Tasks", "Frequency", "Report Update", "Notes", "Timestamp"];

function filterActivities(activities: ReportActivity[], frequency: ReportFrequency | "All"): ReportActivity[] {
  if (frequency === "All") return activities;
  return activities.filter((a) => a.frequency === frequency);
}

function buildRows(
  sections: string[],
  frequency: ReportFrequency | "All",
  date: string
): { section: string; rows: string[][] }[] {
  const report = loadReport(date);
  const result: { section: string; rows: string[][] }[] = [];
  let sno = 0;

  for (const section of sections) {
    const activities = filterActivities(getReportActivities(section), frequency);
    if (activities.length === 0) continue;

    const rows: string[][] = [];
    for (const act of activities) {
      sno++;
      const entry = report.entries[act.id];
      rows.push([
        String(sno),
        act.activity,
        act.tasks,
        act.frequency,
        entry?.reportUpdate ?? "",
        entry?.notes ?? "",
        entry?.timestamp ?? "",
      ]);
    }
    result.push({ section, rows });
  }

  return result;
}

export async function exportFacilityReportExcel(
  date: string,
  frequency: ReportFrequency | "All"
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sections = getReportSections();
  const sectionData = buildRows(sections, frequency, date);

  const headerStyle: Partial<ExcelJS.Style> = {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFB8860B" } },
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const dataBorder: Partial<ExcelJS.Style> = {
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const columnWidths = [6, 30, 45, 12, 40, 30, 20];

  for (const { section, rows } of sectionData) {
    const worksheet = workbook.addWorksheet(section, {
      properties: { tabColor: { argb: "FFB8860B" } },
    });

    // Title row
    worksheet.mergeCells(1, 1, 1, 7);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `FACILITY REPORT - ${date}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center" };
    titleCell.border = dataBorder.border!;

    // Section header row
    worksheet.mergeCells(2, 1, 2, 7);
    const sectionCell = worksheet.getCell("A2");
    sectionCell.value = section;
    sectionCell.font = { bold: true, size: 11 };
    sectionCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF5F0DC" },
    };
    sectionCell.alignment = { horizontal: "center" };
    sectionCell.border = dataBorder.border!;

    // Column headers
    const headerRow = worksheet.getRow(3);
    HEADERS.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.fill = headerStyle.fill!;
      cell.font = headerStyle.font!;
      cell.border = headerStyle.border!;
      cell.alignment = { horizontal: "center" };
    });

    // Set column widths
    columnWidths.forEach((w, i) => {
      worksheet.getColumn(i + 1).width = w;
    });

    // Data rows
    rows.forEach((rowData, rowIndex) => {
      const row = worksheet.getRow(rowIndex + 4);
      rowData.forEach((val, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = val;
        cell.border = dataBorder.border!;
        if (colIndex === 0) cell.alignment = { horizontal: "center" };
      });
    });

    // Auto filter
    worksheet.autoFilter = {
      from: { row: 3, column: 1 },
      to: { row: 3 + rows.length, column: 7 },
    };
  }

  if (sectionData.length === 0) {
    const worksheet = workbook.addWorksheet("Report");
    worksheet.mergeCells(1, 1, 1, 7);
    const cell = worksheet.getCell("A1");
    cell.value = `FACILITY REPORT - ${date}`;
    cell.font = { bold: true, size: 14 };
    cell.alignment = { horizontal: "center" };

    worksheet.mergeCells(2, 1, 2, 7);
    const msg = worksheet.getCell("A2");
    msg.value = "No report entries for this frequency.";
    msg.alignment = { horizontal: "center" };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Facility_Report_${date}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── PDF Export Helpers ── */
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const USABLE_W = PAGE_W - MARGIN * 2;
const GOLD = [212, 160, 23] as [number, number, number];
const DARK = [26, 26, 26] as [number, number, number];
const LIGHT_GRAY = [245, 245, 245] as [number, number, number];

function pdfFooter(doc: jsPDF, pageNum: number, totalPages: number, dateStr: string) {
  const y = PAGE_H - 12;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("FixFlow Facility Management System | Confidential", MARGIN, y);
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W / 2, y, { align: "center" });
  doc.text(`Generated: ${dateStr}`, PAGE_W - MARGIN, y, { align: "right" });
}

function drawGoldLine(doc: jsPDF, y: number) {
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

/* ── MASTER PDF EXPORT ── */
export async function exportFacilityReportPDF(
  date: string,
  frequency: ReportFrequency | "All",
  coverMemo?: CoverMemo,
  docRef?: string
): Promise<void> {
  const doc = new jsPDF("p", "mm", "a4");
  const report = loadReport(date);
  const sections = getReportSections();
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Build activity cards data (filtered by frequency)
  const cards: { activity: ReportActivity; entry?: ReportEntry }[] = [];
  for (const section of sections) {
    const activities = filterActivities(getReportActivities(section), frequency);
    for (const act of activities) {
      cards.push({ activity: act, entry: report.entries[act.id] });
    }
  }

  const recipients = coverMemo?.recipients?.length
    ? coverMemo.recipients.join(" | ")
    : "Admin | Audit | Finance | COO";

  const preparedBy = coverMemo?.preparedBy || "Admin User";
  const refNumber = docRef || "FF-2026-001";

  /* ── COVER PAGE ── */
  let y = MARGIN + 6;

  // Header line
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("FixFlow Facility Management System", MARGIN, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Ref: ${refNumber}`, PAGE_W - MARGIN, y, { align: "right" });
  y += 5;
  drawGoldLine(doc, y);
  y += 14;

  // Title block
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("FACILITY ACTIVITY REPORT", PAGE_W / 2, y, { align: "center" });
  y += 9;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Daily Activities, Processes and Documentation", PAGE_W / 2, y, { align: "center" });
  y += 16;

  // Info block
  const infoX = MARGIN + 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("Facility:", infoX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Ogba Facility", infoX + 32, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("Submitted to:", infoX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(recipients, infoX + 32, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("Prepared by:", infoX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(preparedBy, infoX + 32, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("Date:", infoX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(todayFormatted, infoX + 32, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("Report Period:", infoX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(frequency === "All" ? "All Activities" : frequency, infoX + 32, y);
  y += 14;

  drawGoldLine(doc, y);
  y += 10;

  // Cover message
  if (coverMemo?.message?.trim()) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    doc.text("Message:", MARGIN, y);
    y += 6;
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const msgLines = doc.splitTextToSize(coverMemo.message.trim(), USABLE_W);
    for (const line of msgLines) {
      if (y > PAGE_H - 24) {
        pdfFooter(doc, 1, 1, todayFormatted);
        doc.addPage();
        y = MARGIN + 10;
      }
      doc.text(line, MARGIN, y);
      y += 5;
    }
  }

  // Cover page footer
  pdfFooter(doc, 1, 1, todayFormatted);

  /* ── ACTIVITY CARDS PAGES ── */
  if (cards.length === 0) {
    doc.save(`Facility_Report_${date}.pdf`);
    return;
  }

  // Calculate total pages for footer
  // Approximate: each card takes about 40-55mm, so 3-4 per page
  const CARD_HEIGHT = 44;
  const cardsPerPage = 3;
  const totalActivityPages = Math.max(1, Math.ceil(cards.length / cardsPerPage));
  const totalPages = 1 + totalActivityPages;
  let pageNum = 2;

  for (let i = 0; i < cards.length; i += cardsPerPage) {
    doc.addPage();
    y = MARGIN + 6;

    // Section title on each activity page
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    doc.text("Activity Report Details", PAGE_W / 2, y, { align: "center" });
    y += 3;
    drawGoldLine(doc, y);
    y += 8;

    for (let j = i; j < Math.min(i + cardsPerPage, cards.length); j++) {
      const { activity, entry } = cards[j];
      const cardStartY = y;
      const cardH = Math.min(CARD_HEIGHT, PAGE_H - y - 20);
      if (cardH < 30) {
        pdfFooter(doc, pageNum, totalPages, todayFormatted);
        doc.addPage();
        pageNum++;
        y = MARGIN + 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Activity Report Details", PAGE_W / 2, y, { align: "center" });
        y += 3;
        drawGoldLine(doc, y);
        y += 8;
      }

      // Card background
      doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
      doc.roundedRect(MARGIN, y, USABLE_W, cardH, 1.5, 1.5, "F");
      doc.setDrawColor(210, 210, 210);
      doc.roundedRect(MARGIN, y, USABLE_W, cardH, 1.5, 1.5, "S");

      // Card content
      let cy = y + 5;

      // Activity name
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      doc.text(activity.activity, MARGIN + 4, cy);
      cy += 6;

      // Frequency badge
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.setTextColor(255, 255, 255);
      const freqW = doc.getTextWidth(activity.frequency) + 5;
      doc.roundedRect(MARGIN + 4, cy - 3, freqW, 5.5, 1, 1, "F");
      doc.text(activity.frequency, MARGIN + 4 + freqW / 2, cy + 0.5, { align: "center" });
      doc.setTextColor(50, 50, 50);
      cy += 8;

      // Report Update
      if (entry?.reportUpdate) {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(DARK[0], DARK[1], DARK[2]);
        doc.text("Report Update:", MARGIN + 4, cy);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const updateLines = doc.splitTextToSize(entry.reportUpdate, USABLE_W - 20);
        doc.text(updateLines, MARGIN + 4, cy + 4);
        cy += 6 + updateLines.length * 4;
      } else {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(160, 160, 160);
        doc.text("No report update provided", MARGIN + 4, cy);
        cy += 6;
      }

      // Notes
      if (entry?.notes) {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(DARK[0], DARK[1], DARK[2]);
        doc.text("Notes:", MARGIN + 4, cy);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const notesLines = doc.splitTextToSize(entry.notes, USABLE_W - 20);
        doc.text(notesLines, MARGIN + 4, cy + 4);
        cy += 6 + notesLines.length * 4;
      }

      // Timestamp
      if (entry?.timestamp) {
        const ts = new Date(entry.timestamp).toLocaleTimeString("en-US", {
          hour: "numeric", minute: "2-digit", hour12: true,
        });
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(140, 140, 140);
        doc.text(`Logged: ${ts}`, PAGE_W - MARGIN - 4, cy, { align: "right" });
      }

      y = cardStartY + cardH + 6;
    }

    pdfFooter(doc, pageNum, totalPages, todayFormatted);
    pageNum++;
  }

  doc.save(`Facility_Report_${date}.pdf`);
}
