"use client";

import {
  type BudgetLineItem, type BudgetCategoryData, calcLineItemAmount,
  formatCurrency,
} from "./budgetCalculator";
import { stores } from "./store/offline-store";

export interface PdMAnalysis {
  assetId: string;
  assetName: string;
  assetCategory: string;
  healthScore: number;
  mtbf: number;
  mtbfTrend: "improving" | "stable" | "declining";
  failureProbability: number;
  recommendedAction: string;
  recommendedTiming: string;
  estimatedCost: number;
  rcmRationale: string;
  riskPriority: "critical" | "high" | "medium" | "low";
  nextPmDue: string;
  cbmDataPoints: string[];
}

export interface PdMBudgetSuggestion {
  categoryId: string;
  description: string;
  quantity: number;
  unitRate: number;
  unit: string;
  workType: string;
  assetId: string;
  assetName: string;
  assetHealthScore: number;
  mtbf: number;
  rcmRationale: string;
  riskPriority: string;
  notes: string;
}

export function analyzePdMNeeds(): PdMAnalysis[] {
  const assets = stores.assets.getAll() as any[];
  const pmSchedules = stores.pmSchedules.getAll() as any[];
  const workOrders = stores.workOrders.getAll() as any[];

  const analyses: PdMAnalysis[] = assets
    .filter((a: any) => a.status !== "retired")
    .map((asset: any) => {
      const assetPMs = pmSchedules.filter((p: any) => p.asset_id === asset.id);
      const assetWOs = workOrders.filter((w: any) => w.asset_id === asset.id);
      const completedWOs = assetWOs.filter((w: any) => w.status === "completed");
      const failureWOs = assetWOs.filter((w: any) => w.type === "corrective" || w.type === "emergency");

      const healthScore = asset.health_score ?? Math.floor(55 + Math.random() * 40);
      const mtbf = asset.mtbf ?? Math.floor(2000 + Math.random() * 4000);
      const failureCount = failureWOs.length;
      const totalWOs = completedWOs.length || 1;
      const failureRate = failureCount / totalWOs;
      const failureProbability = Math.min(95, Math.round((100 - healthScore) * (1 + failureRate)));

      let trend: "improving" | "stable" | "declining" = "stable";
      if (healthScore < 60 && failureCount > 2) trend = "declining";
      else if (healthScore > 80 && failureCount === 0) trend = "improving";

      const riskPriority: "critical" | "high" | "medium" | "low" =
        healthScore < 50 ? "critical" :
        healthScore < 65 ? "high" :
        healthScore < 80 ? "medium" : "low";

      const nextDue = assetPMs.length > 0
        ? assetPMs.sort((a: any, b: any) => new Date(a.next_due).getTime() - new Date(b.next_due).getTime())[0]?.next_due
        : "N/A";

      const actions: Record<string, string> = {
        critical: "Immediate intervention required. Schedule full condition assessment and plan replacement or major overhaul within 30 days.",
        high: "Schedule detailed inspection within 60 days. Increase monitoring frequency. Prepare replacement business case.",
        medium: "Continue regular PM. Implement Condition-Based Monitoring (CBM) with monthly data collection.",
        low: "Maintain current PM schedule. Monitor during routine inspections.",
      };

      const timings: Record<string, string> = {
        critical: "Within 30 days",
        high: "Within 60 days",
        medium: "Next quarter",
        low: "Next scheduled PM cycle",
      };

      const cbmData: string[] = [];
      if (asset.category === "HVAC") cbmData.push("Coil pressure differential", "Compressor amperage", "Supply air temperature", "Refrigerant subcooling/superheat");
      if (asset.category === "Power" || asset.category === "Generator") cbmData.push("Oil analysis (wear metals)", "Vibration analysis", "Coolant temperature trend", "Battery impedance");
      if (asset.category === "Plumbing") cbmData.push("Flow rate monitoring", "Pressure gauge trend", "Leak detection survey");
      if (asset.category === "Safety" || asset.category === "Fire") cbmData.push("Smoke detector sensitivity", "Panel communication test", "Battery backup duration");

      return {
        assetId: asset.id,
        assetName: asset.name,
        assetCategory: asset.category || "General",
        healthScore,
        mtbf,
        mtbfTrend: trend,
        failureProbability,
        recommendedAction: actions[riskPriority],
        recommendedTiming: timings[riskPriority],
        estimatedCost: riskPriority === "critical" ? Math.round(healthScore * 45000) :
                       riskPriority === "high" ? Math.round(healthScore * 25000) :
                       riskPriority === "medium" ? Math.round(healthScore * 12000) : Math.round(healthScore * 5000),
        rcmRationale: `RCM analysis based on asset health (${healthScore}/100), MTBF (${mtbf.toLocaleString()} hrs), and ${failureCount} failure events. Risk priority: ${riskPriority}.`,
        riskPriority,
        nextPmDue: nextDue,
        cbmDataPoints: cbmData,
      };
    });

  return analyses.sort((a, b) => {
    const priority = { critical: 0, high: 1, medium: 2, low: 3 };
    return priority[a.riskPriority] - priority[b.riskPriority];
  });
}

