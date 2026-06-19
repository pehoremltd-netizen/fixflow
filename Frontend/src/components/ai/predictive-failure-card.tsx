"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Brain } from "lucide-react";
import { getRiskBadgeColor } from "@/lib/store/ai-intelligence";
import type { FailurePrediction } from "@/lib/store/ai-intelligence";

interface PredictiveFailureCardProps {
  data: FailurePrediction;
  index?: number;
}

export function PredictiveFailureCard({ data, index = 0 }: PredictiveFailureCardProps) {
  const borderColor = data.severity === "high" ? "border-l-destructive"
    : data.severity === "medium" ? "border-l-warning" : "border-l-primary";

  const barColor = data.riskScore >= 70 ? "bg-destructive"
    : data.riskScore >= 40 ? "bg-warning" : "bg-primary";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className={`border-l-4 ${borderColor} border-border bg-card`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {data.severity === "high" && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </motion.div>
                )}
                <p className="text-sm font-medium text-foreground truncate">{data.assetName}</p>
              </div>
            </div>
            <Badge className={`ml-2 shrink-0 text-[10px] ${getRiskBadgeColor(data.severity)}`}>
              Risk: {data.riskScore}%
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-tertiary mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ETTF: {data.estimatedTimeToFailure}
            </span>
          </div>

          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-2">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${data.riskScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {data.severity === "high" && (
              <motion.div
                className="absolute inset-0 rounded-full bg-destructive/20"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>

          <div className="flex items-start gap-2 p-2 rounded-md bg-muted">
            <Brain className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-text-secondary leading-relaxed">{data.insight}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
