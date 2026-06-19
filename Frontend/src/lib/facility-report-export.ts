import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type ReportActivity,
  type ReportEntry,
  type ReportFrequency,
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

export async function exportFacilityReportPDF(
  date: string,
  frequency: ReportFrequency | "All"
): Promise<void> {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  const sections = getReportSections();
  const sectionData = buildRows(sections, frequency, date);

  let hasData = false;
  let titleRendered = false;
  let currentY = 15;

  for (const [idx, { section, rows }] of sectionData.entries()) {
    if (rows.length === 0) continue;
    hasData = true;

    if (idx > 0) {
      doc.addPage();
      currentY = 15;
    }

    // Title (only on first page)
    if (!titleRendered) {
      titleRendered = true;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`FACILITY REPORT - ${date}`, pageWidth / 2, 15, { align: "center" });
      currentY = 25;
    }

    // Section heading
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(section, 14, currentY);

    autoTable(doc, {
      startY: currentY + 4,
      head: [HEADERS],
      body: rows,
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [184, 134, 11],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 45 },
        2: { cellWidth: 65 },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 55 },
        5: { cellWidth: 40 },
        6: { cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1,
    });

    currentY = (doc as any).lastAutoTable?.finalY ?? currentY;
  }

  if (!hasData) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`FACILITY REPORT - ${date}`, pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No report entries for this frequency.", pageWidth / 2, 30, {
      align: "center",
    });
  }

  doc.save(`Facility_Report_${date}.pdf`);
}
