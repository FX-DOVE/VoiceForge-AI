"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Play, Pause, Download, Timer, Mic, Zap, Crown, Plus,
  BarChart2, RefreshCw, Loader2, User,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { GenerationDetailModal } from "@/components/history/generation-detail-modal";
import { useGenerations } from "@/hooks/use-generations";
import { useUsage } from "@/hooks/use-usage";
import { getMediaUrl } from "@/lib/api/config";

export default function DashboardPage() {
  const [selected, setSelected] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);
  const { items: recentGenerations, loading, reload } = useGenerations();
  const { usage, loading: usageLoading } = useUsage();

  function handlePlayItem(item, e) {
    e.stopPropagation();
    const url = getMediaUrl(item.audioUrl);
    if (!url) return;
    if (playingId === item.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play().then(() => setPlayingId(item.id)).catch(() => {});
    }
  }

  const usedPct = usage
    ? Math.min(100, Math.round(((usage.charactersUsed ?? 0) / (usage.charactersLimit || 1)) * 100))
    : 0;

  const planLabel = usage?.plan
    ? usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)
    : "Free";

  const stats = [
    {
      label: "Characters Used",
      value: usageLoading ? "—" : (usage?.charactersUsed ?? 0).toLocaleString(),
      sub: usageLoading ? "" : `of ${(usage?.charactersLimit ?? 0).toLocaleString()} limit`,
      icon: Zap,
      color: "text-blue-400",
      bar: true,
    },
    {
      label: "Characters Remaining",
      value: usageLoading ? "—" : (usage?.charactersRemaining ?? 0).toLocaleString(),
      sub: usageLoading ? "" : `${usedPct}% used`,
      icon: BarChart2,
      color: usedPct > 80 ? "text-red-400" : "text-emerald-400",
    },
    {
      label: "Total Generations",
      value: usageLoading ? "—" : (usage?.generations ?? 0).toLocaleString(),
      sub: usageLoading
        ? ""
        : `${usage?.freeGenerations ?? 0} free · ${usage?.proGenerations ?? 0} pro`,
      icon: Mic,
      color: "text-purple-400",
    },
    {
      label: "Current Plan",
      value: usageLoading ? "—" : planLabel,
      sub: usageLoading
        ? ""
        : usage?.resetAt
        ? `Resets ${new Date(usage.resetAt).toLocaleDateString()}`
        : "No reset date",
      icon: Crown,
      color: planLabel === "Free" ? "text-neutral-400" : "text-amber-400",
    },
  ];

  return (
    <>
      <header className="hidden lg:flex shrink-0 items-center justify-between border-b border-outline-variant/30 px-8 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Dashboard</h2>
          {usage?.name && (
            <p className="text-sm text-neutral-400 mt-0.5">
              Welcome back, <span className="text-white font-semibold">{usage.name}</span>
              {" "}·{" "}
              <span className={planLabel === "Free" ? "text-neutral-400" : "text-amber-400"}>
                {planLabel} plan
              </span>
            </p>
          )}
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90 text-on-primary" asChild>
          <Link href="/studio">
            <Plus className="mr-2 size-4" />
            New Generation
          </Link>
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-10">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border-white/5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400 font-medium">{s.label}</p>
                <s.icon className={cn("size-4 opacity-60", s.color)} />
              </div>
              <p className={cn("text-3xl font-bold tracking-tight", s.color)}>{s.value}</p>
              {s.sub && <p className="text-xs text-neutral-500">{s.sub}</p>}
              {s.bar && (
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", usedPct > 80 ? "bg-red-500" : "bg-blue-500")}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Action Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-primary/20 bg-primary/5"
        >
          <div>
            <h3 className="text-xl font-bold text-white">Ready to create?</h3>
            <p className="text-neutral-400 mt-1">
              Free voices use Edge TTS and <span className="text-emerald-400 font-semibold">don't count against your limit</span>.
              Pro voices use xAI Grok TTS.
            </p>
          </div>
          <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-on-primary px-8 shrink-0" asChild>
            <Link href="/studio">Open Studio</Link>
          </Button>
        </motion.div>

        {/* Recent Generations */}
        <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Generations</h2>
            <button
              onClick={reload}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="size-7 text-primary animate-spin" />
            </div>
          )}

          {!loading && recentGenerations.length === 0 && (
            <div className="py-16 text-center glass-panel rounded-2xl border-white/5">
              <Mic className="size-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 font-medium">No generations yet.</p>
              <p className="text-neutral-600 text-sm mt-1">Head to the Studio to create your first one.</p>
              <Button className="mt-5 rounded-full bg-primary hover:bg-primary/90" asChild>
                <Link href="/studio">Go to Studio</Link>
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {recentGenerations.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(item); }
                }}
                className="glass-card p-4 sm:p-5 rounded-2xl flex items-center gap-4 border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {/* Play button */}
                <button
                  type="button"
                  disabled={!item.audioUrl}
                  onClick={(e) => handlePlayItem(item, e)}
                  className="size-11 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shrink-0 flex items-center justify-center disabled:opacity-30"
                >
                  {playingId === item.id ? (
                    <Pause className="size-4 fill-current" />
                  ) : (
                    <Play className="size-4 fill-current" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white line-clamp-1">"{item.text}"</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />{item.voice}
                    </span>
                    <span className="opacity-30">·</span>
                    <span>{item.duration}</span>
                    <span className="opacity-30">·</span>
                    <span>{item.time}</span>
                  </div>
                </div>

                {/* Expiry badge */}
                <div className={cn(
                  "hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0",
                  item.status === "warning" || item.status === "expired"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-white/5 text-neutral-500 border-white/10"
                )}>
                  <Timer className="size-3" />
                  {item.expiry}
                </div>

                {/* Download */}
                <button
                  type="button"
                  disabled={!item.downloadUrl && !item.audioUrl}
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = getMediaUrl(item.downloadUrl || item.audioUrl);
                    if (!url) return;
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `voiceforge-${item.id || "audio"}.mp3`;
                    a.click();
                  }}
                  className="size-9 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-colors flex items-center justify-center shrink-0 disabled:opacity-30"
                >
                  <Download className="size-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <GenerationDetailModal
        open={!!selected}
        generation={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
