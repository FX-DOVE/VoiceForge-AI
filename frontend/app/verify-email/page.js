"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api/config";
import { toast } from "sonner";
import { WelcomeCreditsModal } from "@/components/modals/welcome-credits-modal";
import { useAuth } from "@/contexts/auth-context";

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const { user, refreshUser, isEmailVerified, isAuthenticated } = useAuth();

  const [status, setStatus] = useState(token ? "verifying" : "input"); // input | verifying | success | error
  const [inputEmail, setInputEmail] = useState(email);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [creditsAwarded, setCreditsAwarded] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect already verified users to dashboard
  useEffect(() => {
    if (isAuthenticated && isEmailVerified && !isRedirecting) {
      setIsRedirecting(true);
      toast.info("Your email is already verified. Redirecting to dashboard...");
      router.push("/dashboard");
    }
  }, [isAuthenticated, isEmailVerified, router, isRedirecting]);

  // Auto-verify if token in URL
  useEffect(() => {
    if (!token || isRedirecting) return;
    
    async function verifyToken() {
      try {
        const response = await fetch(`${getApiUrl()}/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (data.success) {
          setStatus("success");
          toast.success(data.message || "Email verified successfully!");
          
          // CRITICAL: Refresh user data in auth context so emailVerified is updated
          await refreshUser();
          
          // Check if welcome credits were awarded
          if (data.welcomeBonusAwarded && data.creditsGranted > 0) {
            setCreditsAwarded(data.creditsGranted);
            setShowWelcomeModal(true);
          } else {
            // No credits awarded, redirect to dashboard after delay
            setTimeout(() => router.push("/dashboard"), 2000);
          }
        } else {
          setStatus("error");
          setError(data.message || "Invalid or expired verification link.");
        }
      } catch (err) {
        setStatus("error");
        setError("Failed to verify email. Please try again.");
      }
    }
    
    verifyToken();
  }, [token, router, refreshUser, isRedirecting]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function handleResend(e) {
    e?.preventDefault();
    if (!inputEmail || resendLoading) return;
    
    setResendLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || "Verification email sent!");
        setResendCooldown(60);
      } else {
        toast.error(data.message || "Failed to resend verification email.");
      }
    } catch (err) {
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-8">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
      </div>

      <header className="absolute top-0 left-0 w-full p-6 sm:p-8 flex items-center max-w-container-max mx-auto z-20">
        <Link
          href="/login"
          className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-all font-bold group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border-white/5 bg-white/[0.02] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-8 sm:gap-10 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col items-center text-center gap-6">
            <div
              className={cn(
                "size-16 rounded-[2rem] flex items-center justify-center border shadow-[0_0_20px_rgba(59,130,246,0.15)]",
                status === "success"
                  ? "bg-green-500/10 border-green-500/20"
                  : status === "error"
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-primary/10 border-primary/20"
              )}
            >
              {status === "success" ? (
                <CheckCircle2 className="size-8 text-green-400" />
              ) : status === "error" ? (
                <ShieldAlert className="size-8 text-red-400" />
              ) : status === "verifying" ? (
                <Loader2 className="size-8 text-primary animate-spin" />
              ) : (
                <Mail className="size-8 text-primary" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {status === "success"
                  ? "Email Verified"
                  : status === "verifying"
                  ? "Verifying..."
                  : status === "error"
                  ? "Verification Failed"
                  : "Verify Your Email"}
              </h1>
              <p className="text-on-surface-variant leading-relaxed">
                {status === "success"
                  ? "Your email is confirmed. Redirecting you to your dashboard..."
                  : status === "verifying"
                  ? "Hang on while we verify your email..."
                  : status === "error"
                  ? error || "We couldn't verify your email."
                  : (
                    <>
                      We sent a verification link to{" "}
                      <span className="text-white font-semibold">{email || "your inbox"}</span>.
                      Click the link in the email to activate your account.
                    </>
                  )}
              </p>
            </div>
          </div>

          {status === "input" || (status === "error" && !token) ? (
            <form className="flex flex-col gap-6" onSubmit={handleResend}>
              <div className="text-center mb-4">
                <p className="text-on-surface-variant mb-4">
                  Enter your email below and we&apos;ll send you a new verification link.
                </p>
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <ShieldAlert className="size-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={resendLoading || !inputEmail}
                className="h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.2)] disabled:opacity-50"
              >
                {resendLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Resend Verification Email"
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
                <span>Already verified?</span>
                <Link
                  href="/login"
                  className="text-primary font-bold hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </form>
          ) : status === "success" && !showWelcomeModal ? (
            <Button asChild className="h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold text-lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : status === "error" ? (
            <div className="flex flex-col gap-4">
              <p className="text-red-400 text-center">{error}</p>
              <Button
                onClick={() => {
                  setStatus("input");
                  setError("");
                }}
                variant="outline"
                className="h-14 rounded-full border-white/10 hover:bg-white/5 font-bold"
              >
                Request New Link
              </Button>
            </div>
          ) : null}

          <div className="pt-6 sm:pt-8 border-t border-white/5 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
              Wrong email?
              <Link
                href="/signup"
                className="text-primary hover:text-white ml-2 underline-offset-8 hover:underline transition-all"
              >
                Update it during signup
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Welcome Modal - shown after successful verification with credits */}
      <WelcomeCreditsModal 
        isOpen={showWelcomeModal} 
        onClose={() => {
          setShowWelcomeModal(false);
          router.push("/dashboard");
        }} 
        creditsAmount={creditsAwarded} 
      />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
