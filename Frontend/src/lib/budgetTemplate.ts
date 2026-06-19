"use client";

import {
  type BudgetCategoryData, type BudgetLineItem, type FacilityType,
  type BudgetPeriod, calcLineItemAmount,
} from "./budgetCalculator";

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function li(
  desc: string, qty: number, rate: number, unit: string,
  workType: string, notes: string, isCapex = false,
  asset = "", health = 85, mtbfV = 0, rcm = "",
  lastYear = 0, recurring = true, freq = ""
): BudgetLineItem {
  return {
    id: genId(), description: desc, quantity: qty, unitRate: rate,
    amount: calcLineItemAmount(qty, rate), unit, workType, notes,
    isRecurring: recurring, recurringFrequency: freq || (workType === "PM" ? "monthly" : "quarterly"),
    assetId: "", assetName: asset, assetHealthScore: health, mtbf: mtbfV,
    rcmRationale: rcm, lastYearAmount: lastYear || qty * rate * 0.92, isCapex,
  };
}

const facilityCategoryDefinitions: Record<FacilityType, {
  cat: string;
  items: BudgetLineItem[];
  guidance: string;
}[]> = {
  office: [
    { cat: "cat-pm", items: [], guidance: "Focus on HVAC comfort cooling, generator reliability, and fire safety. Office PM is weighted toward occupant comfort and business continuity." },
    { cat: "cat-cm", items: [], guidance: "Emergency response times critical for occupied spaces. Plumbing and electrical dominate CM spend in office environments." },
    { cat: "cat-utilities", items: [], guidance: "Office buildings consume 60% of energy on HVAC and lighting. Implement occupancy-based controls." },
    { cat: "cat-personnel", items: [], guidance: "Staff-to-area ratio: 1 technician per 8,000 sqm. Include reception and janitorial supervision." },
    { cat: "cat-capex", items: [], guidance: "Office fit-out cycles every 7-10 years. Prioritize HVAC replacement and energy upgrades." },
    { cat: "cat-materials", items: [], guidance: "Stock critical spares for HVAC, electrical, and plumbing. Imported items require 8-10 week lead time." },
    { cat: "cat-compliance", items: [], guidance: "Fire safety, LASEPA compliance, and insurance are mandatory. Annual third-party fire audit." },
    { cat: "cat-building", items: [], guidance: "Façade maintenance, waterproofing, and common area finishes. Tropical climate accelerates deterioration." },
    { cat: "cat-contingency", items: [], guidance: "10% standard. Allocate for HVAC emergency repairs and water damage from heavy rainfall." },
  ],
  hospital: [
    { cat: "cat-pm", items: [
      li("Medical gas system — PM & certification", 12, 280000, "pcs", "PM", "Monthly. Medical oxygen, nitrous oxide, vacuum systems. Regulatory compliance required.", false, "Medical Gas System", 90, 6200, "Critical for patient care. Zero tolerance for failure. Bi-annual certification.", 3000000),
      li("Sterilizer & autoclave PM — CSSD", 12, 185000, "pcs", "PM", "Monthly. Temperature calibration, seal integrity, pressure tests. Infection control critical.", false, "CSSD Equipment", 88, 4800, "RCM: Failure causes surgery delays. Redundant units recommended.", 2000000),
      li("Backup power — UPS & generator PM (weekly)", 52, 65000, "pcs", "PM", "Weekly. Operating theatre UPS, generator auto-start test, battery bank check. Zero downtime tolerance.", false, "Critical Power System", 85, 2200, "Life safety critical. Dual redundant configuration. Weekly testing mandatory.", 3200000),
    ], guidance: "Hospital PM is life-critical. Focus on medical gas, sterilizers, HVAC for isolation rooms, and backup power. Backup power weekly testing mandatory." },
    { cat: "cat-cm", items: [], guidance: "Response time <15 minutes for critical areas (OT, ICU). Maintain emergency contractor retainer." },
    { cat: "cat-utilities", items: [
      li("Electricity — Hospital tariff", 12, 850000, "pcs", "Energy", "Hospital tariff B tier. 24/7 operation — no load shedding option. Estimated 85,000 kWh/month.", false, "", 0, 0, "", 9200000),
      li("Diesel — Critical backup (24/7 readiness)", 52, 185000, "pcs", "Energy", "Weekly refueling. 24-hr autonomy for all critical systems. NESREA compliance.", false, "", 0, 0, "", 9200000),
    ], guidance: "Hospitals consume 2-3x more energy than offices. Diesel backup for 24hr autonomy. Budget for medical waste treatment." },
    { cat: "cat-capex", items: [], guidance: "Medical equipment lifecycle 5-8 years. Include imaging equipment, surgical lights, and patient bed replacement." },
    { cat: "cat-building", items: [], guidance: "Infection control requirements drive finishes selection. Anti-microbial surfaces, HEPA filtration, pressure differential monitoring." },
  ],
  industrial: [
    { cat: "cat-pm", items: [
      li("Production line — Weekly PM inspections", 52, 120000, "pcs", "PM", "Weekly. Conveyor belts, gearboxes, motors, sensors. Production downtime = ₦2M/hr.", false, "Production Line", 82, 1800, "RCM: Critical assets. Predictive maintenance using vibration analysis and thermal imaging.", 5800000),
      li("Compressed air system PM", 12, 180000, "pcs", "PM", "Monthly. Compressor oil change, dryer maintenance, filter replacement, leak detection.", false, "Air Compressor AC-01", 76, 2400, "CBM: Dew point monitoring. Leaks cost 30% of compressed air energy.", 2000000),
    ], guidance: "Industrial PM focuses on production-critical assets. Downtime cost is the primary driver. Implement PdM with vibration analysis and thermal imaging." },
    { cat: "cat-cm", items: [], guidance: "CM budget higher for industrial due to asset intensity. Maintain spares for critical production equipment." },
    { cat: "cat-utilities", items: [
      li("Electricity — Industrial tariff", 12, 1200000, "pcs", "Energy", "Industrial tariff D tier. Estimated 120,000 kWh/month. Power factor penalty avoidance.", false, "", 0, 0, "", 13000000),
      li("Diesel — Heavy equipment & backup", 48, 250000, "pcs", "Energy", "Weekly. Forklifts, boom lifts, and generator backup. High-consumption industrial operations.", false, "", 0, 0, "", 11000000),
    ], guidance: "Industrial utilities cost 2-4x commercial. Power factor correction mandatory to avoid penalties." },
    { cat: "cat-capex", items: [], guidance: "Capital replacement based on lifecycle analysis. Production equipment 10-15 year lifecycle in tropical conditions." },
    { cat: "cat-building", items: [], guidance: "Warehouse floor repairs, dock levelers, structural steel maintenance. Heavy-duty finishes required." },
  ],
  residential: [
    { cat: "cat-pm", items: [
      li("Swimming pool — Water quality & equipment PM", 52, 35000, "pcs", "PM", "Weekly. pH testing, chlorine dosing, filter backwash, pump check. 50,000 litre pool.", false, "Pool System", 80, 4200, "Health & safety critical. Lagos State pool safety compliance.", 1700000),
      li("Borehole & water treatment PM", 12, 85000, "pcs", "PM", "Monthly. Water quality testing, filter replacement, pump performance check, tank cleaning.", false, "Borehole BH-01", 76, 3100, "RCM: Water supply continuity critical. Backup borehole recommended.", 920000),
    ], guidance: "Residential PM focuses on occupant comfort and safety. Swimming pool, borehole, and generator are key assets. Pest control premium." },
    { cat: "cat-cm", items: [], guidance: "Tenant satisfaction drives CM response. After-hours plumbing and electrical service essential." },
    { cat: "cat-utilities", items: [], guidance: "Residential utility costs shared or metered individually. Estate common area lighting and pumping costs." },
    { cat: "cat-building", items: [], guidance: "Façade cleaning, landscaping, common area lighting. Tropical garden maintenance is 30% of estate Opex." },
    { cat: "cat-capex", items: [], guidance: "Unit refurbishment cycle 5-7 years. Include kitchen, bathroom, and MEP upgrades." },
  ],
  hospitality: [
    { cat: "cat-pm", items: [
      li("Guest room HVAC — Quarterly deep service", 4, 450000, "pcs", "PM", "Quarterly. 90 guest rooms. Coil cleaning, filter replacement, drain pan treatment, thermostat calibration.", false, "Guest Room HVAC", 82, 3600, "RCM: Guest comfort = revenue. 5-star rating requires whisper-quiet operation (<35dB).", 4800000),
      li("Laundry equipment PM — Commercial washers & dryers", 12, 140000, "pcs", "PM", "Monthly. 8x commercial washer-extractors, 6x tumble dryers. Steam coil maintenance.", false, "Laundry Equipment", 78, 2800, "Critical for hotel operations. Linen capacity: 2,500 sets/day.", 1600000),
      li("Kitchen equipment PM — Commercial catering", 12, 250000, "pcs", "PM", "Monthly. Walk-in chillers, blast freezers, ovens, dishwashers, extraction hoods. Fire suppression check.", false, "Kitchen Equipment", 80, 3200, "RCM: Kitchen downtime = food spoilage. Redundant refrigeration critical.", 2800000),
    ], guidance: "Hospitality PM is revenue-critical. Guest comfort, kitchen, and laundry are top priorities. Zero visibility of maintenance to guests." },
    { cat: "cat-cm", items: [], guidance: "Emergency CM must be invisible to guests. After-hours maintenance with minimal disruption." },
    { cat: "cat-utilities", items: [], guidance: "Hospitality energy consumption peaks during high-occupancy. HVAC and laundry are major loads." },
    { cat: "cat-building", items: [], guidance: "Aesthetic finishes critical for brand standards. Lobby, restaurant, and public area maintenance premium." },
    { cat: "cat-capex", items: [], guidance: "FF&E replacement cycle 5-7 years. Guest room refurbishment, lobby renovation, pool deck upgrades." },
  ],
};

