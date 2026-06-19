"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, FileText, AlertTriangle, CheckCircle2,
  ClipboardCheck, Wrench, Zap, Users, Briefcase, Package,
  AlertTriangle as SafetyIcon, Building2, Shield, ChevronDown,
  ChevronUp, Info, Calculator,
} from "lucide-react";
import {
  type BudgetProposal, type BudgetCategoryData, type BudgetLineItem,
  type BudgetPeriod, type FacilityType,
  formatCurrency, calcLineItemAmount, calcCategorySubtotal,
  calcTotalOpex, calcTotalCapex, calcGrandTotal,
  createBudget, updateBudget,
} from "@/lib/budgetCalculator";
import {
  getFacilityTypes, getPeriodLabel, getFacilityTypeGuidance,
  getFacilityTypeItems, FM_CATEGORY_DEFINITIONS,
} from "@/lib/budgetTemplate";
import { generatePdMBudgetSuggestions, type PdMBudgetSuggestion } from "@/lib/predictiveMaintenanceBudget";

const ICON_MAP: Record<string, React.ElementType> = {
  ClipboardCheck, Wrench, Zap, Users, Briefcase, Package,
  AlertTriangle: SafetyIcon, Building2, Shield,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editBudget?: BudgetProposal | null;
  period?: BudgetPeriod;
}

