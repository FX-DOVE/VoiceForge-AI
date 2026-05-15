"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";

const SYSTEMS = [
  { name: "API", status: "operational", uptime: "99.98%" },
  { name: "Generation Service", status: "operational", uptime: "99.95%" },
  { name: "Voice Cloning", status: "operational", uptime: "99.90%" },
  { name: "Dashboard & Studio", status: "operational", uptime: "99.99%" },
  { name: "Billing & Subscriptions", status: "operational", uptime: "99.99%" },
  { name: "CDN & Media Delivery", status: "degraded", uptime: "99.85%" },
];

const INCIDENTS = [
  {
    id: "INC-241024",
    title: "Degraded CDN performance in EU-West region",
    status: "investigating",
    started: "Oct 24, 2026, 14:30 UTC",
    updates: [
      {
        time: "Oct 24, 2026, 14:30 UTC",
        message: "Investigating reports of slower media delivery for EU-West users.",
      },
    ],
  },
  {
    id: "INC-241015",
    title: "API latency spike during maintenance window",
    status: "resolved",
    started: "Oct 15, 2026, 09:00 UTC",
    resolved: "Oct 15, 2026, 11:45 UTC",
    updates: [
      {
        time: "Oct 15, 2026, 09:00 UTC",
        message: "Scheduled maintenance on generation cluster.",
      },
      {
        time: "Oct 15, 2026, 11:45 UTC",
        message: "Maintenance completed. Latency back to normal levels.",
      },
    ],
  },
];

const STATUS_CONFIG = {
  operational: {
    icon: CheckCircle2,
    label: "Operational",
    color: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  degraded: {
    icon: Clock,
    label: "Degraded",
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
  outage: {
    icon: AlertCircle,
    label: "Outage",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
};

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());

  return (
    <MarketingPageShell
      eyebrow="System Status"
      title="All systems operational"
      subtitle="Real-time status of VoiceForge AI services and infrastructure."
    >
      <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-on-surface-variant">
              Last updated: {lastUpdated}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 hover:bg-white/5"
            onClick={() => setLastUpdated(new Date().toLocaleString())}
          >
            <RefreshCw className="mr-2 size-3" />
            Refresh
          </Button>
        </div>

        <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-lg font-bold text-white">System Status</h2>
          </div>
          <div className="divide-y divide-white/5">
            {SYSTEMS.map((system, i) => {
              const config = STATUS_CONFIG[system.status];
              return (
                <div
                  key={system.name}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-bold text-white">
                      {system.name}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {system.uptime} uptime
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${config.color}`}
                  >
                    <config.icon className="size-3.5" />
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Recent Incidents
          </h2>
          <div className="flex flex-col gap-6">
            {INCIDENTS.map((incident) => (
              <div
                key={incident.id}
                className="glass-panel rounded-2xl border-white/5 p-6 flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-on-surface-variant">
                      {incident.id}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {incident.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                      incident.status === "resolved"
                        ? "text-green-400 bg-green-500/10 border-green-500/20"
                        : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-white/10">
                  {incident.updates.map((update, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className="text-xs font-mono text-on-surface-variant">
                        {update.time}
                      </span>
                      <p className="text-sm text-white">{update.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="glass-panel rounded-2xl border-white/5 p-6 flex items-start gap-4">
          <Activity className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-bold text-white">
              Subscribe to status updates
            </h3>
            <p className="text-sm text-on-surface-variant">
              Get email notifications when incidents occur or are resolved.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-fit h-10 px-5 rounded-full border-white/10 hover:bg-white/5 font-bold"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </MarketingPageShell>
  );
}
