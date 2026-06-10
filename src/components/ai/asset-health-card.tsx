"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { getHealthColor, getHealthBg, getHealthBadgeVariant } from "@/lib/ai-intelligence";
import type { AssetHealth } from "@/lib/ai-intelligence";

interface AssetHealthCardProps {
  data: AssetHealth;
  index?: number;
}

export function AssetHealthCard({ data, index = 0 }: AssetHealthCardProps) {
  const TrendIcon = data.trend === "improving" ? TrendingUp : data.trend === "degrading" ? TrendingDown : Minus;
  const trendColor = data.trend === "improving" ? "text-[#D4AF37]" : data.trend === "degrading" ? "text-[#EF4444]" : "text-[#7A7A7A]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="relative overflow-hidden group border-[#222222] bg-[#161616] card-hover">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{data.assetName}</p>
              <p className="text-xs text-[#7A7A7A]">{data.category}</p>
            </div>
            <Badge variant={getHealthBadgeVariant(data.status)} className="ml-2 shrink-0">
              {data.status}
            </Badge>
          </div>

          <div className="flex items-end gap-3 mb-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold tabular-nums ${getHealthColor(data.healthScore)}`}>
                {data.healthScore}
              </span>
              <span className="text-sm text-[#7A7A7A]">%</span>
            </div>
            <div className={`flex items-center gap-0.5 text-xs mb-1 ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span className="capitalize">{data.trend}</span>
            </div>
          </div>

          <div className="relative h-2 bg-[#222222] rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${getHealthBg(data.healthScore)}`}
              initial={{ width: 0 }}
              animate={{ width: `${data.healthScore}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 + index * 0.1 }}
            />
            {data.healthScore < 50 && (
              <motion.div
                className="absolute inset-0 rounded-full bg-[#EF4444]/20"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[#7A7A7A] flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {data.lastUpdated}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
