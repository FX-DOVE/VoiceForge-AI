"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Zap,
  Users,
  BarChart3,
  Clock,
  ChevronDown,
  RefreshCw,
  Loader2,
  TrendingUp,
  Hash,
  Type,
} from "lucide-react";

const PERIODS = [
  { id: "24h", label: "24 Hours", description: "Last 24 hours" },
  { id: "7d", label: "7 Days", description: "Last week" },
  { id: "30d", label: "30 Days", description: "Last month" },
  { id: "90d", label: "90 Days", description: "Last 3 months" },
];

function StatCard({ label, value, sub, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3 transition-all overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">{label}</p>
        <div className={cn("size-8 rounded-lg flex items-center justify-center bg-white/5", color)}>
          <Icon className="size-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function ComparisonBar({ free, xai, total, label }) {
  const freePct = total > 0 ? (free / total) * 100 : 0;
  const xaiPct = total > 0 ? (xai / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <span className="text-white font-medium">{total.toLocaleString()}</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${freePct}%` }}
        />
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${xaiPct}%` }}
        />
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-400">Free (Edge): {free.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-blue-500" />
          <span className="text-neutral-400">xAI API: {xai.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function TtsAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("24h");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.ttsAnalytics(period);
      setAnalytics(data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch TTS analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = analytics?.summary;
  const currentPeriod = PERIODS.find((p) => p.id === period);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">TTS Analytics</h1>
              <p className="text-xs sm:text-sm text-white/50">Track Free TTS vs xAI API usage</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Period Selector */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                <Clock className="size-4 text-neutral-400" />
                <span>{currentPeriod?.label}</span>
                <ChevronDown className="size-4 text-neutral-400" />
              </button>
              {showPeriodDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPeriodDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {PERIODS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPeriod(p.id);
                          setShowPeriodDropdown(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-left text-sm transition-colors",
                          period === p.id
                            ? "bg-primary/10 text-primary"
                            : "text-white hover:bg-white/5"
                        )}
                      >
                        <div className="font-medium">{p.label}</div>
                        <div className="text-xs text-neutral-500">{p.description}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={loading}
              className="h-9 rounded-lg border-white/10 hover:bg-white/5"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        {loading && !analytics ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3 text-neutral-400">
              <Loader2 className="size-5 animate-spin" />
              <span>Loading analytics...</span>
            </div>
          </div>
        ) : analytics ? (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Requests"
                value={summary?.total?.requests?.toLocaleString() || "0"}
                sub={`${summary?.total?.uniqueUsers || 0} unique users`}
                icon={Hash}
                color="text-blue-400"
                delay={0}
              />
              <StatCard
                label="Free TTS (Edge)"
                value={summary?.freeTts?.requests?.toLocaleString() || "0"}
                sub={`${summary?.freeTts?.uniqueUsers || 0} users · ${summary?.freeTts?.characters?.toLocaleString() || 0} chars`}
                icon={Mic}
                color="text-emerald-400"
                delay={0.05}
              />
              <StatCard
                label="xAI TTS (API)"
                value={summary?.xaiTts?.requests?.toLocaleString() || "0"}
                sub={`${summary?.xaiTts?.uniqueUsers || 0} users · ${summary?.xaiTts?.characters?.toLocaleString() || 0} chars`}
                icon={Zap}
                color="text-blue-400"
                delay={0.1}
              />
              <StatCard
                label="Total Characters"
                value={summary?.total?.characters?.toLocaleString() || "0"}
                sub="Across all TTS requests"
                icon={Type}
                color="text-violet-400"
                delay={0.15}
              />
            </div>

            {/* Comparison Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Request Distribution
                </h3>
                <ComparisonBar
                  free={summary?.freeTts?.requests || 0}
                  xai={summary?.xaiTts?.requests || 0}
                  total={summary?.total?.requests || 0}
                  label="Total Requests"
                />
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {summary?.total?.requests > 0
                        ? Math.round((summary?.freeTts?.requests / summary?.total?.requests) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-neutral-500">Free TTS Share</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {summary?.total?.requests > 0
                        ? Math.round((summary?.xaiTts?.requests / summary?.total?.requests) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-neutral-500">xAI TTS Share</div>
                  </div>
                </div>
              </motion.div>

              {/* Character Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Type className="size-4 text-primary" />
                  Character Distribution
                </h3>
                <ComparisonBar
                  free={summary?.freeTts?.characters || 0}
                  xai={summary?.xaiTts?.characters || 0}
                  total={summary?.total?.characters || 0}
                  label="Total Characters"
                />
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {summary?.total?.characters > 0
                        ? Math.round((summary?.freeTts?.characters / summary?.total?.characters) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-neutral-500">Free TTS Characters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {summary?.total?.characters > 0
                        ? Math.round((summary?.xaiTts?.characters / summary?.total?.characters) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-neutral-500">xAI TTS Characters</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Free TTS Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Mic className="size-4 text-emerald-400" />
                    Top Free TTS Users
                  </h3>
                  <span className="text-xs text-neutral-500">By request count</span>
                </div>
                <div className="divide-y divide-white/5">
                  {analytics?.topUsers?.free?.length > 0 ? (
                    analytics.topUsers.free.map((user, i) => (
                      <div key={user._id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-neutral-500 w-5">{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-white">{user.user?.name || "Unknown"}</p>
                            <p className="text-xs text-neutral-500">{user.user?.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{user.requests.toLocaleString()}</p>
                          <p className="text-xs text-neutral-500">{user.characters.toLocaleString()} chars</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-center text-neutral-500 text-sm">
                      No Free TTS usage in this period
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Top xAI TTS Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="size-4 text-blue-400" />
                    Top xAI TTS Users
                  </h3>
                  <span className="text-xs text-neutral-500">By request count</span>
                </div>
                <div className="divide-y divide-white/5">
                  {analytics?.topUsers?.xai?.length > 0 ? (
                    analytics.topUsers.xai.map((user, i) => (
                      <div key={user._id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-neutral-500 w-5">{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-white">{user.user?.name || "Unknown"}</p>
                            <p className="text-xs text-neutral-500">{user.user?.email}</p>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full",
                              user.user?.plan === "pro" ? "bg-amber-500/20 text-amber-400" :
                              user.user?.plan === "enterprise" ? "bg-purple-500/20 text-purple-400" :
                              "bg-emerald-500/20 text-emerald-400"
                            )}>
                              {user.user?.plan || "free"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{user.requests.toLocaleString()}</p>
                          <p className="text-xs text-neutral-500">{user.characters.toLocaleString()} chars</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-center text-neutral-500 text-sm">
                      No xAI TTS usage in this period
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
