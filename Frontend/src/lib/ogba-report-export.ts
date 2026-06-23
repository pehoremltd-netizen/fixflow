import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import {
  type OgbaActivity,
  type OgbaReportEntry,
  type OgbaFrequency,
  type CoverMemo,
  OGBA_ACTIVITIES,
  getFrequencies,
} from "@/lib/store/ogba-reports";

const HEADERS = ["S/No", "Activity", "Frequency", "Report Update", "Notes", "Timestamp"];

/* ── HELPERS ── */

function activitiesForFreq(frequency: OgbaFrequency): OgbaActivity[] {
  return OGBA_ACTIVITIES.filter((a) => a.frequency === frequency);
}

function buildRows(
  frequency: OgbaFrequency,
  entries: Record<string, OgbaReportEntry>
): string[][] {
  const activities = activitiesForFreq(frequency);
  const rows: string[][] = [];
  activities.forEach((act, idx) => {
    const entry = entries[act.id];
    rows.push([
      String(idx + 1),
      act.activity,
      act.frequency,
      entry?.reportUpdate || "",
      entry?.notes || "",
      entry?.timestamp
        ? new Date(entry.timestamp).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "",
    ]);
  });
  return rows;
}

const goldFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB8860B" } };
const goldFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
const goldAlign: Partial<ExcelJS.Alignment> = { horizontal: "center", vertical: "middle" };
const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin" }, left: { style: "thin" },
  bottom: { style: "thin" }, right: { style: "thin" },
};
const altFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F6F0" } };
const darkFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } };
const darkFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
const darkAlign: Partial<ExcelJS.Alignment> = { horizontal: "center", vertical: "middle" };
const COL_WIDTHS = [6, 28, 12, 45, 35, 22];

function buildExcelWorkbook(
  frequency: OgbaFrequency,
  date: string,
  entries: Record<string, OgbaReportEntry>,
  coverMemo?: CoverMemo
): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FixFlow CMMS";
  wb.created = new Date();

  const rows = buildRows(frequency, entries);
  const freqLabel = frequency.toUpperCase();

  // ── COVER SHEET ──
  const cover = wb.addWorksheet("Cover", { properties: { tabColor: { argb: "FFB8860B" } } });
  cover.mergeCells("A1:F1");
  const cTitle = cover.getCell("A1");
  cTitle.value = `FIXFLOW CMMS — KONGA FACILITY OGBA — ${freqLabel} REPORT`;
  cTitle.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  cTitle.fill = darkFill;
  cTitle.alignment = { horizontal: "center", vertical: "middle" };

  cover.mergeCells("A3:F3");
  cover.getCell("A3").value = `Report Period: ${date}`;
  cover.getCell("A3").font = { bold: true, size: 12 };

  cover.mergeCells("A5:F5");
  cover.getCell("A5").value = `Prepared by: ${coverMemo?.preparedBy || "Facility Manager"}`;

  cover.mergeCells("A6:F6");
  cover.getCell("A6").value = `Recipients: ${coverMemo?.recipients || "Head of Admin | COO | Audit | Finance"}`;

  if (coverMemo?.message) {
    cover.mergeCells("A8:F12");
    cover.getCell("A8").value = coverMemo.message;
    cover.getCell("A8").font = { size: 10, italic: true };
    cover.getCell("A8").alignment = { wrapText: true };
  }

  // ── DETAIL SHEET ──
  const ws = wb.addWorksheet(freqLabel, { properties: { tabColor: { argb: "FFB8860B" } } });

  ws.mergeCells(1, 1, 1, 6);
  const title = ws.getCell("A1");
  title.value = `KONGA FACILITY OGBA — ${freqLabel} ACTIVITIES`;
  title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  title.fill = darkFill;
  title.alignment = { horizontal: "center", vertical: "middle" };
  title.border = thinBorder;

  ws.mergeCells(2, 1, 2, 6);
  const period = ws.getCell("A2");
  period.value = `Report Date: ${date}`;
  period.font = { size: 10, italic: true, color: { argb: "FF666666" } };
  period.alignment = { horizontal: "center" };

  const hr = ws.getRow(3);
  HEADERS.forEach((h, i) => {
    const c = hr.getCell(i + 1);
    c.value = h;
    c.fill = darkFill;
    c.font = darkFont;
    c.border = thinBorder;
    c.alignment = darkAlign;
  });

  COL_WIDTHS.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

  rows.forEach((rowData, ri) => {
    const r = ws.getRow(ri + 4);
    rowData.forEach((val, ci) => {
      const c = r.getCell(ci + 1);
      c.value = val;
      c.border = thinBorder;
      c.alignment = {
        horizontal: ci === 0 ? "center" : "left",
        vertical: "top",
        wrapText: true,
      };
      if (ri % 2 === 1) c.fill = altFill;
    });
    r.height = 30;
  });

  if (rows.length > 0) {
    ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + rows.length, column: 6 } };
  }

  return wb;
}

