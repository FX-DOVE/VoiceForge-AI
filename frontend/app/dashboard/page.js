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
import { EmailVerificationBanner } from "@/components/email-verification-banner";

export default function DashboardPage() {
  const [selected, setSelected] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);
  const { items: recentGenerations, loading, reload, remove } = useGenerations();
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

  const totalCredits = usage?.totalCredits ?? 0;
  const creditsUsed = usage?.creditsUsed ?? 0;
  const creditsRemaining = usage?.creditsRemaining ?? 0;
  const usedPct = totalCredits > 0
    ? Math.min(100, Math.round((creditsUsed / totalCredits) * 100))
    : 0;

  const rawPlan = usage?.plan || "free";
  const planLabel = rawPlan === "professional" ? "VoiceForge Premium" : rawPlan === "pro" ? "VoiceForge Pro" : "VoiceForge Free";

  const prof = usage?.professional || {};
  const isPremiumUser = planLabel.includes("Premium") || usage?.plan === "professional" || prof.isProfessional;
  const profStatus = prof.membershipStatus || (isPremiumUser ? "active" : "none");
  const daysRem = prof.daysRemaining || 0;
  const profEnd = prof.endDate ? new Date(prof.endDate).toLocaleDateString() : null;

  const stats = [
    {
      label: "Credits Used",
      value: usageLoading ? "—" : creditsUsed.toLocaleString(),
      sub: usageLoading ? "" : `of ${totalCredits.toLocaleString()} total`,
      icon: Zap,
      color: "text-blue-400",
      bar: true,
    },
    {
      label: "Credits Remaining",
      value: usageLoading ? "—" : creditsRemaining.toLocaleString(),
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
      label: "Total Credits",
      value: usageLoading ? "—" : totalCredits.toLocaleString(),
      sub: usageLoading
        ? ""
        : `$${(usage?.totalPayments ?? 0).toLocaleString()} total spent`,
      icon: Crown,
      color: totalCredits > 0 ? "text-amber-400" : "text-neutral-400",
    },
  ];

  const sparkBars = [20, 35, 25, 50, 40, 65, 85];

  return (
    <>
      {/* Sticky Page Header */}
      <header className="hidden lg:flex shrink-0 items-center justify-between border-b border-white/5 px-8 py-5 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">Dashboard</h2>
          {usage?.name && (
            <p className="text-sm text-neutral-500 mt-0.5">
              Welcome back, <span className="text-white font-semibold">{usage.name}</span>
              {" · "}
              <span className={planLabel.includes("Premium") ? "text-violet-400 font-semibold" : planLabel.includes("Pro") ? "text-amber-400 font-semibold" : "text-neutral-400"}>
                {planLabel}
              </span>
            </p>
          )}
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90 text-on-primary h-10 px-5 text-sm font-semibold shadow-lg shadow-primary/20" asChild>
          <Link href="/studio">
            <Plus className="mr-1.5 size-4" />
            New Generation
          </Link>
        </Button>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8 pb-16">

        <EmailVerificationBanner />

        {/* Current Plan + Professional Status (per spec) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-[2px] text-neutral-500 font-medium">Current Plan</div>
                <div className={cn(
                  "text-2xl font-bold mt-0.5",
                  planLabel.includes("Free") ? "text-neutral-300" : planLabel.includes("Premium") ? "text-violet-400" : "text-amber-400"
                )}>
                  {planLabel}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {planLabel.includes("Free") && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">FREE</span>
                )}
                {planLabel.includes("Pro") && !planLabel.includes("Premium") && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">PRO</span>
                )}
                {planLabel.includes("Premium") && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/30">PREMIUM</span>
                )}
              </div>

              <div className="text-sm text-neutral-400">
                Credits Remaining: <span className="font-mono text-white font-semibold">{usageLoading ? "—" : creditsRemaining.toLocaleString()}</span>
              </div>
            </div>

            {/* Premium Status + Renew */}
            <div className="flex items-center gap-3 flex-wrap">
              {isPremiumUser ? (
                <>
                  <div className="text-sm">
                    Premium Status: <span className={cn("font-semibold", profStatus === "active" ? "text-emerald-400" : "text-amber-400")}>
                      {profStatus === "active" ? "Active" : profStatus === "expired" ? "Expired" : profStatus}
                    </span>
                    {daysRem > 0 && <span className="text-neutral-500 ml-1">({daysRem} days left{profEnd ? ` · until ${profEnd}` : ""})</span>}
                  </div>
                  {(profStatus !== "active" || daysRem < 10) && (
                    <Button asChild size="sm" variant="outline" className="rounded-full border-violet-500/40 text-violet-400 hover:bg-violet-500/10">
                      <Link href="/checkout?plan=professional">Renew Membership</Link>
                    </Button>
                  )}
                </>
              ) : (
                <Button asChild size="sm" className="rounded-full bg-violet-600 hover:bg-violet-500 text-white">
                  <Link href="/checkout?plan=professional">Upgrade to VoiceForge Premium — $2.99/mo</Link>
                </Button>
              )}
              {planLabel.includes("Free") && (
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href="/billing">Buy Credits (Pro)</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid — premium cards with sparklines matching design ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative bg-surface-container-low/70 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3 group hover:bg-surface-container-low/90 transition-all overflow-hidden"
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">{s.label}</p>
                <div className={cn("size-8 rounded-xl flex items-center justify-center bg-white/5", s.color)}>
                  <s.icon className="size-4" />
                </div>
              </div>

              <div>
                <p className={cn("text-2xl sm:text-3xl font-bold tracking-tight", s.color)}>{s.value}</p>
                {s.sub && <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{s.sub}</p>}
              </div>

              {s.bar ? (
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usedPct}%` }}
                    transition={{ delay: i * 0.07 + 0.3, duration: 0.8 }}
                    className={cn("h-full rounded-full", usedPct > 80 ? "bg-red-500" : "bg-primary")}
                  />
                </div>
              ) : (
                <div className="flex items-end gap-0.5 h-8 opacity-40 group-hover:opacity-80 transition-opacity mt-1">
                  {sparkBars.map((h, j) => (
                    <div
                      key={j}
                      className={cn("flex-1 rounded-t-sm", j === sparkBars.length - 1 ? s.color.replace("text-", "bg-") : "bg-white/20")}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Action Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="relative glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-primary/20 bg-primary/[0.04] overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <h3 className="text-lg font-bold text-white">Ready to create?</h3>
            <p className="text-sm text-neutral-400 mt-1.5 max-w-md leading-relaxed">
              Free voices use VoiceForge standard TTS and{" "}
              <span className="text-emerald-400 font-semibold">don&apos;t use credits</span>.
              Pro voices use VoiceForge premium TTS and deduct credits.
            </p>
          </div>
          <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-on-primary px-8 shrink-0 font-semibold shadow-lg shadow-primary/20" asChild>
            <Link href="/studio">Open Studio</Link>
          </Button>
        </motion.div>

        {/* Recent Generations */}
        <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Recent Generations</h2>
            <button
              onClick={reload}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-white/5"
            >
              <RefreshCw className="size-3" />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="py-16 flex justify-center">
              <Loader2 className="size-6 text-primary animate-spin" />
            </div>
          )}

          {!loading && recentGenerations.length === 0 && (
            <div className="py-16 text-center glass-panel rounded-2xl border-white/5 flex flex-col items-center gap-3">
              <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <Mic className="size-7 text-neutral-600" />
              </div>
              <div>
                <p className="text-white font-semibold">No generations yet</p>
                <p className="text-neutral-500 text-sm mt-1">Head to the Studio to create your first voiceover.</p>
              </div>
              <Button className="mt-2 rounded-full bg-primary hover:bg-primary/90 text-on-primary h-10 px-6 font-semibold" asChild>
                <Link href="/studio">Go to Studio</Link>
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {recentGenerations.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(item); }
                }}
                className="bg-surface-container-low/50 hover:bg-surface-container-low/80 border border-white/[0.05] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group"
              >
                {/* Play button */}
                <button
                  type="button"
                  disabled={!item.audioUrl}
                  onClick={(e) => handlePlayItem(item, e)}
                  className={cn(
                    "size-10 sm:size-11 rounded-full flex items-center justify-center transition-all shrink-0 disabled:opacity-30",
                    playingId === item.id
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/30"
                      : "bg-primary/10 text-primary hover:bg-primary hover:text-on-primary"
                  )}
                >
                  {playingId === item.id ? (
                    <Pause className="size-4 fill-current" />
                  ) : (
                    <Play className="size-4 fill-current" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white line-clamp-1 leading-snug">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-500 mt-1">
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
                  "hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border shrink-0",
                  item.status === "warning" || item.status === "expired"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-white/[0.04] text-neutral-500 border-white/[0.06]"
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
                  className="size-9 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-colors flex items-center justify-center shrink-0 disabled:opacity-30 opacity-0 group-hover:opacity-100"
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
        onDelete={(id) => { remove(id); setSelected(null); }}
      />
    </>
  );
}
