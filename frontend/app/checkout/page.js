"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Coins,
  Shield,
  History,
  Headphones,
  Zap,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { calculateCreditsFromPayment } from "@/lib/creditCalc";
import { paymentsApi } from "@/lib/api";
import { toast } from "sonner";

const PRESET_AMOUNTS = [1, 2, 5, 10, 25, 50, 100];

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const activeAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;
  const estimatedCredits = useMemo(() => calculateCreditsFromPayment(activeAmount), [activeAmount]);

  const handlePresetSelect = (amount) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
  };

  const handlePurchase = async () => {
    if (activeAmount <= 0) {
      toast.error("Please select or enter a valid amount.");
      return;
    }
    setPurchasing(true);
    try {
      const data = await paymentsApi.purchase(activeAmount);
      toast.success(`Successfully purchased ${(data.creditsAdded ?? estimatedCredits).toLocaleString()} credits!`);
      router.push("/dashboard?purchase=success");
    } catch (err) {
      toast.error(err?.message || "Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container overflow-y-auto">
      {/* Header */}
      <nav className="max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center">
             <div className="size-4 bg-primary rounded-sm" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">VoiceForge AI</span>
        </div>
        <Link className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors font-bold text-sm" href="/dashboard">
          <ArrowLeft className="size-4" />
          Return to Dashboard
        </Link>
      </nav>

      <main className="max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Credit Calculator */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
              >
                Buy <br/>Credits
              </motion.h1>
              <p className="text-base sm:text-lg lg:text-xl text-on-surface-variant">Pay as you go. Use credits for pro voice generation.</p>
            </div>

            <div className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 flex flex-col gap-8 border-white/5">
              <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-6">Credit Summary</h2>
              
              <div className="rounded-2xl bg-white/5 p-6 border border-white/5 text-center space-y-3">
                <p className="text-on-surface-variant text-sm font-medium">You will receive</p>
                <p className="text-5xl font-bold text-primary tracking-tight">
                  {activeAmount > 0 ? estimatedCredits.toLocaleString() : "0"}
                </p>
                <p className="text-on-surface-variant text-sm font-medium">credits</p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  "1 character = 2 credits",
                  "Pro xAI voices deduct credits on use",
                  "Free Edge TTS voices are always free",
                  "Credits never expire"
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <p className="text-on-surface text-base font-medium">{f}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-8 border-t border-white/5 flex flex-col gap-4">
                <div className="flex justify-between items-center text-on-surface-variant font-medium">
                  <span>Amount</span>
                  <span className="text-white">${activeAmount > 0 ? activeAmount.toFixed(2) : "0.00"}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant font-medium">
                  <span>API Value (60%)</span>
                  <span className="text-white">${activeAmount > 0 ? (activeAmount * 0.6).toFixed(2) : "0.00"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl text-white font-bold">Credits</span>
                  <span className="text-3xl text-primary font-bold">{activeAmount > 0 ? estimatedCredits.toLocaleString() : "0"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-60">
              <ShieldCheck className="size-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Secure SSL Encryption</span>
            </div>
          </div>

          {/* Right Column: Amount Selection & Purchase */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 flex flex-col gap-8 lg:gap-10 border-white/5"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-white">Select Amount</h2>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Coins className="size-5" />
                  <span className="text-sm font-bold">Pay as you go</span>
                </div>
              </div>

              {/* Preset Amount Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handlePresetSelect(amount)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all font-bold",
                      !isCustom && selectedAmount === amount
                        ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                        : "bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.06] hover:border-white/20"
                    )}
                  >
                    <span className="text-2xl">${amount}</span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {calculateCreditsFromPayment(amount).toLocaleString()} credits
                    </span>
                  </button>
                ))}

                {/* Custom Amount Button */}
                <button
                  type="button"
                  onClick={handleCustomFocus}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border transition-all font-bold",
                    isCustom
                      ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                      : "bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.06] hover:border-white/20"
                  )}
                >
                  <span className="text-lg">Custom</span>
                  <span className="text-[10px] text-on-surface-variant font-medium">Any amount</span>
                </button>
              </div>

              {/* Custom Amount Input */}
              {isCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-col gap-3"
                >
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Custom Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-lg">$</span>
                    <Input
                      type="number"
                      min="0.50"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      onFocus={handleCustomFocus}
                      className="h-14 pl-12 pr-6 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 transition-all text-lg font-bold"
                      placeholder="Enter amount"
                      autoFocus
                    />
                  </div>
                </motion.div>
              )}

              {/* Credit Estimate Banner */}
              {activeAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-4"
                >
                  <Zap className="size-8 text-primary shrink-0" />
                  <div>
                    <p className="text-white font-bold text-lg">
                      Pay ${activeAmount.toFixed(2)} and receive {estimatedCredits.toLocaleString()} credits
                    </p>
                    <p className="text-on-surface-variant text-sm mt-0.5">
                      That's approximately {Math.floor(estimatedCredits / 2).toLocaleString()} characters of pro TTS
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Purchase CTA */}
              <div className="mt-4 flex flex-col gap-6">
                <Button 
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-on-primary rounded-full text-xl font-bold shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50" 
                  onClick={handlePurchase}
                  disabled={activeAmount <= 0 || purchasing}
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="mr-2 size-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 size-5 fill-current" />
                      Purchase {activeAmount > 0 ? `$${activeAmount.toFixed(2)}` : ""} Credits
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-on-surface-variant px-12 leading-relaxed">
                  By completing this purchase, you agree to our <Link className="text-primary hover:underline font-bold" href="/terms">Terms of Service</Link>. Credits are non-refundable and added instantly.
                </p>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8">
              <div className="flex flex-col items-center gap-3 text-on-surface-variant group">
                <Shield className="size-10 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-bold uppercase tracking-widest text-center">Bank-level Security</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-on-surface-variant group">
                <History className="size-10 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-bold uppercase tracking-widest text-center">Instant Credits</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-on-surface-variant group">
                <Headphones className="size-10 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-bold uppercase tracking-widest text-center">24/7 Priority Support</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 mt-auto flex flex-col sm:flex-row justify-between items-center border-t border-white/5 gap-6 shrink-0">
        <p className="text-sm text-on-surface-variant">&copy; 2024 VoiceForge AI. All rights reserved.</p>
        <div className="flex gap-8">
          <Link className="text-sm text-on-surface-variant hover:text-white transition-colors" href="/privacy">Privacy Policy</Link>
          <Link className="text-sm text-on-surface-variant hover:text-white transition-colors" href="/terms">Terms of Use</Link>
          <Link className="text-sm text-on-surface-variant hover:text-white transition-colors" href="/help">Help Center</Link>
        </div>
      </footer>
    </div>
  );
}

