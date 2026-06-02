"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { paymentsApi } from "@/lib/api";
import { toast } from "sonner";
import { Gift, Loader2, CheckCircle, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClaimCreditsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("idle"); // idle | claiming | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClaim = async (claimToken) => {
    const t = claimToken || token;
    if (!t) {
      setStatus("error");
      setErrorMessage("No claim token provided. This link may be invalid.");
      return;
    }

    setStatus("claiming");
    try {
      const data = await paymentsApi.claimGift(t);
      setResult(data);
      setStatus("success");
      toast.success(data.message || "Credits claimed successfully!");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to claim credits. The link may have expired.");
    }
  };

  // Auto-claim on page load if token exists
  useEffect(() => {
    if (token) {
      handleClaim(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 text-center">
          {/* Claiming State */}
          {status === "claiming" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Loader2 className="size-10 text-emerald-400 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Claiming Your Credits...</h1>
                <p className="text-neutral-400 text-sm">Please wait while we add the credits to your account.</p>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {status === "success" && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="size-10 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Credits Claimed!</h1>
                <p className="text-neutral-400 text-sm mb-6">Your free credits have been added to your account.</p>
              </div>

              {/* Credit Info */}
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="size-5 text-emerald-400" />
                  <span className="text-3xl font-bold text-emerald-400">
                    +{result.credits?.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">credits added (worth ${result.usdAmount?.toFixed(2)} USD)</p>
              </div>

              {/* Balance */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">New Balance</p>
                <p className="text-xl font-bold text-white">{result.newBalance?.toLocaleString()} credits</p>
              </div>

              {/* CTA */}
              <Button
                onClick={() => router.push("/studio")}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              >
                Start Creating
              </Button>
            </motion.div>
          )}

          {/* Error State */}
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="size-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <XCircle className="size-10 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Unable to Claim</h1>
                <p className="text-neutral-400 text-sm">{errorMessage}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white"
                >
                  Go to Dashboard
                </Button>
                {token && (
                  <Button
                    onClick={() => { setStatus("idle"); handleClaim(token); }}
                    variant="outline"
                    className="w-full h-11 rounded-xl border-white/10 text-neutral-300 hover:bg-white/5"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Idle State (no token) */}
          {status === "idle" && !token && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="size-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="size-10 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
                <p className="text-neutral-400 text-sm">
                  This claim link is missing a valid token. Please use the link from your email.
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white"
              >
                Go to Dashboard
              </Button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-600 mt-6">
          VoiceForge AI &mdash; AI-Powered Voice Generation
        </p>
      </motion.div>
    </div>
  );
}
