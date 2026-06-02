"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CreditCard, Coins, Zap, BarChart2, Crown } from "lucide-react";
import { useUsage } from "@/hooks/use-usage";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BillingPage() {
  const { usage, loading, reload } = useUsage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [billingProfile, setBillingProfile] = useState({ creditsPerCharacter: 2 }); // live from new method

  useEffect(() => {
    // Fetch live profile using new billing settings (per-provider credit calc)
    (async () => {
      try {
        const data = await (await import("@/lib/api")).adminApi.billingSettings();
        const prof = data?.providerProfiles?.elevenlabs || data?.elevenlabs || { creditsPerCharacter: 2 };
        setBillingProfile(prof);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Payment successful! Your credits have been added.");
      reload();
      router.replace("/billing");
    } else if (searchParams.get("payment") === "cancelled") {
      toast.error("Payment cancelled.");
      router.replace("/billing");
    }
  }, [searchParams, reload, router]);

  const totalCredits = usage?.totalCredits ?? 0;
  const creditsUsed = usage?.creditsUsed ?? 0;
  const creditsRemaining = usage?.creditsRemaining ?? 0;
  const totalPayments = usage?.totalPayments ?? 0;
  const usedPct = totalCredits > 0
    ? Math.min(100, Math.round((creditsUsed / totalCredits) * 100))
    : 0;

  const creditStats = [
    { label: "Total Credits", value: totalCredits, icon: Crown, color: "text-amber-400" },
    { label: "Credits Used", value: creditsUsed, icon: Zap, color: "text-blue-400" },
    { label: "Credits Remaining", value: creditsRemaining, icon: BarChart2, color: "text-emerald-400" },
  ];

  return (
    <>
      <header className="hidden lg:flex h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-30 items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-xl border border-primary/20">
            <CreditCard className="size-4" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-white">Billing & Credits</h2>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-on-primary rounded-full px-5 h-9 text-sm font-semibold shadow-lg shadow-primary/20" asChild>
          <Link href="/checkout">Buy Credits</Link>
        </Button>
      </header>
      <main className="max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-16 space-y-8">
        {/* Premium membership quick status + renew (spec) */}
        {(usage?.plan === "professional" || usage?.professional?.isProfessional) && (
          <div className="glass-panel p-4 rounded-2xl border border-violet-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              Premium: <span className="font-semibold text-violet-400">{usage?.professional?.membershipStatus || "active"}</span>
              {usage?.professional?.daysRemaining ? ` · ${usage.professional.daysRemaining} days remaining` : ""}
            </div>
            <Button asChild size="sm" className="rounded-full border border-violet-400/50 text-violet-400 hover:bg-violet-500/10">
              <Link href="/checkout?plan=professional">Renew / Manage</Link>
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing &amp; Credits</h1>
          <p className="text-sm text-neutral-400">Manage your credit balance and purchase more credits.</p>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">Current Plan: VoiceForge Pro or VoiceForge Premium</span>
          </div>
        </div>

        {/* Credit Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {creditStats.map((s, i) => (
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
              <p className={cn("text-3xl font-bold tracking-tight", s.color)}>
                {loading ? "—" : s.value.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Credit Usage Overview */}
           <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-8 border-blue-500/20 bg-blue-500/[0.02]">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Credit Balance</p>
                       <h2 className="text-2xl font-bold">{loading ? "—" : creditsRemaining.toLocaleString()} credits remaining</h2>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full",
                      creditsRemaining > 0 ? "text-green-500 bg-green-500/10" : "text-red-400 bg-red-500/10"
                    )}>
                       <Coins className="size-4" />
                       {creditsRemaining > 0 ? "Active" : "Empty"}
                    </div>
                 </div>

                 {totalCredits > 0 && (
                   <div className="mt-6 space-y-2">
                     <div className="flex justify-between text-sm text-neutral-400">
                       <span>{usedPct}% used</span>
                       <span>{creditsUsed.toLocaleString()} / {totalCredits.toLocaleString()}</span>
                     </div>
                     <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                       <div
                         className={cn("h-full rounded-full transition-all", usedPct > 80 ? "bg-red-500" : "bg-blue-500")}
                         style={{ width: `${usedPct}%` }}
                       />
                     </div>
                   </div>
                 )}

                 <p className="mt-6 text-neutral-400">
                   Total spent: <span className="text-white font-medium">${totalPayments.toLocaleString()}</span>
                 </p>

                 <div className="mt-4 text-sm text-neutral-400">
                   Approx. characters remaining: <span className="text-white font-medium">{Math.floor(creditsRemaining / (billingProfile.creditsPerCharacter || 2)).toLocaleString()}</span> 
                   <span className="text-xs ml-1">(using live billing profile)</span>
                 </div>

                 {usage?.plan === "professional" && (
                   <div className="mt-2 text-sm text-violet-400">
                     VoiceForge Premium active — access to Studio voices and cloning
                   </div>
                 )}
                 
                 <div className="mt-8 flex flex-wrap gap-4">
                    <Button className="rounded-full bg-primary hover:bg-primary/90 text-on-primary shadow-lg shadow-primary/20" asChild>
                      <Link href="/checkout">Buy More Credits (Pro)</Link>
                    </Button>
                    <Button variant="outline" className="rounded-full" asChild>
                      <Link href="/checkout?plan=professional">Upgrade to VoiceForge Premium — $2.99/mo (Studio + Cloning)</Link>
                    </Button>
                 </div>
              </div>

           </div>

           {/* Sidebar */}
           <div className="space-y-6">
              <div className="glass-panel p-6 border-white/10">
                 <h3 className="font-bold mb-4">Quick Top-Up</h3>
                 <div className="flex flex-col gap-3">
                   {[5, 10, 25].map((amt) => (
                     <Link
                       key={amt}
                       href={`/checkout?amount=${amt}`}
                       className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all"
                     >
                       <span className="text-white font-bold">${amt}</span>
                       <span className="text-xs text-neutral-400">
                         {Math.floor((amt * 0.5 / 4.2) * 1000000 * 2).toLocaleString()} credits
                       </span>
                     </Link>
                   ))}
                 </div>
                 <Button variant="outline" className="w-full mt-4 rounded-full border-white/10 hover:bg-white/5" asChild>
                    <Link href="/checkout">Custom Amount</Link>
                 </Button>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                 <h4 className="text-sm font-bold text-primary">Need help?</h4>
                 <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                   If you have questions about your billing, please contact our support team.
                 </p>
                 <Button asChild variant="link" className="text-xs p-0 h-auto mt-3 text-primary hover:text-primary/80">
                   <a href="mailto:support@voiceforgeai.site?subject=VoiceForge%20AI%20Billing%20Support">Contact Support</a>
                 </Button>
                 <div className="text-[10px] text-neutral-500 mt-0.5">support@voiceforgeai.site</div>
              </div>
           </div>
        </div>
      </main>
    </>
  );
}

