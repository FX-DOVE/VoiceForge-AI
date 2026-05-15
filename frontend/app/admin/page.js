"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import {
  DollarSign, Users, Zap, Activity, TrendingUp, AlertCircle,
  Key, CloudCheck, UserPlus, Bell, RefreshCw, Loader2,
  Database, Cpu, Wifi, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function StatCard({ label, value, sub, icon: Icon, color, bar, barPct, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4 transition-all group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="flex items-center justify-between relative">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">{label}</p>
        <div className={cn("size-9 rounded-xl flex items-center justify-center bg-white/5", color)}>
          <Icon className="size-4" />
        </div>
      </div>
      <div className="relative">
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
      </div>
      {bar && (
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700" style={{ width: `${barPct ?? 0}%` }} />
        </div>
      )}
      {!bar && (
        <div className="flex items-end gap-0.5 h-8 opacity-30 group-hover:opacity-70 transition-opacity">
          {[30, 45, 28, 60, 48, 72, 90].map((h, i) => (
            <div key={i} className={cn("flex-1 rounded-t-[2px]", i === 6 ? "bg-primary" : "bg-white/20")} style={{ height: `${h}%` }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ServiceRow({ name, icon: Icon, status, latency, color }) {
  const isOk = status === "Operational" || status === "Connected" || status === "Configured";
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-all">
      <div className={cn("size-8 rounded-lg flex items-center justify-center", isOk ? "bg-emerald-500/10" : "bg-amber-500/10")}>
        <Icon className={cn("size-4", isOk ? "text-emerald-400" : "text-amber-400")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{name}</p>
        {latency && <p className="text-xs text-neutral-500">{latency}</p>}
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
        isOk
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          : "text-amber-400 bg-amber-500/10 border-amber-500/20"
      )}>{status}</span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.dashboard().catch(() => null),
      adminApi.systemHealth().catch(() => null),
    ]).then(([d, h]) => {
      setDashboard(d);
      setHealth(h);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const mrr = dashboard?.revenue?.mrr ?? 0;
  const apiPct = dashboard?.apiUsagePercent ?? 0;

  const stats = [
    { label: "MRR", value: `$${mrr.toLocaleString()}`, sub: "Monthly recurring", icon: DollarSign, color: "text-emerald-400", delay: 0 },
    { label: "Total Users", value: String(dashboard?.subscriptions?.total ?? 0), sub: `${dashboard?.subscriptions?.active ?? 0} active`, icon: Users, color: "text-blue-400", delay: 0.06 },
    { label: "API Usage", value: `${apiPct}%`, sub: "of monthly quota", icon: Zap, color: "text-orange-400", bar: true, barPct: apiPct, delay: 0.12 },
    { label: "Generations (30d)", value: String(dashboard?.generationVolume ?? 0), sub: `${dashboard?.voiceClones ?? 0} clones`, icon: Activity, color: "text-violet-400", delay: 0.18 },
  ];

  const apiService = health?.services?.find((s) => s.name === "api");
  const dbService = health?.services?.find((s) => s.name === "mongodb");
  const ttsService = health?.services?.find((s) => s.name === "tts");
  const redisService = health?.services?.find((s) => s.name === "redis");

  const services = health ? [
    ...(apiService?.regions || []).map((r) => ({
      name: `API — ${r.region}`,
      icon: Wifi,
      status: r.status === "up" ? "Operational" : "Degraded",
      latency: `${r.latencyMs}ms`,
    })),
    { name: "MongoDB", icon: Database, status: dbService?.status === "up" ? "Connected" : "Disconnected" },
    { name: "TTS Engine", icon: Cpu, status: ttsService?.status === "up" ? "Configured" : ttsService?.status === "not_configured" ? "Not Configured" : "Degraded" },
    { name: "Redis Cache", icon: Zap, status: redisService?.status === "configured" ? "Configured" : "Optional" },
  ] : [];

  const uptime = health
    ? `${Math.floor((health.uptimeSeconds || 0) / 3600)}h ${Math.floor(((health.uptimeSeconds || 0) % 3600) / 60)}m`
    : "—";

  function activityIcon(level) {
    if (level === "error") return { icon: AlertCircle, cls: "text-red-400 bg-red-500/10" };
    if (level === "warn") return { icon: Key, cls: "text-orange-400 bg-orange-500/10" };
    if (level === "info") return { icon: CloudCheck, cls: "text-blue-400 bg-blue-500/10" };
    return { icon: UserPlus, cls: "text-emerald-400 bg-emerald-500/10" };
  }

  const activities = (dashboard?.activity || []).map((a) => ({
    title: a.action || "System Event",
    desc: a.message || "",
    time: a.createdAt ? new Date(a.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—",
    ...activityIcon(a.level),
  }));

  return (
    <div className="h-full flex flex-col">
      <header className="hidden lg:flex h-16 border-b border-white/[0.06] bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-8 shrink-0">
        <h2 className="text-lg font-bold text-white">Overview</h2>
        <div className="flex items-center gap-3">
          <button onClick={load} className="size-9 rounded-full hover:bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </button>
          <Button variant="ghost" size="icon" className="size-9 rounded-full hover:bg-white/5 border border-white/[0.06]">
            <Bell className="size-4 text-neutral-400" />
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-9 text-sm font-semibold">
            Generate Report
          </Button>
        </div>
      </header>

      {loading && !dashboard ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 flex flex-col gap-8 pb-24">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* System Health */}
            <section className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">System Health</h3>
                <span className={cn(
                  "text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider",
                  health?.status === "healthy"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                )}>
                  {health?.status || "Loading"}
                </span>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 flex flex-col gap-1">
                {services.map((s) => (
                  <ServiceRow key={s.name} {...s} />
                ))}
                {!services.length && (
                  <p className="text-xs text-neutral-500 text-center py-6">Loading services…</p>
                )}
                <div className="mt-2 pt-3 border-t border-white/[0.06] px-4 flex justify-between items-center">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Uptime</span>
                  <span className="text-[11px] text-primary font-bold">{uptime}</span>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="lg:col-span-3 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recent Activity</h3>
                <Link href="/admin/users" className="text-xs text-primary hover:underline font-semibold">View Users →</Link>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex-1 min-h-[300px]">
                {activities.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-600 min-h-[240px]">
                    <CheckCircle2 className="size-8" />
                    <p className="text-sm font-medium">No recent activity logged.</p>
                    <p className="text-xs">Events will appear here as users interact with the platform.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 relative">
                    <div className="absolute left-4 top-5 bottom-5 w-px bg-white/[0.04]" />
                    {activities.map((a, i) => (
                      <div key={i} className="flex gap-4 py-3 group">
                        <div className={cn("size-9 rounded-full flex items-center justify-center z-10 shrink-0", a.cls)}>
                          <a.icon className="size-4" />
                        </div>
                        <div className={cn("flex-1 pb-3 min-w-0", i < activities.length - 1 && "border-b border-white/[0.04]")}>
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-semibold text-white truncate">{a.title}</p>
                            <span className="text-[11px] text-neutral-500 shrink-0">{a.time}</span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{a.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
