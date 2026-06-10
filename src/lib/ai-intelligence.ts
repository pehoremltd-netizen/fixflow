export type HealthStatus = "healthy" | "warning" | "critical";
export type TrendDirection = "improving" | "stable" | "degrading";

export interface AssetHealth {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  healthScore: number;
  trend: TrendDirection;
  status: HealthStatus;
  lastUpdated: string;
}

export interface FailurePrediction {
  assetId: string;
  assetName: string;
  riskScore: number;
  estimatedTimeToFailure: string;
  insight: string;
  severity: "low" | "medium" | "high";
}

export interface PreventiveSuggestion {
  id: string;
  task: string;
  assetName: string;
  priority: "low" | "medium" | "high";
  suggestedDate: string;
  downtimeImpact: string;
}

export interface AIWorkOrderSuggestion {
  id: string;
  title: string;
  assetName: string;
  reason: string;
  priority: "low" | "medium" | "high" | "critical";
  suggestedBy: string;
}

const endOfMonth = () => {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 14) + 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const mockAssetHealthData: AssetHealth[] = [
  { id: "ah-1", assetId: "AST-001", assetName: "HVAC Unit - Main Building", category: "HVAC", healthScore: 92, trend: "stable", status: "healthy", lastUpdated: "2 min ago" },
  { id: "ah-2", assetId: "AST-002", assetName: "Generator - Backup Power", category: "Electrical", healthScore: 78, trend: "degrading", status: "warning", lastUpdated: "5 min ago" },
  { id: "ah-3", assetId: "AST-003", assetName: "Fire Alarm Panel", category: "Fire Safety", healthScore: 95, trend: "improving", status: "healthy", lastUpdated: "1 min ago" },
  { id: "ah-4", assetId: "AST-004", assetName: "Chiller - Cooling System", category: "HVAC", healthScore: 45, trend: "degrading", status: "critical", lastUpdated: "3 min ago" },
  { id: "ah-5", assetId: "AST-005", assetName: "Water Pump - Main Supply", category: "Plumbing", healthScore: 82, trend: "stable", status: "healthy", lastUpdated: "4 min ago" },
  { id: "ah-6", assetId: "AST-006", assetName: "Elevator - Passenger", category: "Mechanical", healthScore: 68, trend: "degrading", status: "warning", lastUpdated: "2 min ago" },
];

export const mockFailurePredictions: FailurePrediction[] = [
  { assetId: "AST-004", assetName: "Chiller - Cooling System", riskScore: 87, estimatedTimeToFailure: "12-14 days", insight: "High vibration detected pattern (simulated). Compressor bearing wear likely.", severity: "high" },
  { assetId: "AST-002", assetName: "Generator - Backup Power", riskScore: 62, estimatedTimeToFailure: "30-45 days", insight: "Electrical load irregularity detected. Voltage fluctuations observed.", severity: "medium" },
  { assetId: "AST-006", assetName: "Elevator - Passenger", riskScore: 55, estimatedTimeToFailure: "45-60 days", insight: "Cable tension variance detected. Recommended inspection within 72 hours.", severity: "medium" },
  { assetId: "AST-001", assetName: "HVAC Unit - Main Building", riskScore: 18, estimatedTimeToFailure: "180+ days", insight: "All parameters within normal range. Routine maintenance only.", severity: "low" },
];

export const mockPreventiveSuggestions: PreventiveSuggestion[] = [
  { id: "pm-1", task: "Inspect motor bearings", assetName: "Chiller - Cooling System", priority: "high", suggestedDate: endOfMonth(), downtimeImpact: "4 hours" },
  { id: "pm-2", task: "Replace air filters", assetName: "HVAC Unit - Main Building", priority: "medium", suggestedDate: endOfMonth(), downtimeImpact: "1 hour" },
  { id: "pm-3", task: "Check electrical wiring stability", assetName: "Generator - Backup Power", priority: "high", suggestedDate: endOfMonth(), downtimeImpact: "3 hours" },
  { id: "pm-4", task: "Lubricate elevator cables", assetName: "Elevator - Passenger", priority: "medium", suggestedDate: endOfMonth(), downtimeImpact: "2 hours" },
  { id: "pm-5", task: "Test fire alarm sensors", assetName: "Fire Alarm Panel", priority: "low", suggestedDate: endOfMonth(), downtimeImpact: "30 min" },
  { id: "pm-6", task: "Replace water pump seals", assetName: "Water Pump - Main Supply", priority: "low", suggestedDate: endOfMonth(), downtimeImpact: "2 hours" },
];

export const mockAIWorkOrderSuggestions: AIWorkOrderSuggestion[] = [
  { id: "ai-wo-1", title: "Emergency chiller bearing replacement", assetName: "Chiller - Cooling System", reason: "Failure risk 87% - critical threshold exceeded", priority: "critical", suggestedBy: "AI Predictive Engine" },
  { id: "ai-wo-2", title: "Generator voltage regulator calibration", assetName: "Generator - Backup Power", reason: "Electrical load irregularity pattern detected", priority: "high", suggestedBy: "AI Predictive Engine" },
  { id: "ai-wo-3", title: "Elevator cable tension adjustment", assetName: "Elevator - Passenger", reason: "Cable wear pattern above normal threshold", priority: "medium", suggestedBy: "AI Preventive Engine" },
  { id: "ai-wo-4", title: "HVAC filter replacement (scheduled)", assetName: "HVAC Unit - Main Building", reason: "Routine preventive maintenance due", priority: "low", suggestedBy: "AI Preventive Engine" },
];

export function getHealthColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

export function getHealthBg(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function getHealthBadgeVariant(status: HealthStatus): "success" | "warning" | "destructive" {
  if (status === "healthy") return "success";
  if (status === "warning") return "warning";
  return "destructive";
}

export function getRiskBadgeColor(severity: "low" | "medium" | "high" | "critical"): string {
  switch (severity) {
    case "critical": return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-900";
    case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400 border-orange-200 dark:border-orange-900";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
    case "low": return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-900";
  }
}