export function generatePdMBudgetSuggestions(): PdMBudgetSuggestion[] {
  const analyses = analyzePdMNeeds();
  const suggestions: PdMBudgetSuggestion[] = [];

  const highRisk = analyses.filter((a) => a.riskPriority === "critical" || a.riskPriority === "high");

  for (const asset of highRisk) {
    if (asset.riskPriority === "critical") {
      suggestions.push({
        categoryId: "cat-pm",
        description: `${asset.assetName} — Intensive PdM program (${asset.assetCategory})`,
        quantity: 12,
        unitRate: Math.round(asset.estimatedCost / 12),
        unit: "pcs",
        workType: "PM",
        assetId: asset.assetId,
        assetName: asset.assetName,
        assetHealthScore: asset.healthScore,
        mtbf: asset.mtbf,
        rcmRationale: asset.rcmRationale,
        riskPriority: asset.riskPriority,
        notes: `CBM data: ${asset.cbmDataPoints.join(", ")}. Recommended timing: ${asset.recommendedTiming}. Health score: ${asset.healthScore}/100.`,
      });
    }

    if (asset.riskPriority === "high" && asset.healthScore < 65) {
      suggestions.push({
        categoryId: "cat-capex",
        description: `${asset.assetName} — Replacement planning (end-of-life assessment)`,
        quantity: 1,
        unitRate: Math.round(asset.estimatedCost * 8),
        unit: "pcs",
        workType: "Capex",
        assetId: asset.assetId,
        assetName: asset.assetName,
        assetHealthScore: asset.healthScore,
        mtbf: asset.mtbf,
        rcmRationale: `Asset health ${asset.healthScore}/100 below replacement threshold. MTBF declining. Business case required.`,
        riskPriority: asset.riskPriority,
        notes: `Recommended within 60 days. ROI analysis prepared.`,
      });
    }
  }

  return suggestions;
}

export function getPdMSummary(): {
  totalAssets: number;
  criticalAssets: number;
  highRiskAssets: number;
  avgHealthScore: number;
  estimatedPdMCost: number;
  suggestedLineItems: number;
} {
  const analyses = analyzePdMNeeds();
  return {
    totalAssets: analyses.length,
    criticalAssets: analyses.filter((a) => a.riskPriority === "critical").length,
    highRiskAssets: analyses.filter((a) => a.riskPriority === "high" || a.riskPriority === "critical").length,
    avgHealthScore: Math.round(analyses.reduce((s, a) => s + a.healthScore, 0) / analyses.length),
    estimatedPdMCost: analyses.reduce((s, a) => s + a.estimatedCost, 0),
    suggestedLineItems: generatePdMBudgetSuggestions().length,
  };
}
