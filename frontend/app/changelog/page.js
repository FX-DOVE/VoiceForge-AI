"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Plus, Bug, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";

const CHANGES = [
  {
    version: "2.4.0",
    date: "Oct 24, 2026",
    type: "release",
    items: [
      "Added voice cloning with 30-second sample support",
      "New community voices marketplace at /community",
      "API v2 webhooks for generation.completed events",
      "Improved stability slider responsiveness in studio",
      "Fixed audio preview playback on mobile Safari",
    ],
  },
  {
    version: "2.3.2",
    date: "Oct 12, 2026",
    type: "patch",
    items: [
      "Fixed authentication token refresh race condition",
      "Reduced generation latency by 40% for short prompts",
      "Updated voice library with 12 new stock voices",
    ],
  },
  {
    version: "2.3.0",
    date: "Sep 28, 2026",
    type: "release",
    items: [
      "Launched public API with streaming support",
      "Added export to WAV format option",
      "New command palette (Cmd/Ctrl+K) for quick navigation",
      "Improved mobile layout across dashboard and studio",
    ],
  },
  {
    version: "2.2.1",
    date: "Sep 15, 2026",
    type: "patch",
    items: [
      "Fixed billing page redirect loop on Safari",
      "Fixed cloned voices not appearing in studio dropdown",
      "Added keyboard shortcuts for studio controls",
    ],
  },
  {
    version: "2.2.0",
    date: "Aug 30, 2026",
    type: "release",
    items: [
      "Introduced voice detail pages with sample clips",
      "Added generation history with detail modal",
      "New settings page with avatar upload",
      "Implemented notifications dropdown",
    ],
  },
];

const TYPE_CONFIG = {
  release: { icon: Plus, label: "Release", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  patch: { icon: Bug, label: "Patch", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  feature: { icon: Zap, label: "Feature", color: "text-primary bg-primary/10 border-primary/20" },
};

export default function ChangelogPage() {
  return (
    <MarketingPageShell
      eyebrow="Changelog"
      title="What's new in VoiceForge"
      subtitle="Track product updates, bug fixes, and new features as we ship them."
    >
      <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
        {CHANGES.map((entry, i) => {
          const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.release;
          return (
            <motion.div
              key={entry.version}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-2xl border-white/5 p-6 sm:p-8 flex flex-col gap-4"
            >
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                    {entry.version}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${config.color}`}
                  >
                    <config.icon className="size-3" />
                    {config.label}
                  </span>
                </div>
                <span className="text-sm text-on-surface-variant">{entry.date}</span>
              </div>
              <ul className="flex flex-col gap-2">
                {entry.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-on-surface-variant">
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}

        <div className="glass-panel rounded-2xl border-white/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-primary/10 via-background to-purple-500/10">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">
              Have a feature request?
            </h3>
            <p className="text-on-surface-variant max-w-md">
              Your feedback shapes our roadmap. Tell us what you'd like to see next.
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold h-12 px-6"
          >
            <Link href="/contact">
              Submit Feedback <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </MarketingPageShell>
  );
}
