"use client";

const STORAGE_KEY = "fixflow-premium-budgets";
const TEMPLATE_KEY = "fixflow-budget-settings";

export type BudgetPeriod = "monthly" | "quarterly" | "yearly";
export type BudgetStatus = "draft" | "submitted" | "approved" | "rejected";
export type FacilityType = "office" | "hospital" | "industrial" | "residential" | "hospitality";

export interface BudgetLineItem {
  id: string;
  description: string;
  quantity: number;
  unitRate: number;
  amount: number;
  unit: string;
  workType: string;
  notes: string;
  isRecurring: boolean;
  recurringFrequency: string;
  assetId: string;
  assetName: string;
  assetHealthScore: number;
  mtbf: number;
  rcmRationale: string;
  lastYearAmount: number;
  isCapex: boolean;
}

export interface BudgetCategoryData {
  categoryId: string;
  categoryName: string;
  workType: string;
  icon: string;
  color: string;
  definition: string;
  guidance: string;
  items: BudgetLineItem[];
  subtotal: number;
  isCapex: boolean;
}

export interface BudgetProposal {
  id: string;
  title: string;
  facilityName: string;
  facilityType: FacilityType;
  location: string;
  period: BudgetPeriod;
  fiscalYear: number;
  preparedBy: string;
  preparedDate: string;
  reviewedBy: string;
  status: BudgetStatus;
  categories: BudgetCategoryData[];
  contingencyPercent: number;
  contingencyAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalOpex: number;
  totalCapex: number;
  grandTotal: number;
  budgetNarrative: string;
  riskAnalysis: string;
  previousPeriodTotal: number;
  variance: number;
  variancePercent: number;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
  approvedBy: string;
  budgetControlNumber: string;
  assetCount: number;
  criticalAssetCount: number;
  slaTargets: string;
  facilityManagerSignature: string;
  operationsManagerSignature: string;
  financeSignature: string;
  directorSignature: string;
}

export interface BudgetSettings {
  currency: string;
  locale: string;
  defaultContingency: number;
  defaultTax: number;
  organizationName: string;
  defaultFacilityName: string;
}

const DEFAULT_SETTINGS: BudgetSettings = {
  currency: "NGN",
  locale: "en-NG",
  defaultContingency: 10,
  defaultTax: 7.5,
  organizationName: "FixFlow Facility Management",
  defaultFacilityName: "Lekki Phase 1 Facility Complex",
};

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