export function getFacilityDefinition(catId: string, facilityType: FacilityType): { guidance: string } | undefined {
  const defs = facilityCategoryDefinitions[facilityType];
  if (!defs) return undefined;
  return defs.find((d) => d.cat === catId);
}

export function getFacilityTypeGuidance(facilityType: FacilityType, catId: string): string {
  const def = getFacilityDefinition(catId, facilityType);
  return def?.guidance || "";
}

export function getFacilityTypeItems(facilityType: FacilityType, catId: string): BudgetLineItem[] {
  const defs = facilityCategoryDefinitions[facilityType];
  if (!defs) return [];
  const def = defs.find((d) => d.cat === catId);
  return def?.items || [];
}

export function getFacilityTypes(): { value: FacilityType; label: string; description: string }[] {
  return [
    { value: "office", label: "Commercial Office", description: "Corporate office buildings, business centers, co-working spaces" },
    { value: "hospital", label: "Hospital / Healthcare", description: "Hospitals, clinics, medical centers, healthcare facilities" },
    { value: "industrial", label: "Industrial / Manufacturing", description: "Factories, warehouses, production plants, logistics hubs" },
    { value: "residential", label: "Residential Estate", description: "Apartment complexes, gated estates, condominiums" },
    { value: "hospitality", label: "Hospitality / Hotel", description: "Hotels, resorts, restaurants, entertainment venues" },
  ];
}

