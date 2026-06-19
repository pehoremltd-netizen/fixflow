"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Brain, Sparkles, Wrench } from "lucide-react";
import { getRiskBadgeColor } from "@/lib/store/ai-intelligence";
import type { AIWorkOrderSuggestion } from "@/lib/store/ai-intelligence";

interface AIRecommendedWorkOrdersProps {
  suggestions: AIWorkOrderSuggestion[];
}

export function AIRecommendedWorkOrders({ suggestions }: AIRecommendedWorkOrdersProps) {
  return (
    <Card className="border-primary/20 bg-card theme-glow-subtle">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Recommended Work Orders
            </CardTitle>
            <CardDescription className="text-text-secondary">Auto-generated based on asset condition</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-[10px] border-primary/30 text-primary">
            <Brain className="h-3 w-3" />
            AI Suggested
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-lg border p-3 transition-all hover:shadow-md ${
                s.priority === "critical"
                  ? "border-destructive/30 bg-destructive/5"
                  : s.priority === "high"
                  ? "border-warning/30 bg-warning/5"
                  : "border-border hover:bg-accent"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${
                  s.priority === "critical" ? "bg-destructive/10" :
                  s.priority === "high" ? "bg-warning/10" :
                  "bg-primary/10"
                }`}>
                  {s.priority === "critical" ? (
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </motion.div>
                  ) : (
                    <Wrench className={`h-4 w-4 ${s.priority === "high" ? "text-warning" : "text-primary"}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <Badge className={`text-[10px] ${getRiskBadgeColor(s.priority)}`}>{s.priority}</Badge>
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">{s.assetName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-text-secondary italic">"{s.reason}"</p>
                    <Badge variant="outline" className="text-[9px] gap-1 ml-2 shrink-0 border-primary/20 text-primary">
                      <Brain className="h-2.5 w-2.5" />
                      Auto-priority
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
