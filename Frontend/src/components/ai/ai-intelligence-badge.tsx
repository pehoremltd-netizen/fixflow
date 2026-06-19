"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export function AIIntelligenceBadge() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-1.5 text-[11px] text-primary font-medium px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain className="h-3.5 w-3.5" />
      </motion.div>
      <span>AI Monitoring Active</span>
      <span className="relative flex h-1.5 w-1.5 ml-0.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
      </span>
    </motion.div>
  );
}
