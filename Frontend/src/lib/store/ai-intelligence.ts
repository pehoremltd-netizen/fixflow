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

export const mockAssetHealthData: AssetHealth[] = [];

export const mockFailurePredictions: FailurePrediction[] = [];

export const mockPreventiveSuggestions: PreventiveSuggestion[] = [];

export const mockAIWorkOrderSuggestions: AIWorkOrderSuggestion[] = [];

export function getHealthColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

export function getHealthBg(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-destructive";
}

export function getHealthBadgeVariant(status: HealthStatus): "success" | "warning" | "destructive" {
  if (status === "healthy") return "success";
  if (status === "warning") return "warning";
  return "destructive";
}

export function getRiskBadgeColor(severity: "low" | "medium" | "high" | "critical"): string {
  switch (severity) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/20";
    case "high": return "bg-warning/10 text-warning border-warning/20";
    case "medium": return "bg-warning/10 text-warning border-warning/20";
    case "low": return "bg-success/10 text-success border-success/20";
  }
}
