"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Coins } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="glass-panel mb-8 flex size-24 items-center justify-center rounded-full"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 320, damping: 16 }}
        >
          <CheckCircle2 className="size-12 text-primary" aria-hidden />
        </motion.div>
      </motion.div>
      <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Purchase Successful!</h1>
      <p className="mb-8 max-w-md text-lg text-on-surface-variant">
        Your credits have been added to your account. Start generating
        high-quality speech in the Studio.
      </p>
      <div className="glass-panel mb-8 w-full max-w-md rounded-2xl p-6 text-left">
        <div className="mb-4 flex justify-between border-b border-white/10 pb-4 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Confirmation
          </span>
          <span className="font-mono font-bold text-primary">#VF-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="size-5 text-amber-400" />
            <h2 className="text-xl font-bold">Credits Added</h2>
          </div>
          <span className="text-lg font-bold text-primary">Active</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="rounded-full px-12" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button size="lg" variant="outline" className="rounded-full px-12 border-white/10" asChild>
          <Link href="/studio">Open Studio</Link>
        </Button>
      </div>
    </div>
  );
}
