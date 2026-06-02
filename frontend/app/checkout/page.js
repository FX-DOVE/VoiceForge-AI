"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { paymentsApi, adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Zap, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialAmount = Number(searchParams.get("amount")) || 10;
  const initialPlan = searchParams.get("plan");
  const [amount, setAmount] = useState(initialAmount);
  const [isPremiumUpgrade, setIsPremiumUpgrade] = useState(initialPlan === "professional");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false);

  const minPayment = 0.5;
  const [estimatedCredits, setEstimatedCredits] = useState(0);

  useEffect(() => {
    if (isPremiumUpgrade) {
      setAmount(2.99);
    }
  }, [isPremiumUpgrade]);

  // Fetch live estimate from backend when amount changes
  useEffect(() => {
    const fetchEstimate = async () => {
      if (isPremiumUpgrade) {
        setEstimatedCredits(0); // subscription, not credits
        return;
      }
      try {
        // Use new provider-aware estimate method (for VoiceForge Pro deposits)
        const res = await paymentsApi.estimate(amount, "xai");
        if (res?.credits) setEstimatedCredits(res.credits);
      } catch {
        // fallback rough estimate if backend fails
        setEstimatedCredits(Math.floor(amount * 66666));
      }
    };
    if (amount > 0 || isPremiumUpgrade) fetchEstimate();
  }, [amount, isPremiumUpgrade]);

  const handleCheckout = async () => {
    if (amount < minPayment) {
      toast.error(`Minimum payment is $${minPayment}`);
      return;
    }

    if (!refundPolicyAccepted) {
      toast.error("You must acknowledge the no refund policy before proceeding.");
      return;
    }

    setInitializing(true);
    try {
      const data = await paymentsApi.initialize(amount, refundPolicyAccepted);
      // data.authorization_url
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.error("Invalid payment URL received.");
        setInitializing(false);
      }
    } catch (err) {
      toast.error(err.message || "Failed to initialize payment");
      setInitializing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <TopNavBar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isPremiumUpgrade ? "Upgrade to VoiceForge Premium" : "Purchase Credits"}
            </h1>
            <p className="text-neutral-400 mt-2">
              {isPremiumUpgrade 
                ? "$2.99/month - VoiceForge Premium (Studio voices + full voice cloning)" 
                : "Pay-as-you-go. No subscriptions."}
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-white/10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-primary/10 rounded-bl-3xl border-b border-l border-primary/20">
              <Zap className="size-5 text-primary" />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-neutral-300">Enter Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-neutral-500">$</span>
                <input
                  type="number"
                  min={minPayment}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  disabled={isPremiumUpgrade}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 pl-10 pr-6 text-2xl font-bold text-white outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-70"
                />
              </div>
              <p className="text-xs text-neutral-500">{isPremiumUpgrade ? "Premium: $2.99 / month" : `Minimum payment: $${minPayment}`}</p>
            </div>

            {/* Non-Refundable Notice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200/80">
                <p className="font-semibold text-amber-200 mb-1">All purchases are final and non-refundable.</p>
                <p>Please use your complimentary credits to test the platform thoroughly before purchasing additional credits.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">{isPremiumUpgrade ? "Membership unlocks" : "Credits you will receive"}</span>
                <span className="font-semibold text-white">{isPremiumUpgrade ? "Premium access" : estimatedCredits.toLocaleString() + " credits"}</span>
              </div>
              <div className="h-px w-full bg-white/5 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-neutral-300 font-semibold">You Receive</span>
                <span className="text-xl font-bold text-primary">{estimatedCredits.toLocaleString()} Credits</span>
              </div>
            </div>

            {/* Refund Policy Acceptance Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={refundPolicyAccepted}
                  onChange={(e) => setRefundPolicyAccepted(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="size-5 rounded border border-white/20 bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                  <svg className="size-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm text-neutral-400 leading-relaxed">
                I understand that all purchases are final and non-refundable. I have tested the platform using my free credits and agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>.
              </span>
            </label>

            <Button 
              onClick={handleCheckout} 
              disabled={initializing || amount < minPayment || !refundPolicyAccepted}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 text-on-primary shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initializing ? <Loader2 className="size-5 animate-spin mr-2" /> : "Proceed to Payment"}
              {!initializing && <ArrowRight className="size-5 ml-2" />}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
              <ShieldCheck className="size-4 text-emerald-500" />
              Secure payment via Paystack
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
