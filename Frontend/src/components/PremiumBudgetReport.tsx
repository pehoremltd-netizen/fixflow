"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Printer, CheckCircle2, AlertTriangle, X,
  ClipboardCheck, Wrench, Zap, Users, Briefcase, Package,
  AlertTriangle as SafetyIcon, Building2, Shield,
} from "lucide-react";
import {
  type BudgetProposal, formatCurrency, formatCurrencyShort,
  getBudgetSettings,
} from "@/lib/budgetCalculator";
import { getPeriodLabel, getStatusColor } from "@/lib/budgetTemplate";
import { exportToCSV, exportToJSON, printBudget } from "@/lib/budgetExport";
import { getPdMSummary } from "@/lib/predictiveMaintenanceBudget";
import { BRAND } from "@/lib/brand";

const ICON_MAP: Record<string, React.ElementType> = {
  ClipboardCheck, Wrench, Zap, Users, Briefcase, Package,
  AlertTriangle: SafetyIcon, Building2, Shield,
};

interface Props {
  open: boolean;
  onClose: () => void;
  budget: BudgetProposal | null;
  onApprove?: (id: string) => void;
  onSubmit?: (id: string) => void;
}

export default function PremiumBudgetReport({ open, onClose, budget, onApprove, onSubmit }: Props) {
  if (!budget) return null;

  const settings = getBudgetSettings();
  const pdmSummary = getPdMSummary();
  const opexPct = budget.grandTotal > 0 ? Math.round((budget.totalOpex / budget.grandTotal) * 100) : 0;
  const capexPct = budget.grandTotal > 0 ? Math.round((budget.totalCapex / budget.grandTotal) * 100) : 0;
  const budgetPerAsset = budget.assetCount > 0 ? budget.grandTotal / budget.assetCount : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-background/80 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-5xl bg-card rounded-2xl border border-border my-8 overflow-hidden budget-report-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOOLBAR */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card no-print">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText size={16} className="text-primary" />
              </div>
              <div>
                <h2 className="text-foreground font-semibold text-sm">{budget.budgetControlNumber}</h2>
                <p className="text-text-tertiary text-xs">{getPeriodLabel(budget.period)} Budget — {budget.fiscalYear}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-6 px-2.5 rounded-full text-[10px] font-medium flex items-center gap-1 border`}
                style={{
                  background: `${getStatusColor(budget.status)}15`,
                  color: getStatusColor(budget.status),
                  borderColor: `${getStatusColor(budget.status)}30`,
                }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: getStatusColor(budget.status) }} />
                {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
              </span>
              <button onClick={() => printBudget(budget)}
                className="h-8 px-3 rounded-lg bg-muted text-foreground text-xs hover:bg-muted transition-colors flex items-center gap-1.5">
                <Printer size={12} /> Print
              </button>
              <button onClick={() => exportToCSV(budget)}
                className="h-8 px-3 rounded-lg bg-muted text-foreground text-xs hover:bg-muted transition-colors flex items-center gap-1.5">
                <Download size={12} /> Export
              </button>
              <button onClick={() => exportToJSON(budget)}
                className="h-8 px-3 rounded-lg bg-muted text-foreground text-xs hover:bg-muted transition-colors flex items-center gap-1.5">
                JSON
              </button>
              {budget.status === "draft" && onSubmit && (
                <button onClick={() => onSubmit(budget.id)}
                  className="h-8 px-3 rounded-lg bg-[var(--color-info)] text-foreground text-xs font-medium hover:brightness-90 transition-colors">
                  Submit
                </button>
              )}
              {budget.status === "submitted" && onApprove && (
                <button onClick={() => onApprove(budget.id)}
                  className="h-8 px-3 rounded-lg bg-success text-primary-foreground text-xs font-medium hover:brightness-90 transition-colors flex items-center gap-1">
                  <CheckCircle2 size={12} /> Approve
                </button>
              )}
              <button onClick={onClose}
                className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-text-tertiary hover:text-foreground transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          <style>{`
            @media print {
              .budget-report-content .no-print { display: none !important; }
              .budget-report-content { break-inside: avoid; }
            }
          `}</style>
          {/* REPORT CONTENT */}
          <div className="p-6 space-y-6">
            {/* HEADER */}
            <div className="text-center">
              <p className="text-primary text-sm font-bold tracking-[3px] uppercase mb-1">{BRAND.reportHeader}</p>
              <h1 className="text-2xl font-bold text-foreground">FACILITY MAINTENANCE BUDGET PROPOSAL</h1>
              <p className="text-text-tertiary text-sm mt-1">{budget.facilityName} | {budget.location}</p>
            </div>

            {/* META ROW */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 p-4 rounded-xl bg-card-alt border border-border">
              <div>
                <p className="text-text-tertiary text-[10px] uppercase">Control #</p>
                <p className="text-foreground text-xs font-medium mt-0.5">{budget.budgetControlNumber}</p>
              </div>
              <div>
                <p className="text-text-tertiary text-[10px] uppercase">Period</p>
                <p className="text-foreground text-xs font-medium mt-0.5">{getPeriodLabel(budget.period)}</p>
              </div>
              <div>
                <p className="text-text-tertiary text-[10px] uppercase">Fiscal Year</p>
                <p className="text-foreground text-xs font-medium mt-0.5">{budget.fiscalYear}</p>
              </div>
              <div>
                <p className="text-text-tertiary text-[10px] uppercase">Prepared By</p>
                <p className="text-foreground text-xs font-medium mt-0.5">{budget.preparedBy}</p>
              </div>
              <div>
                <p className="text-text-tertiary text-[10px] uppercase">Reviewed By</p>
                <p className="text-foreground text-xs font-medium mt-0.5">{budget.reviewedBy || "—"}</p>
              </div>
              <div>
                <p className="text-text-tertiary text-[10px] uppercase">Date</p>
                <p className="text-foreground text-xs font-medium mt-0.5">
                  {new Date(budget.preparedDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* EXECUTIVE SUMMARY */}
            <div>
              <h3 className="text-primary text-sm font-semibold mb-3">Executive Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-card-alt border border-border">
                  <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Total Opex</p>
                  <p className="text-xl font-bold text-[var(--color-info)] mt-1">{formatCurrencyShort(budget.totalOpex)}</p>
                  <p className="text-text-muted text-xs mt-0.5">{opexPct}% of total</p>
                </div>
                <div className="p-4 rounded-xl bg-card-alt border border-border">
                  <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Total Capex</p>
                  <p className="text-xl font-bold text-[var(--color-purple)] mt-1">{formatCurrencyShort(budget.totalCapex)}</p>
                  <p className="text-text-muted text-xs mt-0.5">{capexPct}% of total</p>
                </div>
                <div className="p-4 rounded-xl bg-card-alt border border-border">
                  <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Grand Total</p>
                  <p className="text-xl font-bold text-success mt-1">{formatCurrencyShort(budget.grandTotal)}</p>
                  <p className="text-text-muted text-xs mt-0.5">Incl. contingency & tax</p>
                </div>
                <div className="p-4 rounded-xl bg-card-alt border border-border">
                  <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Budget Per Asset</p>
                  <p className="text-xl font-bold text-foreground mt-1">{formatCurrencyShort(budgetPerAsset)}</p>
                  <p className="text-text-muted text-xs mt-0.5">{budget.assetCount} assets</p>
                </div>
              </div>
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-card-alt border border-border flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center"><ClipboardCheck size={14} className="text-success" /></div>
                <div>
                  <p className="text-text-tertiary text-[10px] uppercase">SLA Target</p>
                  <p className="text-foreground text-xs font-medium">{budget.slaTargets}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-card-alt border border-border flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><AlertTriangle size={14} className="text-primary" /></div>
                <div>
                  <p className="text-text-tertiary text-[10px] uppercase">Contingency Reserve</p>
                  <p className="text-foreground text-xs font-medium">{budget.contingencyPercent}% ({formatCurrencyShort(budget.contingencyAmount)})</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-card-alt border border-border flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[var(--color-purple)]/10 flex items-center justify-center"><Briefcase size={14} className="text-[var(--color-purple)]" /></div>
                <div>
                  <p className="text-text-tertiary text-[10px] uppercase">PdM Analysis</p>
                  <p className="text-foreground text-xs font-medium">{pdmSummary.highRiskAssets} assets at risk</p>
                </div>
              </div>
            </div>

            {/* DETAILED BUDGET TABLE */}
            <div>
              <h3 className="text-primary text-sm font-semibold mb-3">Detailed Budget Breakdown</h3>
              {budget.categories.filter((c) => c.items.length > 0 || c.subtotal > 0).map((cat) => {
                const Icon = ICON_MAP[cat.icon] || FileText;
                return (
                  <div key={cat.categoryId} className="mb-4 rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-card-alt border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}20` }}>
                          <Icon size={14} style={{ color: cat.color }} />
                        </div>
                        <div>
                          <h4 className="text-foreground text-sm font-semibold">{cat.categoryName}</h4>
                          <p className="text-text-muted text-[10px]">{cat.definition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground text-sm font-bold">{formatCurrencyShort(cat.subtotal)}</p>
                        <p className="text-text-muted text-[10px]">{budget.grandTotal > 0 ? Math.round((cat.subtotal / budget.grandTotal) * 100) : 0}% of total</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-card">
                            <th className="text-left text-text-tertiary font-medium px-3 py-2">Description</th>
                            <th className="text-right text-text-tertiary font-medium px-3 py-2">Qty</th>
                            <th className="text-right text-text-tertiary font-medium px-3 py-2">Unit Rate</th>
                            <th className="text-right text-text-tertiary font-medium px-3 py-2">Amount</th>
                            <th className="text-center text-text-tertiary font-medium px-3 py-2">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {cat.items.map((item) => (
                            <tr key={item.id} className="hover:bg-card-alt/50 transition-colors">
                              <td className="px-3 py-2">
                                <p className="text-foreground">{item.description}</p>
                                {item.notes && <p className="text-text-muted text-[10px] mt-0.5">{item.notes}</p>}
                                {item.assetName && (
                                  <p className="text-text-muted text-[10px] mt-0.5">
                                    Asset: {item.assetName} · Health: {item.assetHealthScore}/100 · MTBF: {item.mtbf.toLocaleString()}hrs
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right text-foreground">{item.quantity.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right text-foreground">{formatCurrencyShort(item.unitRate)}</td>
                              <td className="px-3 py-2 text-right text-foreground font-medium">{formatCurrencyShort(item.amount)}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  item.workType === "PM" ? "bg-success/10 text-success" :
                                  item.workType === "CM" ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)]" :
                                  item.workType === "Capex" ? "bg-[var(--color-purple)]/10 text-[var(--color-purple)]" :
                                  "bg-primary/10 text-primary"
                                }`}>{item.workType}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-card-alt">
                            <td colSpan={3} className="px-3 py-2 text-foreground text-sm font-bold">{cat.categoryName} Subtotal</td>
                            <td className="px-3 py-2 text-right text-primary font-bold">{formatCurrencyShort(cat.subtotal)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TOTALS */}
            <div className="flex justify-end">
              <div className="w-80 space-y-1.5 p-4 rounded-xl bg-card-alt border border-border">
                <div className="flex justify-between text-sm"><span className="text-text-tertiary">Total Opex</span><span className="text-[var(--color-info)] font-medium">{formatCurrencyShort(budget.totalOpex)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-tertiary">Total Capex</span><span className="text-[var(--color-purple)] font-medium">{formatCurrencyShort(budget.totalCapex)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-tertiary">Contingency ({budget.contingencyPercent}%)</span><span className="text-primary font-medium">{formatCurrencyShort(budget.contingencyAmount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-tertiary">VAT ({budget.taxPercent}%)</span><span className="text-[var(--color-warning)] font-medium">{formatCurrencyShort(budget.taxAmount)}</span></div>
                <div className="border-t border-border pt-1.5 mt-1.5 flex justify-between">
                  <span className="text-foreground font-bold">Grand Total</span>
                  <span className="text-success font-bold text-lg">{formatCurrencyShort(budget.grandTotal)}</span>
                </div>
                {budget.previousPeriodTotal > 0 && (
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-text-tertiary">vs Previous Period</span>
                    <span className={budget.variance >= 0 ? "text-success" : "text-destructive"}>
                      {budget.variance >= 0 ? "+" : ""}{budget.variancePercent.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* NARRATIVE */}
            {budget.budgetNarrative && (
              <div className="p-4 rounded-xl bg-card-alt border border-border">
                <h4 className="text-primary text-sm font-semibold mb-2">Budget Justification & Strategic Narrative</h4>
                <p className="text-text-tertiary text-xs leading-relaxed">{budget.budgetNarrative}</p>
              </div>
            )}

            {budget.riskAnalysis && (
              <div className="p-4 rounded-xl bg-card-alt border border-border">
                <h4 className="text-primary text-sm font-semibold mb-2">Risk Mitigation & Contingency Strategy</h4>
                <p className="text-text-tertiary text-xs leading-relaxed">{budget.riskAnalysis}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-text-tertiary text-[10px] uppercase">Contingency Allocation</p>
                    <p className="text-primary text-sm font-bold mt-1">{formatCurrencyShort(budget.contingencyAmount)}</p>
                    <p className="text-text-muted text-[10px]">{budget.contingencyPercent}% of base budget</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-text-tertiary text-[10px] uppercase">Emergency Reserve</p>
                    <p className="text-primary text-sm font-bold mt-1">{formatCurrencyShort(budget.contingencyAmount * 0.4)}</p>
                    <p className="text-text-muted text-[10px]">40% for emergency repairs</p>
                  </div>
                </div>
              </div>
            )}

            {/* SIGNATURES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-card-alt border border-border">
              <div>
                <div className="h-10 border-b border-border mb-1"></div>
                <p className="text-text-tertiary text-xs">{budget.preparedBy || "Facility Manager"}</p>
                <p className="text-text-muted text-[10px]">Facility Manager</p>
              </div>
              <div>
                <div className="h-10 border-b border-border mb-1"></div>
                <p className="text-text-tertiary text-xs">{budget.reviewedBy || "Operations Manager"}</p>
                <p className="text-text-muted text-[10px]">Operations Manager</p>
              </div>
              <div>
                <div className="h-10 border-b border-border mb-1"></div>
                <p className="text-text-tertiary text-xs">Finance Controller</p>
                <p className="text-text-muted text-[10px]">Finance / Accounting</p>
              </div>
              <div>
                <div className="h-10 border-b border-border mb-1"></div>
                <p className="text-text-tertiary text-xs">Managing Director</p>
                <p className="text-text-muted text-[10px]">Director Approval</p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="text-center text-text-muted text-[10px] pt-2 border-t border-border">
              {settings.organizationName} | {budget.facilityName} | {budget.location}<br />
              Budget Control: {budget.budgetControlNumber} | Generated: {new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })} | {BRAND.sidebarVersion}<br />
              {BRAND.poweredBy} | {BRAND.ownedBy}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
