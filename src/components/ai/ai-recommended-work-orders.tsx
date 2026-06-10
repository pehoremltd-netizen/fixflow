"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Brain, Sparkles, Wrench } from "lucide-react";
import { getRiskBadgeColor } from "@/lib/ai-intelligence";
import type { AIWorkOrderSuggestion } from "@/lib/ai-intelligence";

interface AIRecommendedWorkOrdersProps {
  suggestions: AIWorkOrderSuggestion[];
}

export function AIRecommendedWorkOrders({ suggestions }: AIRecommendedWorkOrdersProps) {
  return (
    <Card className="border-[#D4AF37]/20 bg-[#161616] gold-glow-subtle">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              AI Recommended Work Orders
            </CardTitle>
            <CardDescription className="text-[#B8B8B8]">Auto-generated based on asset condition</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-[10px] border-[#D4AF37]/30 text-[#D4AF37]">
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
                  ? "border-[#EF4444]/30 bg-[#EF4444]/5"
                  : s.priority === "high"
                  ? "border-[#E1B000]/30 bg-[#E1B000]/5"
                  : "border-[#222222] hover:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${
                  s.priority === "critical" ? "bg-[#EF4444]/10" :
                  s.priority === "high" ? "bg-[#E1B000]/10" :
                  "bg-[#D4AF37]/10"
                }`}>
                  {s.priority === "critical" ? (
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                    </motion.div>
                  ) : (
                    <Wrench className={`h-4 w-4 ${s.priority === "high" ? "text-[#E1B000]" : "text-[#D4AF37]"}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{s.title}</p>
                    <Badge className={`text-[10px] ${getRiskBadgeColor(s.priority)}`}>{s.priority}</Badge>
                  </div>
                  <p className="text-xs text-[#7A7A7A] mt-0.5">{s.assetName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-[#B8B8B8] italic">"{s.reason}"</p>
                    <Badge variant="outline" className="text-[9px] gap-1 ml-2 shrink-0 border-[#D4AF37]/20 text-[#D4AF37]">
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
