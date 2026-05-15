"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
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
      <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Upgrade Successful!</h1>
      <p className="mb-8 max-w-md text-lg text-on-surface-variant">
        Your Pro Plan is now active. You&apos;ve unlocked hi-fi cloning and
        unlimited studio generations.
      </p>
      <div className="glass-panel mb-8 w-full max-w-md rounded-2xl p-6 text-left">
        <div className="mb-4 flex justify-between border-b border-white/10 pb-4 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Confirmation
          </span>
          <span className="font-mono font-bold text-primary">#VF-882910</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">VoiceForge Pro</h2>
          <span className="text-lg font-bold">$49.99/mo</span>
        </div>
      </div>
      <Button size="lg" className="rounded-full px-12" asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
