"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Plus, Search, AlertTriangle, CheckCircle2, FileText,
  ClipboardCheck, Wrench, Zap, Users, Briefcase, Package,
  AlertTriangle as SafetyIcon, Building2, Shield, Eye, Edit, Trash2,
  TrendingUp, TrendingDown, BarChart3, Calculator, Printer, Download,
  Calendar, Building, Target,
} from "lucide-react";
import {
  loadBudgets, deleteBudget, approveBudget, submitBudget,
  formatCurrency, formatCurrencyShort,
  type BudgetProposal, type BudgetPeriod,
} from "@/lib/budgetCalculator";
import { getPeriodLabel, getStatusColor, getFacilityTypes } from "@/lib/budgetTemplate";
import { getPdMSummary } from "@/lib/predictiveMaintenanceBudget";
import PremiumBudgetForm from "@/components/PremiumBudgetForm";
import PremiumBudgetReport from "@/components/PremiumBudgetReport";

const PERIOD_ICONS: Record<string, React.ElementType> = {
  monthly: Calendar, quarterly: BarChart3, yearly: FileText,
};

const PERIOD_COLORS: Record<string, string> = {
  monthly: "var(--color-info)", quarterly: "var(--color-primary)", yearly: "var(--color-success)",
};

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"all" | BudgetPeriod>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<BudgetProposal | null>(null);
  const [formPeriod, setFormPeriod] = useState<BudgetPeriod | undefined>();

  const [reportBudget, setReportBudget] = useState<BudgetProposal | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const loadData = () => {
    setBudgets(loadBudgets());
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const pdmSummary = getPdMSummary();

  const filtered = budgets.filter((b) => {
    if (periodFilter !== "all" && b.period !== periodFilter) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.budgetControlNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openForm = (period?: BudgetPeriod, existing?: BudgetProposal) => {
    setFormPeriod(period);
    setEditBudget(existing || null);
    setFormOpen(true);
  };

  const handleView = (b: BudgetProposal) => {
    setReportBudget(b);
    setReportOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBudget(id);
    setBudgets(loadBudgets());
    setDeleteConfirm(null);
    showToast("Budget deleted", "success");
  };

  const handleApprove = (id: string) => {
    const adminName = "Admin User";
    approveBudget(id, adminName);
    setBudgets(loadBudgets());
    setReportBudget(loadBudgets().find((b) => b.id === id) || null);
    showToast("Budget approved", "success");
  };

  const handleSubmit = (id: string) => {
    submitBudget(id);
    setBudgets(loadBudgets());
    setReportBudget(loadBudgets().find((b) => b.id === id) || null);
    showToast("Budget submitted for approval", "success");
  };

  const [exportOpen, setExportOpen] = useState(false);

  async function exportExcel() {
    try {
      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      wb.creator = "FixFlow CMMS";
      wb.created = new Date();

      const GOLD = "FFD4A017";
      const DARK = "FF1A1A1A";
      const WHITE = "FFFFFFFF";
      const LIGHT_GRAY = "FFF5F5F5";
      const GREEN = "FF22C55E";
      const RED = "FFEF4444";
      const BLUE = "FF3B82F6";
      const ORANGE = "FFF59E0B";
      const GRAY = "FF666666";

      function goldCell(cell: any, text: string, fontSize = 14, bold = true) {
        cell.value = text;
        cell.font = { name: "Calibri", size: fontSize, bold, color: { argb: "FF000000" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFB8860B" } },
          bottom: { style: "thin", color: { argb: "FFB8860B" } },
          left: { style: "thin", color: { argb: "FFB8860B" } },
          right: { style: "thin", color: { argb: "FFB8860B" } },
        };
      }

      function headerCell(cell: any, text: string) {
        cell.value = text;
        cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: WHITE } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FFB8860B" } },
          bottom: { style: "thin", color: { argb: "FFB8860B" } },
          left: { style: "thin", color: { argb: "FFB8860B" } },
          right: { style: "thin", color: { argb: "FFB8860B" } },
        };
      }

      function dataCell(cell: any, text: string | number, isBold = false, color = "FF333333") {
        cell.value = text;
        cell.font = { name: "Calibri", size: 10, bold: isBold, color: { argb: color } };
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
      }

      function amountCell(cell: any, val: number, isBold = false) {
        cell.value = val;
        cell.numFmt = '#,##0.00';
        cell.font = { name: "Calibri", size: 10, bold: isBold, color: { argb: "FF333333" } };
        cell.alignment = { horizontal: "right", vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
      }

      function kpiCell(cell: any, label: string, value: string | number, accent: string) {
        cell.value = label;
        cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: accent } };
        cell.alignment = { horizontal: "center", vertical: "bottom" };
      }

      function kpiValueCell(cell: any, value: string | number) {
        cell.value = value;
        cell.font = { name: "Calibri", size: 18, bold: true, color: { argb: "FF333333" } };
        cell.alignment = { horizontal: "center", vertical: "top" };
      }

      // ═══ SHEET 1: EXECUTIVE DASHBOARD ═══
      const ws1 = wb.addWorksheet("Executive Dashboard", { properties: { tabColor: { argb: GOLD } } });
      ws1.columns = [
        { width: 3 }, { width: 18 }, { width: 3 }, { width: 18 }, { width: 3 },
        { width: 18 }, { width: 3 }, { width: 18 }, { width: 3 },
      ];

      // Row 1: Title banner
      ws1.mergeCells("B1:H1");
      const titleCell = ws1.getCell("B1");
      goldCell(titleCell, "FIXFLOW BUDGET DASHBOARD — EXECUTIVE SUMMARY", 16);
      ws1.getRow(1).height = 36;

      // Row 2: Subtitle
      ws1.mergeCells("B2:H2");
      const subCell = ws1.getCell("B2");
      subCell.value = `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}  |  Prepared for Board of Directors`;
      subCell.font = { name: "Calibri", size: 9, italic: true, color: { argb: GRAY } };
      subCell.alignment = { horizontal: "center", vertical: "middle" };
      ws1.getRow(2).height = 22;

      // Row 4-5: KPI Cards
      const annualTotal = budgets.filter((b) => b.period === "yearly").reduce((s, b) => s + b.grandTotal, 0);
      const quarterlyTotal = budgets.filter((b) => b.period === "quarterly").reduce((s, b) => s + b.grandTotal, 0);
      const monthlyTotal = budgets.filter((b) => b.period === "monthly").reduce((s, b) => s + b.grandTotal, 0);
      const grandTotal = budgets.reduce((s, b) => s + b.grandTotal, 0);
      const approvedCount = budgets.filter((b) => b.status === "approved").length;
      const pendingCount = budgets.filter((b) => b.status === "draft" || b.status === "submitted").length;

      const kpis = [
        { label: "TOTAL PORTFOLIO", value: formatCurrency(grandTotal), col: 2, accent: GOLD },
        { label: "ANNUAL COMMITMENT", value: formatCurrency(annualTotal), col: 4, accent: BLUE },
        { label: "APPROVED BUDGETS", value: `${approvedCount} of ${budgets.length}`, col: 6, accent: GREEN },
        { label: "PENDING REVIEW", value: `${pendingCount} budgets`, col: 8, accent: ORANGE },
      ];

      ws1.getRow(4).height = 28;
      ws1.getRow(5).height = 36;

      for (const kpi of kpis) {
        const labelCell = ws1.getCell(4, kpi.col);
        kpiCell(labelCell, kpi.label, "", kpi.accent);
        const valCell = ws1.getCell(5, kpi.col);
        kpiValueCell(valCell, kpi.value);
        // Card border via cell borders
        [4, 5].forEach((r) => {
          for (let c = kpi.col - 1; c <= kpi.col + 1; c++) {
            if (c >= 1 && c <= 9) {
              const cell = ws1.getCell(r, c);
              cell.border = {
                top: { style: "thin", color: { argb: "FFE0E0E0" } },
                bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
                left: { style: "thin", color: { argb: "FFE0E0E0" } },
                right: { style: "thin", color: { argb: "FFE0E0E0" } },
              };
              if (r === 4) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F8F8" } };
            }
          }
        });
      }

      // Row 7: "Budget by Period" section header
      ws1.mergeCells("B7:H7");
      goldCell(ws1.getCell("B7"), "BUDGET BY PERIOD", 12);
      ws1.getRow(7).height = 28;

      // Row 8-11: Period breakdown table with data bars
      const periodHeaders = ["Period", "Count", "Total Value"];
      const periodData = [
        { label: "Annual", count: budgets.filter((b) => b.period === "yearly").length, total: annualTotal },
        { label: "Quarterly", count: budgets.filter((b) => b.period === "quarterly").length, total: quarterlyTotal },
        { label: "Monthly", count: budgets.filter((b) => b.period === "monthly").length, total: monthlyTotal },
      ];
      const maxPeriodTotal = Math.max(...periodData.map((p) => p.total), 1);

      // Headers
      for (let c = 0; c < periodHeaders.length; c++) {
        headerCell(ws1.getCell(8, 2 + c), periodHeaders[c]);
      }
      ws1.getRow(8).height = 22;

      // Data
      for (let r = 0; r < periodData.length; r++) {
        const row = 9 + r;
        dataCell(ws1.getCell(row, 2), periodData[r].label, true);
        dataCell(ws1.getCell(row, 3), periodData[r].count);
        amountCell(ws1.getCell(row, 4), periodData[r].total);
        ws1.getRow(row).height = 20;
      }
      ws1.mergeCells("E8:H8");
      const barHeader = ws1.getCell("E8");
      barHeader.value = "Visual Comparison";
      barHeader.font = { name: "Calibri", size: 10, bold: true, color: { argb: WHITE } };
      barHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
      barHeader.alignment = { horizontal: "center", vertical: "middle" };

      // Add period bar data using REPT formula for visual bars
      const barChars = "█";
      for (let r = 0; r < periodData.length; r++) {
        const row = 9 + r;
        const pct = periodData[r].total / maxPeriodTotal;
        const barLen = Math.max(1, Math.round(pct * 30));
        ws1.getCell(row, 5).value = barChars.repeat(barLen);
        ws1.getCell(row, 5).font = { name: "Calibri", size: 10, color: { argb: GOLD } };
        ws1.mergeCells(`E${row}:H${row}`);
        ws1.getCell(row, 5).alignment = { horizontal: "left", vertical: "middle" };
      }

      // Row 13: "Budget Status Overview" section
      ws1.mergeCells("B13:H13");
      goldCell(ws1.getCell("B13"), "BUDGET STATUS OVERVIEW", 12);
      ws1.getRow(13).height = 28;

      // Status breakdown
      const statuses = [
        { label: "Approved", color: GREEN, budgets: budgets.filter((b) => b.status === "approved") },
        { label: "Submitted", color: ORANGE, budgets: budgets.filter((b) => b.status === "submitted") },
        { label: "Draft", color: GRAY, budgets: budgets.filter((b) => b.status === "draft") },
        { label: "Rejected", color: RED, budgets: budgets.filter((b) => b.status === "rejected") },
      ];
      const maxStatusTotal = Math.max(...statuses.map((s) => s.budgets.reduce((sum, b) => sum + b.grandTotal, 0)), 1);

      const statusHeaders = ["Status", "Count", "Total Value"];
      for (let c = 0; c < statusHeaders.length; c++) {
        headerCell(ws1.getCell(14, 2 + c), statusHeaders[c]);
      }
      ws1.getRow(14).height = 22;
      ws1.mergeCells("E14:H14");
      const sbHeader = ws1.getCell("E14");
      sbHeader.value = "Visual Comparison";
      sbHeader.font = { name: "Calibri", size: 10, bold: true, color: { argb: WHITE } };
      sbHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
      sbHeader.alignment = { horizontal: "center", vertical: "middle" };

      for (let r = 0; r < statuses.length; r++) {
        const row = 15 + r;
        const total = statuses[r].budgets.reduce((sum, b) => sum + b.grandTotal, 0);
        dataCell(ws1.getCell(row, 2), statuses[r].label, true, statuses[r].color.replace("FF", "#"));
        dataCell(ws1.getCell(row, 3), statuses[r].budgets.length);
        amountCell(ws1.getCell(row, 4), total);
        const pct = total / maxStatusTotal;
        const barLen = Math.max(1, Math.round(pct * 30));
        ws1.getCell(row, 5).value = barChars.repeat(barLen);
        ws1.getCell(row, 5).font = { name: "Calibri", size: 10, color: { argb: statuses[r].color } };
        ws1.mergeCells(`E${row}:H${row}`);
        ws1.getCell(row, 5).alignment = { horizontal: "left", vertical: "middle" };
        ws1.getRow(row).height = 20;
      }

      // Footer note
      ws1.mergeCells("B20:H20");
      const footer = ws1.getCell("B20");
      footer.value = "Confidential — Prepared for Board of Directors | FixFlow CMMS — Integrated Facility Management Solutions";
      footer.font = { name: "Calibri", size: 8, italic: true, color: { argb: GRAY } };
      footer.alignment = { horizontal: "center", vertical: "middle" };

      // ═══ SHEET 2: BUDGET OVERVIEW ═══
      const ws2 = wb.addWorksheet("Budget Overview", { properties: { tabColor: { argb: GOLD } } });
      ws2.columns = [
        { width: 20 }, { width: 36 }, { width: 14 }, { width: 28 },
        { width: 14 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 16 }, { width: 22 }, { width: 18 },
      ];

      ws2.mergeCells("A1:K1");
      goldCell(ws2.getCell("A1"), "FIXFLOW BUDGET OVERVIEW", 14);
      ws2.getRow(1).height = 32;

      const ovHeaders = ["Control No", "Title", "Period", "Facility", "Status", "Grand Total", "OPEX", "CAPEX", "Contingency %", "Prepared By", "Date"];
      for (let c = 0; c < ovHeaders.length; c++) {
        headerCell(ws2.getCell(2, c + 1), ovHeaders[c]);
      }
      ws2.getRow(2).height = 22;

      for (let r = 0; r < budgets.length; r++) {
        const b = budgets[r];
        const row = 3 + r;
        dataCell(ws2.getCell(row, 1), b.budgetControlNumber, true);
        dataCell(ws2.getCell(row, 2), b.title);
        dataCell(ws2.getCell(row, 3), b.period);
        dataCell(ws2.getCell(row, 4), b.facilityName);
        const statusCell = ws2.getCell(row, 5);
        const statusColors: Record<string, string> = { approved: GREEN, submitted: ORANGE, draft: GRAY, rejected: RED };
        dataCell(statusCell, b.status, true, statusColors[b.status] || GRAY);
        amountCell(ws2.getCell(row, 6), b.grandTotal, true);
        amountCell(ws2.getCell(row, 7), b.totalOpex);
        amountCell(ws2.getCell(row, 8), b.totalCapex);
        dataCell(ws2.getCell(row, 9), `${b.contingencyPercent}%`);
        dataCell(ws2.getCell(row, 10), b.preparedBy);
        dataCell(ws2.getCell(row, 11), b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "");
        if (r % 2 === 1) {
          for (let c = 1; c <= 11; c++) {
            const cell = ws2.getCell(row, c);
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9F9F9" } };
          }
        }
      }

      // Total row
      const totalRow = 3 + budgets.length;
      ws2.mergeCells(`A${totalRow}:E${totalRow}`);
      dataCell(ws2.getCell(totalRow, 1), "GRAND TOTAL", true);
      for (let c = 2; c <= 5; c++) dataCell(ws2.getCell(totalRow, c), "", true);
      amountCell(ws2.getCell(totalRow, 6), budgets.reduce((s, b) => s + b.grandTotal, 0), true);
      amountCell(ws2.getCell(totalRow, 7), budgets.reduce((s, b) => s + b.totalOpex, 0), true);
      amountCell(ws2.getCell(totalRow, 8), budgets.reduce((s, b) => s + b.totalCapex, 0), true);
      dataCell(ws2.getCell(totalRow, 9), "", true);
      dataCell(ws2.getCell(totalRow, 10), "", true);
      dataCell(ws2.getCell(totalRow, 11), "", true);
      for (let c = 1; c <= 11; c++) {
        const cell = ws2.getCell(totalRow, c);
        cell.border = {
          top: { style: "double", color: { argb: GOLD } },
          bottom: { style: "double", color: { argb: GOLD } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8E7" } };
      }

      // ═══ SHEET 3: DETAILED BREAKDOWN ═══
      const ws3 = wb.addWorksheet("Detailed Breakdown", { properties: { tabColor: { argb: "FF3B82F6" } } });
      ws3.columns = [
        { width: 20 }, { width: 36 }, { width: 14 }, { width: 28 },
        { width: 14 }, { width: 24 }, { width: 44 }, { width: 10 },
        { width: 12 }, { width: 16 }, { width: 18 }, { width: 20 }, { width: 14 }, { width: 32 },
      ];

      ws3.mergeCells("A1:N1");
      goldCell(ws3.getCell("A1"), "FIXFLOW BUDGET — DETAILED LINE ITEM BREAKDOWN", 14);
      ws3.getRow(1).height = 32;

      const detHeaders = ["Control No", "Title", "Period", "Facility", "Status", "Category", "Item", "Qty", "Unit", "Unit Rate", "Amount", "Work Type", "OPEX/CAPEX", "Notes"];
      for (let c = 0; c < detHeaders.length; c++) {
        headerCell(ws3.getCell(2, c + 1), detHeaders[c]);
      }
      ws3.getRow(2).height = 22;

      let detRow = 3;
      for (const b of budgets) {
        if (b.categories && b.categories.length > 0) {
          for (const cat of b.categories) {
            if (cat.items && cat.items.length > 0) {
              for (const item of cat.items) {
                dataCell(ws3.getCell(detRow, 1), b.budgetControlNumber);
                dataCell(ws3.getCell(detRow, 2), b.title);
                dataCell(ws3.getCell(detRow, 3), b.period);
                dataCell(ws3.getCell(detRow, 4), b.facilityName);
                dataCell(ws3.getCell(detRow, 5), b.status);
                dataCell(ws3.getCell(detRow, 6), cat.categoryName, true);
                dataCell(ws3.getCell(detRow, 7), item.description);
                dataCell(ws3.getCell(detRow, 8), item.quantity);
                dataCell(ws3.getCell(detRow, 9), item.unit);
                amountCell(ws3.getCell(detRow, 10), item.unitRate);
                amountCell(ws3.getCell(detRow, 11), item.amount, true);
                dataCell(ws3.getCell(detRow, 12), item.workType);
                dataCell(ws3.getCell(detRow, 13), item.isCapex ? "CAPEX" : "OPEX", true, item.isCapex ? "FF8B5CF6" : "FF3B82F6");
                dataCell(ws3.getCell(detRow, 14), item.notes);
                if ((detRow - 3) % 2 === 1) {
                  for (let c = 1; c <= 14; c++) {
                    const cell = ws3.getCell(detRow, c);
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9F9F9" } };
                  }
                }
                detRow++;
              }
            } else {
              dataCell(ws3.getCell(detRow, 1), b.budgetControlNumber);
              dataCell(ws3.getCell(detRow, 2), b.title);
              dataCell(ws3.getCell(detRow, 3), b.period);
              dataCell(ws3.getCell(detRow, 4), b.facilityName);
              dataCell(ws3.getCell(detRow, 5), b.status);
              dataCell(ws3.getCell(detRow, 6), cat.categoryName, true);
              for (let c = 7; c <= 14; c++) dataCell(ws3.getCell(detRow, c), "");
              detRow++;
            }
          }
        } else {
          dataCell(ws3.getCell(detRow, 1), b.budgetControlNumber);
          for (let c = 2; c <= 14; c++) dataCell(ws3.getCell(detRow, c), "");
          detRow++;
        }
      }

      // Total row
      ws3.mergeCells(`A${detRow}:G${detRow}`);
      dataCell(ws3.getCell(detRow, 1), "GRAND TOTAL", true);
      for (let c = 2; c <= 7; c++) dataCell(ws3.getCell(detRow, c), "", true);
      dataCell(ws3.getCell(detRow, 8), budgets.reduce((s, b) => s + (b.categories?.reduce((cs, c) => cs + (c.items?.reduce((is, i) => is + i.quantity, 0) || 0), 0) || 0), 0), true);
      dataCell(ws3.getCell(detRow, 9), "", true);
      dataCell(ws3.getCell(detRow, 10), "", true);
      amountCell(ws3.getCell(detRow, 11), budgets.reduce((s, b) => s + b.grandTotal, 0), true);
      for (let c = 12; c <= 14; c++) dataCell(ws3.getCell(detRow, c), "", true);
      for (let c = 1; c <= 14; c++) {
        const cell = ws3.getCell(detRow, c);
        cell.border = {
          top: { style: "double", color: { argb: GOLD } },
          bottom: { style: "double", color: { argb: GOLD } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8E7" } };
      }

      // Write and download
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FixFlow-Budget-Executive-Dashboard.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setExportOpen(false);
      showToast("Excel dashboard exported successfully", "success");
    } catch (e) {
      showToast("Excel export failed. Check browser console.", "error");
    }
  }

  async function exportPDF() {
    try {
      const [{ default: jsPDF }, { autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc: any = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const LM = 14, RM = pw - 14;

      const dt = new Date();
      const dateStr = dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const now = `${dateStr} ${dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

      // ─── Derived data ───
      const annualTotal = budgets.filter((b) => b.period === "yearly").reduce((s, b) => s + b.grandTotal, 0);
      const quarterlyTotal = budgets.filter((b) => b.period === "quarterly").reduce((s, b) => s + b.grandTotal, 0);
      const monthlyTotal = budgets.filter((b) => b.period === "monthly").reduce((s, b) => s + b.grandTotal, 0);
      const grandTotal = budgets.reduce((s, b) => s + b.grandTotal, 0);
      const approved = budgets.filter((b) => b.status === "approved").length;
      const pending = budgets.filter((b) => b.status === "draft" || b.status === "submitted").length;

      // ═══════════════════════════════════════════════════════════════════
      // 1. HEADER BLOCK — fixed height, overflow hidden conceptually
      //    y=8..24, height=16mm, bottom border at 24
      // ═══════════════════════════════════════════════════════════════════
      const HB_TOP = 8, HB_BOT = 24, HB_BASE = 16; // shared baseline for both elements

      const drawHeader = () => {
        // ── Gold badge behind "BUDGET REPORT" (right-aligned in header) ──
        const lbl = "BUDGET REPORT";
        const tw = doc.getTextWidth(lbl);
        const padX = 3;                    // horizontal padding (≥3mm to avoid any overflow)
        const padY = 2;                    // vertical padding (≥2mm to avoid any overflow)
        const rectW = tw + padX * 2;       // total badge width
        const rectH = 4 + padY * 2;        // font height + vertical padding
        // Badge right edge = RM, rect vertically centered on baseline
        const rL = RM - rectW;             // rect left edge
        const rT = HB_BASE - rectH / 2;    // rect top, centered on baseline
        const rCX = rL + rectW / 2;        // rect horizontal center

        doc.setFillColor(212, 160, 23);
        doc.roundedRect(rL, rT, rectW, rectH, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        // Text and rect share the same exact center point (rCX, HB_BASE)
        doc.text(lbl, rCX, HB_BASE, { align: "center" });

        // ── FIXFLOW brand (left-aligned, same baseline HB_BASE) ──
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(180, 180, 180);
        doc.text("FIXFLOW", LM, HB_BASE);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text("FACILITY MANAGEMENT", LM, HB_BASE + 3);

        // ── Header bottom border ──
        doc.setDrawColor(212, 160, 23);
        doc.setLineWidth(0.6);
        doc.line(LM, HB_BOT, RM, HB_BOT);
      };

      // ═══════════════════════════════════════════════════════════════════
      // 4. FOOTER BLOCK — page number centered at bottom
      // ═══════════════════════════════════════════════════════════════════
      const drawFooter = () => {
        doc.setDrawColor(212, 160, 23);
        doc.setLineWidth(0.3);
        doc.line(LM, ph - 14, RM, ph - 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text("Confidential | Prepared for Board of Directors", LM, ph - 8);
        doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, RM, ph - 8, { align: "right" });
      };

      drawHeader();
      drawFooter();

      // ═══════════════════════════════════════════════════════════════════
      // 2. META ROW — own block, 4mm gap from header
      //    y=28..36, same baseline for left/right text
      // ═══════════════════════════════════════════════════════════════════
      const META_BASE = 34;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.text(`${budgets.length} budgets  ·  Portfolio: ${formatCurrency(grandTotal)}`, LM, META_BASE);
      doc.text(`Generated: ${now}`, RM, META_BASE, { align: "right" });

      // ═══════════════════════════════════════════════════════════════════
      // 3. TABLE BLOCK — starts 4mm below meta row, full content width
      // ═══════════════════════════════════════════════════════════════════
      const TY = 52; // first table startY

      // ── Executive Summary table ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text("EXECUTIVE SUMMARY", LM, TY - 8);

      const summaryRows = [
        ["Total Budgets", budgets.length.toString()],
        ["Portfolio Value", formatCurrency(grandTotal)],
        ["Annual Commitment", formatCurrency(annualTotal)],
        ["Quarterly Allocation", formatCurrency(quarterlyTotal)],
        ["Monthly Allocation", formatCurrency(monthlyTotal)],
        ["Approved", `${approved} of ${budgets.length}`],
        ["Pending Review", pending.toString()],
      ];

      autoTable(doc, {
        startY: TY,
        head: [["Metric", "Value"]],
        body: summaryRows,
        theme: "grid",
        margin: { top: 26, bottom: 16, left: LM, right: 14 },
        headStyles: { fillColor: [212, 160, 23], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9, halign: "center", cellPadding: { top: 2, bottom: 2, left: 3.5, right: 3.5 } },
        bodyStyles: { fontSize: 9, textColor: [51, 51, 51], cellPadding: { top: 2, bottom: 2, left: 3.5, right: 3.5 } },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.3,
        didDrawPage: () => { drawHeader(); drawFooter(); },
      });

      // ── Budget Overview table ──
      const lastY = doc.lastAutoTable.finalY || TY;

      // 4mm gap between tables
      const gap = 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text("BUDGET OVERVIEW", LM, lastY + gap + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.text("All budgets with status, period, and financial breakdown", LM, lastY + gap + 12);

      const overviewRows = budgets.map((b) => [
        b.budgetControlNumber, b.title, b.period, b.facilityName,
        b.status.charAt(0).toUpperCase() + b.status.slice(1),
        formatCurrency(b.grandTotal), formatCurrency(b.totalOpex), formatCurrency(b.totalCapex),
      ]);

      autoTable(doc, {
        startY: lastY + gap + 16,
        head: [["Control No", "Title", "Period", "Facility", "Status", "Grand Total", "OPEX", "CAPEX"]],
        body: overviewRows,
        theme: "grid",
        margin: { top: 26, bottom: 16, left: LM, right: 14 },
        headStyles: { fillColor: [212, 160, 23], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8, halign: "center", cellPadding: { top: 2, bottom: 2, left: 3.5, right: 3.5 } },
        bodyStyles: { fontSize: 7, textColor: [51, 51, 51], cellPadding: { top: 2, bottom: 2, left: 3.5, right: 3.5 } },
        columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 40 }, 2: { cellWidth: 14 }, 3: { cellWidth: 36 }, 7: { cellWidth: 20 } },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.3,
        didDrawPage: () => { drawHeader(); drawFooter(); },
      });

      // ═══════════════════════════════════════════════════════════════════
      // PAGE 2 — DETAILED LINE-ITEM BREAKDOWN (same header/footer/margins)
      // ═══════════════════════════════════════════════════════════════════
      doc.addPage();
      drawHeader();
      drawFooter();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(26, 26, 26);
      doc.text("DETAILED LINE-ITEM BREAKDOWN", pw / 2, TY - 8, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.text("All line items grouped by budget and category", pw / 2, TY - 2, { align: "center" });

      const detailRows: any[] = [];
      for (const b of budgets) {
        if (b.categories) {
          for (const cat of b.categories) {
            if (cat.items && cat.items.length > 0) {
              for (const item of cat.items) {
                detailRows.push([
                  b.budgetControlNumber, cat.categoryName, item.description,
                  item.quantity, item.unit, formatCurrency(item.unitRate),
                  formatCurrency(item.amount), item.isCapex ? "CAPEX" : "OPEX",
                ]);
              }
            }
          }
        }
      }

      autoTable(doc, {
        startY: TY + 2,
        head: [["Control No", "Category", "Item", "Qty", "Unit", "Unit Rate", "Amount", "Type"]],
        body: detailRows,
        theme: "grid",
        margin: { top: 26, bottom: 16, left: LM, right: 14 },
        headStyles: { fillColor: [212, 160, 23], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8, halign: "center", cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
        bodyStyles: { fontSize: 7, textColor: [51, 51, 51], cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
        columnStyles: {
          0: { cellWidth: 28 }, 1: { cellWidth: 36 }, 2: { cellWidth: 90 },
          3: { cellWidth: 12 }, 4: { cellWidth: 16 }, 5: { cellWidth: 22 },
          6: { cellWidth: 22 }, 7: { cellWidth: 16 },
        },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.3,
        didDrawPage: () => { drawHeader(); drawFooter(); },
      });

      drawFooter();
      doc.save("FixFlow-Budget-Report.pdf");
      setExportOpen(false);
      showToast("PDF exported successfully", "success");
    } catch (e) {
      showToast("PDF export failed. Check browser console.", "error");
    }
  }
  const totalAnnual = budgets.filter((b) => b.period === "yearly").reduce((s, b) => s + b.grandTotal, 0);
  const totalQuarterly = budgets.filter((b) => b.period === "quarterly").reduce((s, b) => s + b.grandTotal, 0);
  const totalMonthly = budgets.filter((b) => b.period === "monthly").reduce((s, b) => s + b.grandTotal, 0);
  const approvedBudgets = budgets.filter((b) => b.status === "approved").length;
  const pendingBudgets = budgets.filter((b) => b.status === "draft" || b.status === "submitted").length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="budget-page-content space-y-6">
      <style>{`
        .budget-page-content {
          --color-background: #F3F4F6;
          --color-foreground: #111827;
          --color-card: #FFFFFF;
          --color-card-foreground: #111827;
          --color-card-alt: #F9FAFB;
          --color-border: #E5E7EB;
          --color-muted: #F3F4F6;
          --color-muted-foreground: #6B7280;
          --color-text-secondary: #4B5563;
          --color-text-muted: #6B7280;
          --color-text-tertiary: #6B7280;
          --color-text-subtle: #D1D5DB;
          --color-success: #16A34A;
          --color-destructive: #DC2626;
          --color-primary: #D4AF37;
          --color-primary-foreground: #000000;
          --color-card-hover: #F3F4F6;
        }
        .budget-page-content .export-dropdown-btn:hover {
          background: var(--color-muted) !important;
          color: var(--color-foreground) !important;
        }
        @media print {
          .budget-page-content {
            --color-card: #FFFFFF !important;
            --color-background: #FFFFFF !important;
            --color-card-alt: #F9FAFB !important;
            --color-border: #E5E7EB !important;
            --color-foreground: #111827 !important;
            --color-text-tertiary: #6B7280 !important;
            --color-text-muted: #6B7280 !important;
            --color-muted: #F3F4F6 !important;
          }
          body { background: #FFFFFF !important; }
          .budget-page-content * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium ${
            toast.type === "success" ? "bg-success/10 border-success/30 text-success" :
            toast.type === "error" ? "bg-[var(--color-destructive)]/10 border-[var(--color-destructive)]/30 text-destructive" :
            "bg-info/10 border-info/30 text-info"
          }`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
        </motion.div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Premium Budget Builder</h1>
          <p className="text-text-tertiary text-sm mt-1">
            Professional FM budget proposals — ISO 41001 compliant | Nigerian facility benchmarks
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
              <button onClick={() => setExportOpen(!exportOpen)}
              className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground font-medium text-sm hover:bg-[var(--color-muted)] transition-colors flex items-center gap-2">
              <Download size={14} /> Export
            </button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full mt-1 w-48 rounded-xl border p-1 shadow-2xl z-50 bg-card border-border"
                >
                  <button onClick={exportExcel}
                    className="export-dropdown-btn w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
                    style={{ color: "var(--color-foreground)" }}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="16" x2="16" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    Excel (.xlsx)
                  </button>
                  <button onClick={exportPDF}
                    className="export-dropdown-btn w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
                    style={{ color: "var(--color-foreground)" }}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="var(--color-destructive)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M12 12v6"/></svg>
                    PDF Report
                  </button>
                </motion.div>
              </>
            )}
          </div>
          {(["monthly", "quarterly", "yearly"] as BudgetPeriod[]).map((p) => (
            <button key={p} onClick={() => openForm(p)}
              className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Plus size={14} /> {getPeriodLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* FACILITY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-card to-card-alt rounded-xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
              <Building size={18} className="text-success" />
            </div>
            <div>
              <p className="text-text-tertiary text-xs">Budget Proposals</p>
              <p className="text-foreground text-sm font-semibold">{budgets.length} total</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-text-muted">Facilities:</span> <span className="text-foreground">{new Set(budgets.map(b => b.facilityName)).size}</span></div>
            <div><span className="text-text-muted">FY:</span> <span className="text-foreground">{new Date().getFullYear()}</span></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-card to-card-alt rounded-xl p-5 border border-border">
          <p className="text-text-tertiary text-xs">Annual Budget Commitment</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrencyShort(totalAnnual)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-text-muted text-xs">Quarterly:</span>
            <span className="text-primary text-xs font-medium">{formatCurrencyShort(totalQuarterly)}</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-card to-card-alt rounded-xl p-5 border border-border">
          <p className="text-text-tertiary text-xs">Portfolio Status</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-foreground text-sm font-semibold">{approvedBudgets}</span>
              <span className="text-text-muted text-xs">Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-foreground text-sm font-semibold">{pendingBudgets}</span>
              <span className="text-text-muted text-xs">Pending</span>
            </div>
          </div>

        </div>
        <div className="bg-gradient-to-br from-card to-card-alt rounded-xl p-5 border border-border">
          <p className="text-text-tertiary text-xs">Predictive Maintenance</p>
          <p className="text-2xl font-bold text-foreground mt-1">{pdmSummary.highRiskAssets}</p>
          <p className="text-text-muted text-xs">Assets requiring attention</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-success text-xs">{pdmSummary.avgHealthScore}%</span>
            <span className="text-text-muted text-xs">avg health score</span>
          </div>
        </div>
      </div>

      {/* QUICK CREATE BY PERIOD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["monthly", "quarterly", "yearly"] as BudgetPeriod[]).map((p) => {
          const Icon = PERIOD_ICONS[p];
          const periodBudgets = budgets.filter((b) => b.period === p);
          const total = periodBudgets.reduce((s, b) => s + b.grandTotal, 0);
          return (
            <button key={p} onClick={() => openForm(p)}
              className="relative group bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${PERIOD_COLORS[p]}15` }}>
                  <Icon size={20} style={{ color: PERIOD_COLORS[p] }} />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-sm">{getPeriodLabel(p)} Budget</h3>
                  <p className="text-text-tertiary text-xs">{periodBudgets.length} budget{periodBudgets.length !== 1 ? "s" : ""} · {formatCurrencyShort(total)}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={12} /> Create {getPeriodLabel(p).toLowerCase()} budget
              </div>
            </button>
          );
        })}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search budgets by title or control number..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-muted outline-none focus:border-primary/50 transition-colors" />
        </div>
        <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value as "all" | BudgetPeriod)}
          className="h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50">
          <option value="all">All Periods</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Annual</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50">
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* BUDGET LIST */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <FileText size={40} className="mx-auto text-[var(--color-text-subtle)] mb-3" />
          <p className="text-foreground font-medium">No budget proposals found</p>
          <p className="text-text-tertiary text-sm mt-1">Create your first budget proposal using the buttons above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((budget) => {
            const PeriodIcon = PERIOD_ICONS[budget.period];
            const periodColor = PERIOD_COLORS[budget.period];
            const opexPct = budget.grandTotal > 0 ? Math.round((budget.totalOpex / budget.grandTotal) * 100) : 0;
            const capexPct = budget.grandTotal > 0 ? Math.round((budget.totalCapex / budget.grandTotal) * 100) : 0;

            return (
              <motion.div key={budget.id} layout
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${periodColor}15` }}>
                      <PeriodIcon size={20} style={{ color: periodColor }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-foreground font-semibold text-sm truncate">{budget.title}</h3>
                        <span className={`h-5 px-2 rounded-full text-[9px] font-medium border shrink-0`}
                          style={{ background: `${getStatusColor(budget.status)}15`, color: getStatusColor(budget.status), borderColor: `${getStatusColor(budget.status)}30` }}>
                          {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-tertiary mt-0.5">
                        <span>{budget.budgetControlNumber}</span>
                        <span>|</span>
                        <span>{getPeriodLabel(budget.period)}</span>
                        <span>|</span>
                        <span>FY {budget.fiscalYear}</span>
                        <span>|</span>
                        <span>{budget.facilityName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-foreground font-bold">{formatCurrencyShort(budget.grandTotal)}</p>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-info text-[10px]">O: {opexPct}%</span>
                        <span className="text-text-muted text-[10px]">|</span>
                        <span className="text-[var(--color-purple)] text-[10px]">C: {capexPct}%</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleView(budget)}
                          className="h-8 px-3 rounded-lg bg-muted text-foreground text-xs hover:bg-[var(--color-card-hover)] transition-colors flex items-center gap-1.5">
                          <Eye size={12} /> View
                        </button>
                        {budget.status === "draft" && (
                          <button onClick={() => openForm(budget.period, budget)}
                            className="h-8 px-3 rounded-lg bg-muted text-foreground text-xs hover:bg-[var(--color-card-hover)] transition-colors flex items-center gap-1.5">
                            <Edit size={12} /> Edit
                          </button>
                        )}
                      <button onClick={() => setDeleteConfirm(budget.id)}
                        className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-destructive hover:bg-[var(--color-destructive)]/20 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comparison bar */}
                {budget.previousPeriodTotal > 0 && (
                  <div className="mt-3 flex items-center gap-3 text-xs border-t border-border pt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-muted">vs Previous:</span>
                      <span className={budget.variancePercent >= 0 ? "text-destructive" : "text-success"}>
                        {budget.variancePercent >= 0 ? "+" : ""}{budget.variancePercent.toFixed(1)}%
                      </span>
                      {budget.variancePercent >= 0
                        ? <TrendingUp size={12} className="text-destructive" />
                        : <TrendingDown size={12} className="text-success" />
                      }
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-muted">Contingency:</span>
                      <span className="text-primary">{budget.contingencyPercent}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-muted">Assets:</span>
                      <span className="text-foreground">{budget.assetCount}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* BUDGET FORM MODAL */}
      <PremiumBudgetForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditBudget(null); }}
        onSaved={() => { loadData(); }}
        editBudget={editBudget}
        period={formPeriod}
      />

      {/* BUDGET REPORT MODAL */}
      <PremiumBudgetReport
        open={reportOpen}
        onClose={() => { setReportOpen(false); setReportBudget(null); }}
        budget={reportBudget}
        onApprove={handleApprove}
        onSubmit={handleSubmit}
      />

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle size={32} className="mx-auto text-destructive mb-3" />
              <h3 className="text-foreground font-semibold mb-1">Confirm Delete</h3>
              <p className="text-text-tertiary text-sm mb-5">This will permanently delete this budget proposal and all its line items.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 h-10 rounded-lg bg-muted text-foreground text-sm hover:bg-[var(--color-card-hover)] transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 h-10 rounded-lg bg-[var(--color-destructive)] text-foreground text-sm hover:bg-destructive/90 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
