"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Progress({ className, value = 0 }) {
  const v = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-white/10",
        className
      )}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-action to-primary"
        initial={false}
        animate={{ width: `${v}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      />
    </div>
  );
}