export default function PremiumBudgetForm({ open, onClose, onSaved, editBudget, period }: Props) {
  const isEdit = !!editBudget;
  const [step, setStep] = useState(1);

  const [facilityName, setFacilityName] = useState(editBudget?.facilityName || "Lekki Phase 1 Facility Complex");
  const [facilityType, setFacilityType] = useState<FacilityType>(editBudget?.facilityType || "office");
  const [location, setLocation] = useState(editBudget?.location || "Lagos, Nigeria");
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>(editBudget?.period || period || "yearly");
  const [fiscalYear, setFiscalYear] = useState(editBudget?.fiscalYear || new Date().getFullYear());
  const [preparedBy, setPreparedBy] = useState(editBudget?.preparedBy || "Engr. Michael Adeyemi");
  const [reviewedBy, setReviewedBy] = useState(editBudget?.reviewedBy || "");
  const [assetCount, setAssetCount] = useState(editBudget?.assetCount || 45);
  const [criticalAssetCount, setCriticalAssetCount] = useState(editBudget?.criticalAssetCount || 12);
  const [slaTargets, setSlaTargets] = useState(editBudget?.slaTargets || "99% uptime, 4-hour response");
  const [contingencyPercent, setContingencyPercent] = useState(editBudget?.contingencyPercent ?? 10);
  const [taxPercent, setTaxPercent] = useState(editBudget?.taxPercent ?? 7.5);
  const [previousPeriodTotal, setPreviousPeriodTotal] = useState(editBudget?.previousPeriodTotal || 0);
  const [budgetNarrative, setBudgetNarrative] = useState(editBudget?.budgetNarrative || "");
  const [riskAnalysis, setRiskAnalysis] = useState(editBudget?.riskAnalysis || "");

  const [categories, setCategories] = useState<BudgetCategoryData[]>(
    () => editBudget?.categories || getDefaultCategories()
  );

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [showPdM, setShowPdM] = useState(false);
  const [pdmSuggestions] = useState<PdMBudgetSuggestion[]>(() => generatePdMBudgetSuggestions());

  const opex = calcTotalOpex(categories);
  const capexM = calcTotalCapex(categories);
  const totals = calcGrandTotal(opex, capexM, contingencyPercent, taxPercent);

  const toggleCat = (id: string) => setExpandedCats((p) => ({ ...p, [id]: !p[id] }));

  function getDefaultCategories(): BudgetCategoryData[] {
    return FM_CATEGORY_DEFINITIONS.map((def) => ({
      categoryId: def.id,
      categoryName: def.name,
      workType: def.id === "cat-capex" ? "Capex" : def.id === "cat-contingency" ? "Reserve" : "PM",
      icon: def.icon,
      color: def.color,
      definition: def.definition,
      guidance: def.guidance,
      items: [],
      subtotal: 0,
      isCapex: def.id === "cat-capex",
    }));
  }

  function addLineItem(catId: string) {
    setCategories((prev) => prev.map((c) => {
      if (c.categoryId !== catId) return c;
      const newItem: BudgetLineItem = {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        description: "",
        quantity: 1,
        unitRate: 0,
        amount: 0,
        unit: "pcs",
        workType: c.workType,
        notes: "",
        isRecurring: true,
        recurringFrequency: "monthly",
        assetId: "",
        assetName: "",
        assetHealthScore: 85,
        mtbf: 0,
        rcmRationale: "",
        lastYearAmount: 0,
        isCapex: c.isCapex,
      };
      return { ...c, items: [...c.items, newItem], subtotal: calcCategorySubtotal([...c.items, newItem]) };
    }));
  }

  function updateLineItem(catId: string, itemId: string, updates: Partial<BudgetLineItem>) {
    setCategories((prev) => prev.map((c) => {
      if (c.categoryId !== catId) return c;
      const items = c.items.map((i) => {
        if (i.id !== itemId) return i;
        const updated = { ...i, ...updates };
        if (updates.quantity !== undefined || updates.unitRate !== undefined) {
          updated.amount = calcLineItemAmount(
            updates.quantity ?? i.quantity,
            updates.unitRate ?? i.unitRate
          );
        }
        return updated;
      });
      return { ...c, items, subtotal: calcCategorySubtotal(items) };
    }));
  }

  function removeLineItem(catId: string, itemId: string) {
    setCategories((prev) => prev.map((c) => {
      if (c.categoryId !== catId) return c;
      const items = c.items.filter((i) => i.id !== itemId);
      return { ...c, items, subtotal: calcCategorySubtotal(items) };
    }));
  }

  function applyPdMSuggestion(suggestion: PdMBudgetSuggestion) {
    const newItem: BudgetLineItem = {
      id: `pdm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: suggestion.description,
      quantity: suggestion.quantity,
      unitRate: suggestion.unitRate,
      amount: calcLineItemAmount(suggestion.quantity, suggestion.unitRate),
      unit: suggestion.unit,
      workType: suggestion.workType,
      notes: suggestion.notes,
      isRecurring: true,
      recurringFrequency: "monthly",
      assetId: suggestion.assetId,
      assetName: suggestion.assetName,
      assetHealthScore: suggestion.assetHealthScore,
      mtbf: suggestion.mtbf,
      rcmRationale: suggestion.rcmRationale,
      lastYearAmount: 0,
      isCapex: suggestion.workType === "Capex",
    };
    setCategories((prev) => prev.map((c) => {
      if (c.categoryId !== suggestion.categoryId) return c;
      const items = [...c.items, newItem];
      return { ...c, items, subtotal: calcCategorySubtotal(items) };
    }));
    setShowPdM(false);
    showToast("PdM suggestion applied", "success");
  }

  function applyAllPdM() {
    pdmSuggestions.forEach((s) => {
      setCategories((prev) => prev.map((c) => {
        if (c.categoryId !== s.categoryId) return c;
        const exists = c.items.some((i) => i.description === s.description);
        if (exists) return c;
        const newItem: BudgetLineItem = {
          id: `pdm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          description: s.description,
          quantity: s.quantity,
          unitRate: s.unitRate,
          amount: calcLineItemAmount(s.quantity, s.unitRate),
          unit: s.unit,
          workType: s.workType,
          notes: s.notes,
          isRecurring: true,
          recurringFrequency: "monthly",
          assetId: s.assetId,
          assetName: s.assetName,
          assetHealthScore: s.assetHealthScore,
          mtbf: s.mtbf,
          rcmRationale: s.rcmRationale,
          lastYearAmount: 0,
          isCapex: s.workType === "Capex",
        };
        return { ...c, items: [...c.items, newItem] };
      }));
    });
    setShowPdM(false);
    showToast("All PdM suggestions applied", "success");
  }

  function applyFacilityTemplate() {
    setCategories((prev) => prev.map((c) => {
      const templateItems = getFacilityTypeItems(facilityType, c.categoryId);
      if (templateItems.length === 0) return c;
      const existing = c.items.filter((i) => !templateItems.some((t) => t.description === i.description));
      return { ...c, items: [...existing, ...templateItems] };
    }));
    showToast(`Template applied for ${facilityType}`, "success");
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleSave() {
    if (!facilityName.trim()) {
      showToast("Facility name is required", "error"); return;
    }

    const catData = categories.map((c) => ({
      ...c,
      subtotal: calcCategorySubtotal(c.items),
    }));

    if (isEdit && editBudget) {
      updateBudget(editBudget.id, {
        facilityName, facilityType, location, period: budgetPeriod,
        fiscalYear, preparedBy, reviewedBy, assetCount, criticalAssetCount,
        slaTargets, contingencyPercent, taxPercent, previousPeriodTotal,
        budgetNarrative, riskAnalysis, categories: catData,
      });
      showToast("Budget updated successfully", "success");
    } else {
      createBudget({
        title: `${getPeriodLabel(budgetPeriod)} ${fiscalYear} Facility Budget — ${facilityName}`,
        facilityName, facilityType, location, period: budgetPeriod,
        fiscalYear, preparedBy, reviewedBy, assetCount, criticalAssetCount,
        slaTargets, contingencyPercent, taxPercent, previousPeriodTotal,
        budgetNarrative, riskAnalysis, categories: catData,
      });
      showToast("Budget created successfully", "success");
    }

    setTimeout(() => { onSaved(); onClose(); }, 1200);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-background/80 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-5xl bg-card rounded-2xl border border-border p-6 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isEdit ? "Edit Budget Proposal" : "Create New Budget Proposal"}
              </h2>
              <p className="text-text-tertiary text-sm mt-1">
                Professional FM budget builder — ISO 41001 compliant
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary text-xs">Step {step} of 3</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>
          </div>

          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`fixed bottom-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl text-sm ${
                toast.type === "success" ? "bg-success/10 border-success/30 text-success" : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {toast.message}
            </motion.div>
          )}

          {/* STEP 1: HEADER & METADATA */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Facility Name *</label>
                  <input value={facilityName} onChange={(e) => setFacilityName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Facility Type</label>
                  <select value={facilityType} onChange={(e) => setFacilityType(e.target.value as FacilityType)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50">
                    {getFacilityTypes().map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Budget Period</label>
                  <div className="flex gap-2">
                    {(["monthly", "quarterly", "yearly"] as BudgetPeriod[]).map((p) => (
                      <button key={p} onClick={() => setBudgetPeriod(p)}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${
                          budgetPeriod === p ? "bg-primary text-primary-foreground" : "bg-muted text-text-tertiary hover:text-foreground"
                        }`}>
                        {getPeriodLabel(p)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Fiscal Year</label>
                  <input type="number" value={fiscalYear} onChange={(e) => setFiscalYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Prepared By</label>
                  <input value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Reviewed By</label>
                  <input value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Asset Count</label>
                  <input type="number" value={assetCount} onChange={(e) => setAssetCount(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Critical Assets</label>
                  <input type="number" value={criticalAssetCount} onChange={(e) => setCriticalAssetCount(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
              </div>

              <div>
                <label className="text-text-secondary text-sm block mb-1.5">SLA Targets</label>
                <input value={slaTargets} onChange={(e) => setSlaTargets(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Contingency (%)</label>
                  <input type="number" value={contingencyPercent} onChange={(e) => setContingencyPercent(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Tax / VAT (%)</label>
                  <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Previous Period Total</label>
                  <input type="number" value={previousPeriodTotal} onChange={(e) => setPreviousPeriodTotal(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50" />
                </div>
              </div>

              {/* Facility type template button */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Info size={16} className="text-primary shrink-0" />
                <p className="text-sm text-text-tertiary flex-1">
                  Apply <strong className="text-foreground">{getFacilityTypes().find((t) => t.value === facilityType)?.label}</strong> template with pre-populated line items and FM guidance.
                </p>
                <button onClick={applyFacilityTemplate}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-90 transition-colors">
                  Apply Template
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LINE ITEMS */}
          {step === 2 && (
            <div className="space-y-6">
              {/* PdM Integration */}
              {pdmSuggestions.length > 0 && (
                <div className="rounded-xl border border-success/30 bg-success/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator size={16} className="text-success" />
                      <span className="text-foreground text-sm font-medium">Predictive Maintenance Analysis</span>
                      <span className="text-text-tertiary text-xs">{pdmSuggestions.length} suggested line items</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowPdM(!showPdM)}
                        className="h-8 px-3 rounded-lg bg-muted text-foreground text-xs hover:bg-muted transition-colors">
                        {showPdM ? "Hide" : "Review"}
                      </button>
                      <button onClick={applyAllPdM}
                        className="h-8 px-3 rounded-lg bg-success text-primary-foreground text-xs font-medium hover:brightness-90 transition-colors">
                        Apply All
                      </button>
                    </div>
                  </div>
                  {showPdM && (
                    <div className="mt-3 space-y-2">
                      {pdmSuggestions.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card-alt border border-border">
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-sm">{s.description}</p>
                            <p className="text-text-tertiary text-xs mt-0.5">
                              {formatCurrency(s.unitRate)} × {s.quantity} = {formatCurrency(s.unitRate * s.quantity)}
                              <span className="ml-2">Health: {s.assetHealthScore}/100</span>
                              <span className="ml-2">MTBF: {s.mtbf.toLocaleString()}hrs</span>
                            </p>
                            <p className="text-text-muted text-xs mt-0.5 truncate">{s.rcmRationale}</p>
                          </div>
                          <button onClick={() => applyPdMSuggestion(s)}
                            className="h-8 px-3 rounded-lg bg-success/20 text-success text-xs font-medium hover:bg-success/30 transition-colors shrink-0 ml-3">
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category sections */}
              {categories.map((cat) => {
                const Icon = ICON_MAP[cat.icon] || FileText;
                const isExpanded = expandedCats[cat.categoryId] ?? true;
                return (
                  <div key={cat.categoryId} className="bg-card-alt rounded-xl border border-border overflow-hidden">
                    <button onClick={() => toggleCat(cat.categoryId)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}20` }}>
                          <Icon size={18} style={{ color: cat.color }} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-foreground font-semibold text-sm">{cat.categoryName}</h3>
                          <p className="text-text-tertiary text-xs">{cat.items.length} items · {formatCurrency(cat.subtotal)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); addLineItem(cat.categoryId); }}
                          className="h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1">
                          <Plus size={12} /> Add Item
                        </button>
                        {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <p className="text-text-muted text-xs mb-3 italic">{cat.definition}</p>
                        <p className="text-text-muted text-xs mb-3 border-l-2 border-primary/30 pl-3">{cat.guidance}</p>

                        {/* Guidance by facility type */}
                        {facilityType && (
                          <p className="text-success text-xs mb-3 italic">
                            {getFacilityTypeGuidance(facilityType, cat.categoryId)}
                          </p>
                        )}

                        {cat.items.length === 0 ? (
                          <p className="text-text-muted text-sm text-center py-6">No line items. Click "Add Item" or apply a facility template above.</p>
                        ) : (
                          <div className="space-y-2">
                            {cat.items.map((item) => (
                              <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg bg-card border border-border">
                                <div className="col-span-4">
                                  <input value={item.description} onChange={(e) => updateLineItem(cat.categoryId, item.id, { description: e.target.value })}
                                    placeholder="Description of work"
                                    className="w-full h-9 px-2 rounded-lg bg-card-alt border border-border text-foreground text-xs outline-none focus:border-primary/50" />
                                  <input value={item.notes} onChange={(e) => updateLineItem(cat.categoryId, item.id, { notes: e.target.value })}
                                    placeholder="Notes (FM rationale)"
                                    className="w-full h-7 px-2 rounded-lg bg-card-alt border border-border text-text-tertiary text-[10px] outline-none focus:border-primary/50 mt-1" />
                                </div>
                                <div className="col-span-1">
                                  <input type="number" value={item.quantity || ""} onChange={(e) => updateLineItem(cat.categoryId, item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-9 px-2 rounded-lg bg-card-alt border border-border text-foreground text-xs text-center outline-none focus:border-primary/50" />
                                </div>
                                <div className="col-span-2">
                                  <input type="number" value={item.unitRate || ""} onChange={(e) => updateLineItem(cat.categoryId, item.id, { unitRate: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-9 px-2 rounded-lg bg-card-alt border border-border text-foreground text-xs text-right outline-none focus:border-primary/50" />
                                </div>
                                <div className="col-span-2">
                                  <div className="h-9 flex items-center justify-end px-2 bg-card-alt rounded-lg border border-border">
                                    <span className="text-foreground text-xs font-medium">{formatCurrency(item.amount)}</span>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <select value={item.workType} onChange={(e) => updateLineItem(cat.categoryId, item.id, { workType: e.target.value })}
                                    className="w-full h-9 px-2 rounded-lg bg-card-alt border border-border text-foreground text-xs outline-none focus:border-primary/50">
                                    <option value="PM">PM</option>
                                    <option value="CM">CM</option>
                                    <option value="Energy">Energy</option>
                                    <option value="Opex">Opex</option>
                                    <option value="Capex">Capex</option>
                                    <option value="Materials">Materials</option>
                                    <option value="Safety">Safety</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="Reserve">Reserve</option>
                                  </select>
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                  <button onClick={() => removeLineItem(cat.categoryId, item.id)}
                                    className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end mt-2 pt-2 border-t border-border">
                          <span className="text-text-tertiary text-xs">Subtotal:</span>
                          <span className="text-foreground text-sm font-bold ml-2">{formatCurrency(cat.subtotal)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 3: NARRATIVE & TOTALS */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Budget Narrative</label>
                  <textarea value={budgetNarrative} onChange={(e) => setBudgetNarrative(e.target.value)}
                    rows={5}
                    placeholder="Explain strategic decisions, KPIs, and facility management approach..."
                    className="w-full px-3 py-2 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-muted outline-none focus:border-primary/50 resize-none" />
                </div>
                <div>
                  <label className="text-text-secondary text-sm block mb-1.5">Risk Analysis & Mitigation</label>
                  <textarea value={riskAnalysis} onChange={(e) => setRiskAnalysis(e.target.value)}
                    rows={5}
                    placeholder="Describe risk mitigation strategies, contingency allocation rationale..."
                    className="w-full px-3 py-2 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-muted outline-none focus:border-primary/50 resize-none" />
                </div>
              </div>

              {/* Totals summary */}
              <div className="bg-card-alt rounded-xl border border-border p-5">
                <h3 className="text-foreground font-semibold text-sm mb-4">Budget Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Total Opex</p>
                    <p className="text-lg font-bold text-[var(--color-info)] mt-1">{formatCurrency(totals.totalOpex)}</p>
                    <p className="text-text-muted text-xs">{totals.grandTotal > 0 ? Math.round((totals.totalOpex / totals.grandTotal) * 100) : 0}% of total</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Total Capex</p>
                    <p className="text-lg font-bold text-[var(--color-purple)] mt-1">{formatCurrency(totals.totalCapex)}</p>
                    <p className="text-text-muted text-xs">{totals.grandTotal > 0 ? Math.round((totals.totalCapex / totals.grandTotal) * 100) : 0}% of total</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Contingency ({contingencyPercent}%)</p>
                    <p className="text-lg font-bold text-primary mt-1">{formatCurrency(totals.contingencyAmount)}</p>
                    <p className="text-text-muted text-xs">Risk allocation buffer</p>
                  </div>
                    <div className="p-3 rounded-lg bg-card border border-success/20">
                    <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Grand Total</p>
                    <p className="text-lg font-bold text-success mt-1">{formatCurrency(totals.grandTotal)}</p>
                    <p className="text-text-muted text-xs">{previousPeriodTotal > 0 ? `${((totals.grandTotal / previousPeriodTotal - 1) * 100).toFixed(1)}% vs previous` : ""}</p>
                  </div>
                </div>

                {/* Budget per asset */}
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Budget Per Asset</p>
                    <p className="text-base font-bold text-foreground mt-1">
                      {formatCurrency(assetCount > 0 ? totals.grandTotal / assetCount : 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Capex/Opex Ratio</p>
                    <p className="text-base font-bold text-foreground mt-1">
                      1:{totals.totalOpex > 0 ? (totals.totalCapex / totals.totalOpex).toFixed(1) : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Per Critical Asset</p>
                    <p className="text-base font-bold text-foreground mt-1">
                      {formatCurrency(criticalAssetCount > 0 ? totals.grandTotal / criticalAssetCount : 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex gap-2">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)}
                  className="h-10 px-5 rounded-lg bg-muted text-foreground text-sm hover:bg-muted transition-colors">
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="h-10 px-5 rounded-lg bg-muted text-foreground text-sm hover:bg-muted transition-colors">
                Cancel
              </button>
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)}
                  className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-90 transition-colors">
                  Next
                </button>
              ) : (
                <button onClick={handleSave}
                  className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-90 transition-colors flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  {isEdit ? "Update Budget" : "Create Budget"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