export function formatCurrencyShort(n: number): string {
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₦${(n / 1000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export function calcLineItemAmount(qty: number, rate: number): number {
  return round2(qty * rate);
}

export function calcCategorySubtotal(items: BudgetLineItem[]): number {
  return round2(items.reduce((s, i) => s + i.amount, 0));
}

export function calcTotalOpex(categories: BudgetCategoryData[]): number {
  return round2(categories.filter((c) => !c.isCapex).reduce((s, c) => s + c.subtotal, 0));
}

export function calcTotalCapex(categories: BudgetCategoryData[]): number {
  return round2(categories.filter((c) => c.isCapex).reduce((s, c) => s + c.subtotal, 0));
}

export function calcGrandTotal(opex: number, capex: number, contingencyPercent: number, taxPercent: number): {
  totalOpex: number; totalCapex: number; contingencyAmount: number;
  taxAmount: number; grandTotal: number;
} {
  const totalOpex = round2(opex);
  const totalCapex = round2(capex);
  const subtotal = round2(totalOpex + totalCapex);
  const contingencyAmount = round2(subtotal * (contingencyPercent / 100));
  const afterContingency = round2(subtotal + contingencyAmount);
  const taxAmount = round2(afterContingency * (taxPercent / 100));
  const grandTotal = round2(afterContingency + taxAmount);
  return { totalOpex, totalCapex, contingencyAmount, taxAmount, grandTotal };
}

export function calcVariance(current: number, previous: number): { variance: number; variancePercent: number } {
  const v = round2(current - previous);
  const pct = previous > 0 ? round2((v / previous) * 100) : 0;
  return { variance: v, variancePercent: pct };
}

export function calcBudgetPerAsset(total: number, assetCount: number): number {
  return assetCount > 0 ? round2(total / assetCount) : 0;
}

export function getBudgetSettings(): BudgetSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(TEMPLATE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
}

export function saveBudgetSettings(s: Partial<BudgetSettings>): BudgetSettings {
  const current = getBudgetSettings();
  const updated = { ...current, ...s };
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(updated));
  return updated;
}

export function loadBudgets(): BudgetProposal[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveBudgets(data: BudgetProposal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getBudgetById(id: string): BudgetProposal | undefined {
  return loadBudgets().find((b) => b.id === id);
}

export function createBudget(data: Partial<BudgetProposal> & { categories: BudgetCategoryData[] }): BudgetProposal {
  const list = loadBudgets();
  const fiscalYear = data.fiscalYear || new Date().getFullYear();
  const seq = list.filter((b) => b.fiscalYear === fiscalYear).length + 1;
  const opex = calcTotalOpex(data.categories);
  const capex = calcTotalCapex(data.categories);
  const cc = data.contingencyPercent ?? 10;
  const tx = data.taxPercent ?? 7.5;
  const totals = calcGrandTotal(opex, capex, cc, tx);
  const ctrlNo = `BUD-${fiscalYear}-${String(seq).padStart(3, "0")}`;

  const proposal: BudgetProposal = {
    id: genId(),
    title: data.title || `${fiscalYear} Facility Budget Proposal`,
    facilityName: data.facilityName || "Facility Complex",
    facilityType: data.facilityType || "office",
    location: data.location || "Lagos, Nigeria",
    period: data.period || "yearly",
    fiscalYear,
    preparedBy: data.preparedBy || "Facility Manager",
    preparedDate: data.preparedDate || new Date().toISOString(),
    reviewedBy: data.reviewedBy || "",
    status: "draft",
    categories: data.categories.map((c) => ({
      ...c,
      subtotal: calcCategorySubtotal(c.items),
    })),
    contingencyPercent: data.contingencyPercent ?? 10,
    contingencyAmount: totals.contingencyAmount,
    taxPercent: data.taxPercent ?? 7.5,
    taxAmount: totals.taxAmount,
    totalOpex: totals.totalOpex,
    totalCapex: totals.totalCapex,
    grandTotal: totals.grandTotal,
    budgetNarrative: data.budgetNarrative || "",
    riskAnalysis: data.riskAnalysis || "",
    previousPeriodTotal: data.previousPeriodTotal || 0,
    variance: 0,
    variancePercent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedAt: "",
    approvedBy: "",
    budgetControlNumber: ctrlNo,
    assetCount: data.assetCount || 0,
    criticalAssetCount: data.criticalAssetCount || 0,
    slaTargets: data.slaTargets || "99% uptime, 4-hour response",
    facilityManagerSignature: "",
    operationsManagerSignature: "",
    financeSignature: "",
    directorSignature: "",
  };
  proposal.variance = proposal.previousPeriodTotal > 0
    ? round2(proposal.grandTotal - proposal.previousPeriodTotal) : 0;
  proposal.variancePercent = proposal.previousPeriodTotal > 0
    ? round2((proposal.variance / proposal.previousPeriodTotal) * 100) : 0;

  list.push(proposal);
  saveBudgets(list);
  return proposal;
}

export function updateBudget(id: string, data: Partial<BudgetProposal>): BudgetProposal | undefined {
  const list = loadBudgets();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  const existing = list[idx];

  const categories = data.categories || existing.categories;
  const opex = calcTotalOpex(categories);
  const capex = calcTotalCapex(categories);
  const cc = data.contingencyPercent ?? existing.contingencyPercent;
  const tx = data.taxPercent ?? existing.taxPercent;
  const totals = calcGrandTotal(opex, capex, cc, tx);

  const updated: BudgetProposal = {
    ...existing,
    ...data,
    categories: categories.map((c) => ({ ...c, subtotal: calcCategorySubtotal(c.items) })),
    totalOpex: totals.totalOpex,
    totalCapex: totals.totalCapex,
    contingencyAmount: totals.contingencyAmount,
    taxAmount: totals.taxAmount,
    grandTotal: totals.grandTotal,
    updatedAt: new Date().toISOString(),
  };
  if (updated.previousPeriodTotal > 0) {
    updated.variance = round2(updated.grandTotal - updated.previousPeriodTotal);
    updated.variancePercent = round2((updated.variance / updated.previousPeriodTotal) * 100);
  }
  list[idx] = updated;
  saveBudgets(list);
  return updated;
}

export function deleteBudget(id: string): void {
  const list = loadBudgets();
  saveBudgets(list.filter((b) => b.id !== id));
}

export function approveBudget(id: string, approvedBy: string): BudgetProposal | undefined {
  return updateBudget(id, { status: "approved", approvedBy, approvedAt: new Date().toISOString() });
}

export function submitBudget(id: string): BudgetProposal | undefined {
  return updateBudget(id, { status: "submitted" });
}

function createSeedBudgets(): BudgetProposal[] { return []; }
export function getSeedCategoryData(): BudgetCategoryData[] {
  const lineItem = (
    desc: string, qty: number, rate: number, unit: string,
    workType: string, notes: string, isCapex = false,
    asset = "", health = 85, mtbfV = 0, rcm = "",
    lastYear = 0, recurring = true, freq = ""
  ): BudgetLineItem => ({
    id: genId(), description: desc, quantity: qty, unitRate: rate,
    amount: calcLineItemAmount(qty, rate), unit, workType, notes,
    isRecurring: recurring, recurringFrequency: freq || (workType === "PM" ? "monthly" : "quarterly"),
    assetId: "", assetName: asset, assetHealthScore: health, mtbf: mtbfV,
    rcmRationale: rcm, lastYearAmount: lastYear || round2(qty * rate * 0.92), isCapex,
  });

  const cats: BudgetCategoryData[] = [
    {
      categoryId: "cat-pm",
      categoryName: "Preventive Maintenance (PM)",
      workType: "PM",
      icon: "ClipboardCheck",
      color: "var(--color-success)",
      definition: "Scheduled asset servicing, inspections, routine maintenance based on asset lifecycle, and predictive maintenance (PdM) using Condition-Based Monitoring (CBM) and asset health scores.",
      guidance: "PM is the cornerstone of facility reliability. Industry standard allocates 40-50% of Opex to PM. For tropical Nigerian climates, increase filter replacements and generator servicing frequency by 30% due to dust and heat. Follow ISO 41001 and manufacturer OEM schedules.",
      isCapex: false,
      subtotal: 0,
      items: [
        lineItem("HVAC PM — Air filter replacement (12 units)", 144, 4500, "pcs", "PM", "Monthly replacement, tropical climate — high dust load. Carrier/Hitachi spec.", false, "HVAC Unit A1-A12", 78, 4200, "RCM: Filters degrade 40% faster in Lagos humidity. Monthly replacement prevents coil fouling. MTBF: 4,200 hrs", 620000),
        lineItem("HVAC PM — Condenser coil cleaning (6 units)", 12, 35000, "pcs", "PM", "Bi-monthly chemical cleaning. Essential for heat exchange efficiency in coastal environment.", false, "HVAC Unit A1-A6", 72, 3600, "CBM: Pressure differential monitoring indicates quarterly cleaning needed. Prevents compressor failure.", 380000),
        lineItem("Generator PM — Oil & filter change (3 units)", 12, 85000, "pcs", "PM", "Monthly oil change using SAE 15W-40. Critical for standby power reliability.", false, "Generator B1-B3", 82, 2800, "MTBF: 2,800 hrs. Oil analysis every 500 hrs. Extends engine life by 40%.", 900000),
        lineItem("Generator PM — Load bank testing (3 units)", 4, 120000, "pcs", "PM", "Quarterly 30-min load test at 75% capacity. Identifies wet stacking and fuel degradation.", false, "Generator B1-B3", 82, 2800, "RCM: Wet stacking causes 60% of generator failures. Quarterly testing reduces risk by 85%.", 440000),
        lineItem("Fire Alarm System — Quarterly test", 4, 95000, "pcs", "PM", "Full system test of all 45 smoke detectors, 12 pull stations, and alarm panels.", false, "Fire Panel FP-01", 90, 5200, "Compliance requirement: NFPA 72. Certifies building safety systems.", 350000),
        lineItem("Water Pump PM — Bearing lubrication & seal check", 12, 22000, "pcs", "PM", "Monthly lubrication of pump bearings, mechanical seal inspection, coupling alignment.", false, "Water Pump P1-P4", 75, 3100, "CBM: Vibration analysis quarterly. Early seal wear detection prevents catastrophic failure.", 240000),
        lineItem("Elevator PM — Monthly servicing (2 units)", 12, 150000, "pcs", "PM", "Otis OEM-specified monthly maintenance. Includes cable tension, brake adjustment, door sensors.", false, "Elevator E1-E2", 85, 4500, "Statutory requirement. SLA compliance critical for high-rise accessibility.", 1650000),
      ],
    },
    {
      categoryId: "cat-cm",
      categoryName: "Corrective Maintenance (CM)",
      workType: "CM",
      icon: "Wrench",
      color: "var(--color-warning)",
      definition: "Reactive repairs, emergency breakdowns, unplanned work orders, and failure repairs to restore asset function.",
      guidance: "Industry benchmark: CM should not exceed 15-20% of total maintenance spend. High CM indicates weak PM program. Historical data shows emergency plumbing and electrical repairs dominate. Budget based on 3-year historical average with 10% escalation for aging infrastructure.",
      isCapex: false,
      subtotal: 0,
      items: [
        lineItem("Emergency plumbing repairs — Burst pipes, leaks", 12, 85000, "pcs", "CM", "Average 1-2 emergency callouts/month. Includes pipe repair, valve replacement, water damage mitigation.", false, "Plumbing System", 65, 1800, "", 900000),
        lineItem("Emergency electrical repairs — Trips, faults", 8, 75000, "pcs", "CM", "MCCB trips, cable faults, socket replacements. Priority response required for occupied buildings.", false, "Electrical System", 70, 2200, "", 550000),
        lineItem("HVAC breakdown repairs — Compressor, fan motor", 4, 180000, "pcs", "CM", "Aging units (8+ years) require increasing compressor and fan motor replacements.", false, "HVAC Units", 68, 3600, "", 650000),
        lineItem("Generator breakdown repairs — Fuel system, starter", 3, 150000, "pcs", "CM", "Fuel pump failures, starter motor issues, battery bank replacement.", false, "Generator B1-B3", 72, 2800, "", 420000),
        lineItem("Plumbing fixture replacements — WCs, taps, valves", 24, 18500, "pcs", "CM", "High-traffic washrooms require fixture replacements every 6-8 months.", false, "Plumbing Fixtures", 60, 0, "", 400000),
      ],
    },
    {
      categoryId: "cat-utilities",
      categoryName: "Utilities & Energy Management",
      workType: "Energy",
      icon: "Zap",
      color: "var(--color-destructive)",
      definition: "Electricity, water, diesel consumption for backup power, utility cost forecasting, and energy efficiency initiatives.",
      guidance: "Utilities represent 25-35% of facility operating costs in Nigeria. Diesel backup power is a major cost driver due to grid instability. Implement energy efficiency measures: LED retrofits (30% savings), power factor correction (15% savings), and solar hybrid integration. Budget 5% annual escalation for tariff increases.",
      isCapex: false,
      subtotal: 0,
      items: [
        lineItem("Electricity — Building A (Ikeja Electric)", 12, 485000, "pcs", "Energy", "Monthly consumption estimated at 45,000 kWh. Tariff class A3 — commercial.", false, "Utility Meter M-01", 0, 0, "", 5200000),
        lineItem("Electricity — Building B (Ikeja Electric)", 12, 320000, "pcs", "Energy", "Monthly consumption 28,000 kWh. Includes basement parking and common areas.", false, "Utility Meter M-02", 0, 0, "", 3500000),
        lineItem("Diesel — Backup generators", 24, 185000, "pcs", "Energy", "Bi-weekly refueling. Estimated 12-15 hrs/week grid outage during rainy season.", false, "Generator B1-B3", 0, 0, "", 4000000),
        lineItem("Water supply — Lagos Water Corporation", 12, 95000, "pcs", "Energy", "Monthly water consumption ~500,000 litres. Includes irrigation and cooling tower makeup.", false, "Water Meter WM-01", 0, 0, "", 1050000),
        lineItem("Energy efficiency — LED retrofit program", 1, 2800000, "pcs", "Energy", "Retrofit 850 fixtures to LED. Estimated payback 14 months. 30% energy reduction.", true, "Lighting System", 0, 0, "", 0),
      ],
    },
    {
      categoryId: "cat-personnel",
      categoryName: "Personnel & Facility Operations",
      workType: "Opex",
      icon: "Users",
      color: "var(--color-info)",
      definition: "Maintenance technicians, contractors, staff training, certifications, and SLA compliance management.",
      guidance: "Personnel costs are 30-40% of total facility Opex. Staffing ratio: 1 technician per 8,000 sqm for commercial offices. Include training budgets for certifications (CFM, FMP, NEBOSH). Contractor management costs include vendor SLA monitoring and performance scorecards.",
      isCapex: false,
      subtotal: 0,
      items: [
        lineItem("Maintenance technicians (6 staff) — Salaries & benefits", 12, 1850000, "pcs", "Opex", "6 full-time technicians covering mechanical, electrical, and plumbing disciplines.", false, "", 0, 0, "", 20000000),
        lineItem("Facility Manager — Salary & benefits", 12, 750000, "pcs", "Opex", "Professional facility manager with CFM certification.", false, "", 0, 0, "", 8200000),
        lineItem("Staff training & certifications", 1, 1850000, "pcs", "Opex", "NEBOSH IGC for 3 staff, CFM certification renewal, safety training, trade certifications.", false, "", 0, 0, "", 1600000),
        lineItem("PPE & safety gear — Annual issue", 10, 45000, "pcs", "Opex", "Safety boots, helmets, gloves, overalls, ear protection per MSDS standards.", false, "", 0, 0, "", 420000),
        lineItem("Contractor management & SLA monitoring", 12, 120000, "pcs", "Opex", "Monthly vendor performance reviews, SLA compliance audits, contractor coordination.", false, "", 0, 0, "", 1300000),
      ],
    },
    {
      categoryId: "cat-capex",
      categoryName: "Capital Expenditure (Capex)",
      workType: "Capex",
      icon: "Briefcase",
      color: "var(--color-accent-foreground)",
      definition: "Equipment replacement, asset lifecycle renewals, building system upgrades, and infrastructure improvements exceeding ₦500,000.",
      guidance: "Capex planning follows asset lifecycle analysis. Replacement criteria: asset health score <50, MTBF declining >20% YoY, repair cost >60% of replacement value. Budget approval requires business case with ROI analysis. For Nigerian facilities, prioritize generator and HVAC replacements due to harsh operating conditions.",
      isCapex: true,
      subtotal: 0,
      items: [
        lineItem("HVAC Unit #3 & #5 — Full replacement", 2, 4500000, "pcs", "Capex", "Carrier 48HJ units exceeding 12-year lifecycle. R410A refrigerant phase-out compliance. Estimated energy savings 35%.", true, "HVAC Unit A3, A5", 45, 2400, "Asset health score 45/100. Repair cost ratio 72%. Replacement justified per lifecycle cost analysis. ROI: 3.2 years.", 0),
        lineItem("Generator B2 — Major overhaul", 1, 3200000, "pcs", "Capex", "Kohler 150REZX at 18,000 hrs. Complete engine overhaul including injectors, turbo, alternator.", true, "Generator B2", 48, 1800, "MTBF declining 25% YoY. Overhaul extends life 5 years at 40% of replacement cost. RCM recommendation.", 0),
        lineItem("Fire alarm panel — Upgrade to addressable system", 1, 2800000, "pcs", "Capex", "Upgrade conventional system to addressable Notifier NFS-640. Compliance with new fire safety regulations.", true, "Fire Panel FP-01", 55, 0, "Regulatory mandate. Current system non-compliant with 2025 fire safety code.", 0),
        lineItem("Solar hybrid power — Feasibility & installation", 1, 8500000, "pcs", "Capex", "150kWp solar PV with 200kWh battery storage. 40% diesel reduction. ROI: 4.5 years. 15-year system life.", true, "Power System", 0, 0, "Strategic initiative. Reduces grid dependency by 60%. Qualifies for CACS carbon credits.", 0),
      ],
    },
    {
      categoryId: "cat-materials",
      categoryName: "Materials, Supplies & Inventory",
      workType: "Materials",
      icon: "Package",
      color: "var(--color-info)",
      definition: "Spare parts stock, consumables, PPE, tools, maintenance chemicals, and inventory management for facility operations.",
      guidance: "Inventory turnover ratio target: 4-6x annually. Maintain safety stock for critical spares (filters, belts, bearings, lamps). Use ABC analysis: A-items (high value) = 10% of stock, 70% of value. Paramedic approach: stock what fails most. For Nigerian facilities, factor 8-12 week lead times for imported spares.",
      isCapex: false,
      subtotal: 0,
      items: [
        lineItem("HVAC spares — Filters, belts, bearings, refrigerant", 4, 285000, "pcs", "Materials", "Quarterly replenishment. Critical spares for 12 HVAC units. R410A refrigerant stock.", false, "", 0, 0, "", 1200000),
        lineItem("Electrical spares — MCBs, cables, lamps, ballasts", 4, 185000, "pcs", "Materials", "Quarterly. LED drivers, MCBs (10-63A), cable drums, connectors, emergency light batteries.", false, "", 0, 0, "", 780000),
        lineItem("Plumbing spares — Valves, pipes, fittings, seals", 4, 145000, "pcs", "Materials", "Quarterly. Compression fittings, gate valves, float valves, tap cartridges, toilet spares.", false, "", 0, 0, "", 620000),
        lineItem("Generator spares — Oil filters, fuel filters, belts", 4, 195000, "pcs", "Materials", "Quarterly. OEM-specified Kohler/Cummins filters. Critical for scheduled PMs.", false, "", 0, 0, "", 820000),
        lineItem("Janitorial & cleaning chemicals", 12, 85000, "pcs", "Materials", "Monthly. Floor cleaners, disinfectants, glass cleaners, hand soaps — eco-friendly certified.", false, "", 0, 0, "", 960000),
        lineItem("Tools & workshop equipment", 2, 250000, "pcs", "Materials", "Bi-annual. Power tools, multimeters, manometers, pipe threaders, ladders.", false, "", 0, 0, "", 480000),
      ],
    },
    {
      categoryId: "cat-compliance",
      categoryName: "Compliance, Safety & Risk Management",
      workType: "Safety",
      icon: "AlertTriangle",
      color: "var(--color-primary)",
      definition: "Regulatory audits, certifications, insurance, safety equipment, risk mitigation, and hazard assessments for facility compliance.",
      guidance: "Compliance is non-negotiable. Nigerian regulations: Lagos State Safety Commission, NESREA, fire service, LASEPA. ISO 41001 (Facility Management) and ISO 45001 (OH&S) standards apply. Budget for bi-annual third-party audits, statutory inspections, and insurance premiums. Risk assessment updated annually.",
      isCapex: false,
      subtotal: 0,
      items: [
        lineItem("Fire extinguisher — Annual certification (45 units)", 1, 480000, "pcs", "Safety", "Annual pressure test, refill, and certification per NFPA 10. All 45 units across 3 buildings.", false, "Fire Extinguishers", 0, 0, "", 450000),
        lineItem("Fire & safety audit — Third-party inspection", 2, 350000, "pcs", "Safety", "Bi-annual independent audit. Includes fire risk assessment, escape routes, alarm tests.", false, "", 0, 0, "Regulatory requirement for commercial buildings >5 floors.", 650000),
        lineItem("Insurance — Facility & equipment all-risk", 1, 3200000, "pcs", "Safety", "Annual premium. All-risk cover for building, equipment, generators, HVAC, elevators.", false, "", 0, 0, "", 3000000),
        lineItem("Safety equipment & signage", 2, 180000, "pcs", "Safety", "Bi-annual. Emergency exit signs, fire assembly point signs, safety data sheets, first aid kits.", false, "", 0, 0, "", 340000),
        lineItem("Environmental compliance — LASEPA/NESREA", 2, 250000, "pcs", "Safety", "Bi-annual. Waste disposal permits, emissions testing, noise level assessments, effluent analysis.", false, "", 0, 0, "Statutory. Fines for non-compliance can exceed ₦5M.", 460000),
        lineItem("Staff safety training & drills", 4, 145000, "pcs", "Safety", "Quarterly. Fire drills, first aid training, emergency response, chemical handling, working at height.", false, "", 0, 0, "", 550000),
      ],
    },
    {
      categoryId: "cat-building",
      categoryName: "Building Systems & Infrastructure",
      workType: "Infrastructure",
      icon: "Building2",
      color: "var(--color-warning)",
      definition: "HVAC, electrical, plumbing, security, fire safety, and structural improvements for building envelope and core systems.",
      guidance: "Building systems represent the physical asset base. Structural integrity inspections annually. Prioritize waterproofing in Nigerian tropical climate (rainy season May-Oct). Security system upgrades including CCTV and access control are essential for urban facilities. Budget 2-3% of facility replacement value for envelope maintenance.",
      isCapex: false,
      subtotal: 0,
      items: [
        lineItem("Building waterproofing — Roof & wall seals", 2, 450000, "pcs", "Infrastructure", "Bi-annual pre-rainy season. Epoxy injections, sealant replacement, roof coating. Building A & B.", false, "Building Envelope", 70, 0, "", 850000),
        lineItem("CCTV system — Maintenance & repairs", 4, 125000, "pcs", "Infrastructure", "Quarterly. Camera cleaning, DVR maintenance, cable checks, firmware updates. 24 cameras.", false, "CCTV System", 75, 0, "", 480000),
        lineItem("Access control — Door controllers, readers", 4, 85000, "pcs", "Infrastructure", "Quarterly. 12 access points. Card reader cleaning, door controller battery backup check.", false, "Access Control", 80, 0, "", 320000),
        lineItem("Structural inspections — Building integrity", 1, 650000, "pcs", "Infrastructure", "Annual. Structural engineer assessment. Crack monitoring, foundation check, load assessment.", false, "Building Structure", 85, 0, "", 600000),
        lineItem("Painting & finishing — Common areas", 1, 1800000, "pcs", "Infrastructure", "Annual. Lobbies, corridors, stairwells. High-traffic areas require more frequent repainting.", false, "Interior Finishes", 65, 0, "", 1600000),
        lineItem("Sewage & drainage system maintenance", 4, 180000, "pcs", "Infrastructure", "Quarterly. Septic tank desludging, drain jetting, sump pump check, sewage ejector maintenance.", false, "Drainage System", 72, 0, "", 680000),
      ],
    },
    {
      categoryId: "cat-contingency",
      categoryName: "Contingency Reserve",
      workType: "Reserve",
      icon: "Shield",
      color: "var(--color-primary)",
      definition: "10-15% budget buffer for emergency repairs, unplanned failures, and risk-based allocation for unforeseen facility events.",
      guidance: "Industry standard: 10-15% of total Opex+Capex. Higher for older facilities (15%) or facilities with critical operations (hospitals: 15-20%). Allocation strategy based on risk assessment: asset criticality, age profile, historical failure rate, and business impact. Trigger points defined for release of contingency funds.",
      isCapex: false,
      subtotal: 0,
      items: [
        lineItem("Emergency HVAC breakdown — Critical asset buffer", 1, 0, "pcs", "Reserve", "Allocated for catastrophic HVAC failure. Highest risk category based on asset health scores.", false, "", 0, 0, "", 0),
        lineItem("Emergency generator failure — Business continuity", 1, 0, "pcs", "Reserve", "Standby power critical for business operations. Contingency for extended outage scenarios.", false, "", 0, 0, "", 0),
        lineItem("Emergency water damage — Flood/pipe burst", 1, 0, "pcs", "Reserve", "Tropical climate risk. Heavy rainfall May-Oct increases water ingress probability 3x.", false, "", 0, 0, "", 0),
        lineItem("Regulatory fine provision", 1, 0, "pcs", "Reserve", "Buffer for unforeseen regulatory penalties, compliance escalations, or urgent statutory requirements.", false, "", 0, 0, "", 0),
      ],
    },
  ];
  cats.forEach((c) => { c.subtotal = calcCategorySubtotal(c.items); });
  return cats;
}