export function getPeriodLabel(period: BudgetPeriod): string {
  const labels: Record<BudgetPeriod, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Annual",
  };
  return labels[period];
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "var(--color-text-muted)",
    submitted: "var(--color-info)",
    approved: "var(--color-success)",
    rejected: "#E05C5C",
  };
  return colors[status] || "var(--color-text-muted)";
}

export const FM_CATEGORY_DEFINITIONS: { id: string; name: string; icon: string; color: string; definition: string; guidance: string }[] = [
  {
    id: "cat-pm", name: "Preventive Maintenance (PM)", icon: "ClipboardCheck", color: "var(--color-success)",
    definition: "Scheduled asset servicing, inspections, PM plans, routine maintenance based on asset lifecycle, predictive maintenance (PdM) based on Condition-Based Monitoring (CBM) and asset health scores.",
    guidance: "PM is the cornerstone of facility reliability. Industry standard allocates 40-50% of Opex to PM. For tropical Nigerian climates, increase filter replacements and generator servicing frequency by 30% due to dust and heat. Follow ISO 41001 and manufacturer OEM schedules.",
  },
  {
    id: "cat-cm", name: "Corrective Maintenance (CM)", icon: "Wrench", color: "var(--color-warning)",
    definition: "Reactive repairs, emergency breakdowns, unplanned work orders, failure repairs to restore asset function.",
    guidance: "Industry benchmark: CM should not exceed 15-20% of total maintenance spend. High CM indicates weak PM program. Historical data shows emergency plumbing and electrical repairs dominate. Budget based on 3-year historical average with 10% escalation for aging infrastructure.",
  },
  {
    id: "cat-utilities", name: "Utilities & Energy Management", icon: "Zap", color: "var(--color-destructive)",
    definition: "Electricity, water, diesel consumption for backup power, utility cost forecasting, energy efficiency initiatives.",
    guidance: "Utilities represent 25-35% of facility operating costs in Nigeria. Diesel backup power is a major cost driver due to grid instability. Implement energy efficiency measures: LED retrofits (30% savings), power factor correction (15% savings), and solar hybrid integration. Budget 5% annual escalation for tariff increases.",
  },
  {
    id: "cat-personnel", name: "Personnel & Facility Operations", icon: "Users", color: "var(--color-info)",
    definition: "Maintenance technicians, contractors, staff training, certifications, SLA compliance management.",
    guidance: "Personnel costs are 30-40% of total facility Opex. Staffing ratio: 1 technician per 8,000 sqm for commercial offices. Include training budgets for certifications (CFM, FMP, NEBOSH). Contractor management costs include vendor SLA monitoring and performance scorecards.",
  },
  {
    id: "cat-capex", name: "Capital Expenditure (Capex)", icon: "Briefcase", color: "var(--color-accent-foreground)",
    definition: "Equipment replacement, asset lifecycle renewals, building system upgrades, infrastructure improvements exceeding ₦500,000.",
    guidance: "Capex planning follows asset lifecycle analysis. Replacement criteria: asset health score <50, MTBF declining >20% YoY, repair cost >60% of replacement value. Budget approval requires business case with ROI analysis. For Nigerian facilities, prioritize generator and HVAC replacements due to harsh operating conditions.",
  },
  {
    id: "cat-materials", name: "Materials, Supplies & Inventory", icon: "Package", color: "var(--color-info)",
    definition: "Spare parts stock, consumables, PPE, tools, maintenance chemicals, inventory management.",
    guidance: "Inventory turnover ratio target: 4-6x annually. Maintain safety stock for critical spares (filters, belts, bearings, lamps). Use ABC analysis: A-items (high value) = 10% of stock, 70% of value. Paramedic approach: stock what fails most. For Nigerian facilities, factor 8-12 week lead times for imported spares.",
  },
  {
    id: "cat-compliance", name: "Compliance, Safety & Risk Management", icon: "AlertTriangle", color: "var(--color-primary)",
    definition: "Regulatory audits, certifications, insurance, safety equipment, risk mitigation, hazard assessments.",
    guidance: "Compliance is non-negotiable. Nigerian regulations: Lagos State Safety Commission, NESREA, fire service, LASEPA. ISO 41001 (Facility Management) and ISO 45001 (OH&S) standards apply. Budget for bi-annual third-party audits, statutory inspections, and insurance premiums.",
  },
  {
    id: "cat-building", name: "Building Systems & Infrastructure", icon: "Building2", color: "var(--color-warning)",
    definition: "HVAC, electrical, plumbing, security, fire safety, structural improvements for building envelope.",
    guidance: "Building systems represent the physical asset base. Structural integrity inspections annually. Prioritize waterproofing in Nigerian tropical climate (rainy season May-Oct). Security system upgrades including CCTV and access control are essential for urban facilities.",
  },
  {
    id: "cat-contingency", name: "Contingency Reserve", icon: "Shield", color: "var(--color-primary)",
    definition: "10-15% budget buffer for emergency repairs, unplanned failures, risk-based allocation for unforeseen events.",
    guidance: "Industry standard: 10-15% of total Opex+Capex. Higher for older facilities (15%) or facilities with critical operations (hospitals: 15-20%). Allocation strategy based on risk assessment: asset criticality, age profile, historical failure rate, and business impact.",
  },
];