/* ── EXCEL EXPORT (single frequency) ── */

export async function exportFrequencyExcel(
  frequency: OgbaFrequency,
  date: string,
  entries: Record<string, OgbaReportEntry>,
  coverMemo?: CoverMemo
): Promise<void> {
  const wb = buildExcelWorkbook(frequency, date, entries, coverMemo);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Konga_Facility_Ogba_${frequency}_Report_${date}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── PDF EXPORT (single frequency) ── */

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const USABLE_W = PAGE_W - MARGIN * 2;
const GOLD: [number, number, number] = [200, 168, 60];
const DARK: [number, number, number] = [28, 28, 32];
const GRAY: [number, number, number] = [120, 120, 120];

function pdfFooter(doc: jsPDF, p: number, tp: number, ds: string) {
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, PAGE_H - 16, PAGE_W - MARGIN, PAGE_H - 16);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text("FixFlow CMMS  •  Konga Facility Ogba  •  Confidential", MARGIN, PAGE_H - 9);
  doc.text(`${p} / ${tp}`, PAGE_W - MARGIN, PAGE_H - 9, { align: "right" });
}

export async function exportFrequencyPDF(
  frequency: OgbaFrequency,
  date: string,
  entries: Record<string, OgbaReportEntry>,
  coverMemo?: CoverMemo
): Promise<void> {
  const doc = new jsPDF("p", "mm", "a4");
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const freqLabel = frequency.toUpperCase();

  const cards: { activity: OgbaActivity; entry?: OgbaReportEntry }[] = activitiesForFreq(frequency).map(
    (act) => ({ activity: act, entry: entries[act.id] })
  );

  const sectionTitle = `KONGA FACILITY OGBA — ${freqLabel}`;

  const totalPages = Math.max(1, Math.ceil(cards.length / 2));
  if (cards.length === 0) {
    doc.save(`Konga_Facility_Ogba_${frequency}_Report_${date}.pdf`);
    return;
  }

  let currentPage = 1;

  for (let i = 0; i < cards.length; i += 2) {
    if (currentPage > 1) doc.addPage();
    let y = MARGIN;

    // Thin gold bar top
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(0, 0, PAGE_W, 2, "F");

    // Page title (compact, no dark block)
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text(sectionTitle, PAGE_W / 2, 9, { align: "center" });

    // Thin separator
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, 12, PAGE_W - MARGIN, 12);

    y = 18;

    for (let j = i; j < Math.min(i + 2, cards.length); j++) {
      const { activity, entry } = cards[j];
      const startY = y;

      if (y > PAGE_H - 50) {
        pdfFooter(doc, currentPage, totalPages, today);
        doc.addPage();
        currentPage++;
        y = MARGIN;
        doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.rect(0, 0, PAGE_W, 2, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.text(sectionTitle, PAGE_W / 2, 9, { align: "center" });
        doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.setLineWidth(0.2);
        doc.line(MARGIN, 12, PAGE_W - MARGIN, 12);
        y = 18;
      }

      // Calculate card height
      let contentH = 26;
      if (entry?.reportUpdate?.trim()) {
        contentH += doc.splitTextToSize(entry.reportUpdate, USABLE_W - 32).length * 3.5;
      } else {
        contentH += 5;
      }
      if (entry?.notes?.trim()) {
        contentH += doc.splitTextToSize(entry.notes, USABLE_W - 32).length * 3.5;
      } else {
        contentH += 5;
      }
      const cardH = Math.min(Math.max(38, contentH), PAGE_H - y - 16);

      // Card background with border
      doc.setFillColor(252, 251, 248);
      doc.setDrawColor(215, 213, 210);
      doc.roundedRect(MARGIN, y, USABLE_W, cardH, 2.5, 2.5, "FD");

      // Gold left accent
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.roundedRect(MARGIN, y, 3, cardH, 0.8, 0.8, "F");

      let cy = y + 7;
      const num = j + 1;

      // Title + frequency badge inline
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      doc.text(`${num}. ${activity.activity}`, MARGIN + 12, cy);

      // Frequency inline after title
      const titleW = doc.getTextWidth(`${num}. ${activity.activity}`);
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      const fw = doc.getTextWidth(activity.frequency) + 6;
      doc.roundedRect(MARGIN + 12 + titleW + 4, cy - 2.5, fw, 5, 1.5, 1.5, "F");
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(activity.frequency, MARGIN + 12 + titleW + 4 + fw / 2, cy + 0.5, { align: "center" });

      cy += 8;

      // Report Update
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      doc.text("REPORT UPDATE", MARGIN + 12, cy);
      cy += 3.5;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      if (entry?.reportUpdate?.trim()) {
        const ul = doc.splitTextToSize(entry.reportUpdate, USABLE_W - 32);
        doc.text(ul, MARGIN + 12, cy);
        cy += ul.length * 3.5 + 1.5;
      } else {
        doc.setTextColor(190, 190, 190);
        doc.setFont("helvetica", "italic");
        doc.text("— No report update —", MARGIN + 12, cy);
        cy += 5;
      }

      // Notes
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      doc.text("NOTES", MARGIN + 12, cy);
      cy += 3.5;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      if (entry?.notes?.trim()) {
        const nl = doc.splitTextToSize(entry.notes, USABLE_W - 32);
        doc.text(nl, MARGIN + 12, cy);
        cy += nl.length * 3.5 + 1.5;
      } else {
        doc.setTextColor(190, 190, 190);
        doc.setFont("helvetica", "italic");
        doc.text("— No notes —", MARGIN + 12, cy);
        cy += 5;
      }

      // Timestamp
      if (entry?.timestamp) {
        const ts = new Date(entry.timestamp).toLocaleString("en-US", {
          dateStyle: "medium", timeStyle: "short",
        });
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text(`Updated: ${ts}`, PAGE_W - MARGIN - 5, y + cardH - 4, { align: "right" });
      }

      y = startY + cardH + 7;
    }

    pdfFooter(doc, currentPage, totalPages, today);
    currentPage++;
  }

  doc.save(`Konga_Facility_Ogba_${frequency}_Report_${date}.pdf`);
}

/* ── BULK EXPORT ALL FREQUENCIES ── */

export async function exportOgbaReportExcel(
  date: string,
  entries: Record<string, OgbaReportEntry>,
  coverMemo?: CoverMemo
): Promise<void> {
  const frequencies = getFrequencies();
  for (const freq of frequencies) {
    const acts = activitiesForFreq(freq);
    if (acts.length > 0) {
      await exportFrequencyExcel(freq, date, entries, coverMemo);
    }
  }
}

export async function exportOgbaReportPDF(
  date: string,
  entries: Record<string, OgbaReportEntry>,
  coverMemo?: CoverMemo
): Promise<void> {
  const frequencies = getFrequencies();
  for (const freq of frequencies) {
    const acts = activitiesForFreq(freq);
    if (acts.length > 0) {
      await exportFrequencyPDF(freq, date, entries, coverMemo);
    }
  }
}
