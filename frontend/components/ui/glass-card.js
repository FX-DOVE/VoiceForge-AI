"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  hover = true,
  ...props
}) {
  return (
    <motion.div
      className={cn("glass-card rounded-2xl p-6", className)}
      whileHover={
        hover
          ? { y: -4, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }
          : undefined
      }
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
