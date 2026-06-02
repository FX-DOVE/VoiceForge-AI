"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import {
  Settings, Globe, Terminal, Database, Layers,
  RefreshCw, Loader2, CheckCircle2, XCircle, AlertCircle,
  Zap, Mic, CreditCard, Mail, Server, HardDrive,
  Users, Key, Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StatusBadge({ ok, trueLabel = "Configured", falseLabel = "Not Set" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      ok
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
    )}>
      {ok ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
      {ok ? trueLabel : falseLabel}
    </span>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
      <span className={cn("text-sm font-medium text-white", mono && "font-mono text-xs text-neutral-300")}>{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="size-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <div className="px-6 py-2">{children}</div>
    </motion.div>
  );
}

function ServiceCard({ icon: Icon, name, desc, ok, label, badgeTrue, badgeFalse }) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl border transition-all",
      ok ? "bg-emerald-500/[0.04] border-emerald-500/20" : "bg-white/[0.02] border-white/[0.06]"
    )}>
      <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", ok ? "bg-emerald-500/10" : "bg-white/5")}>
        <Icon className={cn("size-5", ok ? "text-emerald-400" : "text-neutral-500")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{name}</p>
        {desc && <p className="text-xs text-neutral-500 mt-0.5 truncate">{desc}</p>}
      </div>
      <StatusBadge ok={ok} trueLabel={badgeTrue || "Active"} falseLabel={badgeFalse || "Not Set"} />
    </div>
  );
}

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "api", label: "API Config", icon: Terminal },
  { id: "storage", label: "Storage", icon: Database },
  { id: "services", label: "Services", icon: Layers },
  { id: "plans", label: "Plan Limits", icon: Users },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.settings().catch(() => null).then((d) => { setCfg(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const g = cfg?.general;
  const api = cfg?.api;
  const storage = cfg?.storage;
  const services = cfg?.services;
  const plans = cfg?.planLimits;

  return (
    <div className="h-full flex flex-col min-h-0">
      <header className="hidden lg:flex h-16 border-b border-white/[0.06] bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <Settings className="size-5 text-primary" />
          <h2 className="text-lg font-bold text-white">System Settings</h2>
        </div>
        <button
          onClick={load}
          className="size-9 rounded-full hover:bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
        </button>
      </header>

      {/* Tabs */}
      <div className="sticky top-16 z-20 bg-background flex gap-1 px-8 pt-4 pb-0 border-b border-white/[0.06] shrink-0 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 pb-4 text-xs font-semibold uppercase tracking-widest transition-all whitespace-nowrap relative",
              activeTab === t.id
                ? "text-primary"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            <t.icon className="size-3.5" />
            {t.label}
            {activeTab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {loading && !cfg ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 flex flex-col gap-5 pb-24 max-h-[calc(100vh-180px)]">

          {/* ── GENERAL ── */}
          {activeTab === "general" && (
            <>
              <SectionCard title="Instance Info" icon={Globe} delay={0}>
                <InfoRow label="Environment" value={
                  <span className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase", g?.env === "production" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>
                    {g?.env || "—"}
                  </span>
                } />
                <InfoRow label="Site Name" value={g?.siteName} />
                <InfoRow label="Admin Email" value={g?.adminEmail || "Not configured"} mono />
                <InfoRow label="Client URL" value={g?.clientUrl} mono />
                <InfoRow label="Server Port" value={g?.port} />
                <InfoRow label="TTS Provider" value={
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400">{g?.ttsProvider || "auto"}</span>
                } />
              </SectionCard>

              <SectionCard className="hidden" title="Platform Status " icon={Cpu} delay={0.06}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 overflow-y-auto overflow-x-hidden" >
                  <ServiceCard icon={Zap} name="VoiceForge TTS Engine" desc={api?.xaiModel} ok={api?.xaiConfigured} badgeTrue="Key Set" badgeFalse="No API Key" />
                  <ServiceCard icon={CreditCard} name="Stripe Payments" desc="Subscription billing" ok={services?.stripeConfigured} />
                  <ServiceCard icon={Mail} name="Email (Resend)" desc={services?.emailFrom} ok={services?.resendConfigured} />
                  <ServiceCard icon={Server} name="Redis Cache" desc="Session & rate-limit store" ok={services?.redisConfigured} badgeTrue="Connected" badgeFalse="Not Connected" />
                  <ServiceCard icon={HardDrive} name="Cloud Storage" desc={`Provider: ${storage?.provider || "local"}`} ok={storage?.cloudinaryConfigured || storage?.awsConfigured} badgeTrue="Cloud Active" badgeFalse="Local Storage" />
                </div>
              </SectionCard>
            </>
          )}

          {/* ── API CONFIG ── */}
          {activeTab === "api" && (
            <>
              <SectionCard title="VoiceForge TTS" icon={Mic} delay={0}>
                <div className="py-2">
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">API Key</span>
                    <StatusBadge ok={api?.xaiConfigured} trueLabel="Configured" falseLabel="Missing" />
                  </div>
                  <InfoRow label="Model" value={api?.xaiModel} mono />
                  <InfoRow label="Default Voice" value={api?.xaiDefaultVoice} />
                  <InfoRow label="Default Language" value={api?.xaiDefaultLanguage} />
                  <InfoRow label="Default Codec" value={api?.xaiDefaultCodec} />
                </div>
              </SectionCard>

              <SectionCard title="Rate Limiting" icon={Zap} delay={0.06}>
                <div className="py-2">
                  <InfoRow label="Max Requests" value={`${api?.rateLimitMax ?? "—"} requests`} />
                  <InfoRow label="Window" value={`${Math.round((api?.rateLimitWindowMs ?? 0) / 60000)} minutes`} />
                  <InfoRow label="Effective RPM" value={`${Math.round((api?.rateLimitMax ?? 0) / ((api?.rateLimitWindowMs ?? 60000) / 60000))} req/min`} />
                </div>
                <div className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-500 uppercase tracking-wider">Utilisation cap</span>
                    <span className="text-xs font-bold text-primary">{api?.rateLimitMax ?? 0} req / {Math.round((api?.rateLimitWindowMs ?? 900000) / 60000)}min window</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ── STORAGE ── */}
          {activeTab === "storage" && (
            <>
              <SectionCard title="Storage Provider" icon={HardDrive} delay={0}>
                <div className="py-2">
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active Provider</span>
                    <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold uppercase border border-blue-500/20">
                      {storage?.provider || "local"}
                    </span>
                  </div>
                  <InfoRow label="Max Upload Size" value={`${storage?.maxUploadMb ?? 25} MB`} />
                </div>
              </SectionCard>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SectionCard title="Cloudinary" icon={Database} delay={0.06}>
                  <div className="py-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</span>
                      <StatusBadge ok={storage?.cloudinaryConfigured} />
                    </div>
                    <p className="text-xs text-neutral-600 py-2">
                      {storage?.cloudinaryConfigured
                        ? "Cloudinary is active. Audio and voice assets are served from the cloud."
                        : "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env to enable."}
                    </p>
                  </div>
                </SectionCard>

                <SectionCard title="Amazon S3" icon={Server} delay={0.1}>
                  <div className="py-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</span>
                      <StatusBadge ok={storage?.awsConfigured} />
                    </div>
                    <p className="text-xs text-neutral-600 py-2">
                      {storage?.awsConfigured
                        ? "AWS S3 bucket is configured and available."
                        : "Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET in your .env to enable."}
                    </p>
                  </div>
                </SectionCard>
              </div>
            </>
          )}

          {/* ── SERVICES ── */}
          {activeTab === "services" && (
            <div className="flex flex-col gap-5">
              <SectionCard title="Stripe Billing" icon={CreditCard} delay={0}>
                <div className="py-2">
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Secret Key</span>
                    <StatusBadge ok={services?.stripeConfigured} />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Webhook Secret</span>
                    <StatusBadge ok={services?.stripeWebhookConfigured} />
                  </div>
                  <p className="text-xs text-neutral-600 py-3">
                    {services?.stripeConfigured
                      ? "Stripe is configured. Subscription payments are active."
                      : "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in your .env file to enable billing."}
                  </p>
                </div>
              </SectionCard>

              <SectionCard title="Email (Resend)" icon={Mail} delay={0.06}>
                <div className="py-2">
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">API Key</span>
                    <StatusBadge ok={services?.resendConfigured} />
                  </div>
                  <InfoRow label="Sender Address" value={services?.emailFrom} mono />
                  <p className="text-xs text-neutral-600 py-3">
                    {services?.resendConfigured
                      ? "Transactional emails (password reset, etc.) are enabled via Resend."
                      : "Set RESEND_API_KEY in your .env to enable email sending."}
                  </p>
                </div>
              </SectionCard>

              <SectionCard title="Redis Cache" icon={Server} delay={0.1}>
                <div className="py-2">
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Connection</span>
                    <StatusBadge ok={services?.redisConfigured} trueLabel="URL Set" badgeFalse="Not Configured" />
                  </div>
                  <p className="text-xs text-neutral-600 py-3">
                    {services?.redisConfigured
                      ? "Redis is configured for rate limiting and session caching."
                      : "Set REDIS_URL in your .env to enable Redis. Without it, in-memory rate limiting is used."}
                  </p>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ── PLAN LIMITS ── */}
          {activeTab === "plans" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { key: "free", label: "Free", color: "text-neutral-400", bg: "bg-neutral-500/10 border-neutral-500/20" },
                  { key: "pro", label: "Pro", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                  { key: "enterprise", label: "Enterprise", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
                  { key: "professional", label: "Professional", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                ].map(({ key, label, color, bg }, i) => {
                  const p = plans?.[key];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border", bg, color)}>{label}</span>
                        <span className="text-xs text-neutral-500">{p?.users ?? 0} users</span>
                      </div>
                      <div>
                        <p className={cn("text-3xl font-bold", color)}>{(p?.charactersLimit ?? 0).toLocaleString()}</p>
                        <p className="text-xs text-neutral-500 mt-1">characters / month</p>
                      </div>
                      <div className="pt-3 border-t border-white/[0.05]">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">Concurrent jobs</span>
                          <span className="text-white font-semibold">{p?.concurrentJobs ?? 1}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <SectionCard title="How to update limits" icon={Key} delay={0.2}>
                <div className="py-3">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Plan limits are defined in your backend <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[11px]">config/index.js</code> under <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[11px]">planLimits</code>.
                    Changes take effect after restarting the server. Existing users are not retroactively affected until their next billing cycle reset.
                  </p>
                  <div className="mt-4 bg-black/30 rounded-xl p-4 font-mono text-[11px] text-neutral-400 leading-relaxed">
                    <span className="text-blue-400">planLimits</span>: {"{"}<br />
                    {"  "}<span className="text-neutral-300">free</span>: {"{ "}charactersLimit: <span className="text-emerald-400">{(plans?.free?.charactersLimit ?? 10000).toLocaleString()}</span>{" }"},<br />
                    {"  "}<span className="text-neutral-300">pro</span>: {"{ "}charactersLimit: <span className="text-blue-400">{(plans?.pro?.charactersLimit ?? 100000).toLocaleString()}</span>{" }"},<br />
                    {"  "}<span className="text-neutral-300">enterprise</span>: {"{ "}charactersLimit: <span className="text-violet-400">{(plans?.enterprise?.charactersLimit ?? 1000000).toLocaleString()}</span>{" }"}<br />
                    {"  "}<span className="text-neutral-300">professional</span>: {"{ "}charactersLimit: <span className="text-amber-400">{(plans?.professional?.charactersLimit ?? 500000).toLocaleString()}</span>{" }"}<br />
                    {"}"}
                  </div>
                </div>
              </SectionCard>
            </>
          )}
        </div>
      )}
    </div>
  );
}
