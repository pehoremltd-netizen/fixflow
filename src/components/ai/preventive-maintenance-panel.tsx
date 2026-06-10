"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Wrench, AlertTriangle } from "lucide-react";
import { getRiskBadgeColor } from "@/lib/ai-intelligence";
import type { PreventiveSuggestion } from "@/lib/ai-intelligence";

interface PreventiveMaintenancePanelProps {
  suggestions: PreventiveSuggestion[];
}

export function PreventiveMaintenancePanel({ suggestions }: PreventiveMaintenancePanelProps) {
  return (
    <Card className="border-[#222222] bg-[#161616]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Wrench className="h-4 w-4 text-[#D4AF37]" />
              Recommended Maintenance Tasks
            </CardTitle>
            <CardDescription className="text-[#B8B8B8]">AI-generated preventive suggestions</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] gap-1 border-[#D4AF37]/30 text-[#D4AF37]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
            AI Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-[#222222] hover:bg-white/5 transition-colors"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                s.priority === "high" ? "bg-[#EF4444]/10" :
                s.priority === "medium" ? "bg-[#E1B000]/10" :
                "bg-[#D4AF37]/10"
              }`}>
                {s.priority === "high" ? (
                  <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                ) : (
                  <Wrench className={`h-4 w-4 ${s.priority === "medium" ? "text-[#E1B000]" : "text-[#D4AF37]"}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{s.task}</p>
                  <Badge className={`text-[10px] ${getRiskBadgeColor(s.priority)}`}>{s.priority}</Badge>
                </div>
                <p className="text-xs text-[#7A7A7A]">{s.assetName}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7A7A7A]">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{s.suggestedDate}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.downtimeImpact}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
