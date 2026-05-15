"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CODE_LENGTH = 6;

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your inbox";
  const initialToken = searchParams.get("token") || "";

  const [status, setStatus] = useState(initialToken ? "verifying" : "input"); // input | verifying | success | error
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef([]);

  // Auto-verify if token in URL
  useEffect(() => {
    if (!initialToken) return;
    const timer = setTimeout(() => {
      if (initialToken.length >= 6) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setStatus("error");
        setError("This verification link is invalid or has expired.");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [initialToken, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  function handleDigit(i, v) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function handleKey(i, e) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array.from({ length: CODE_LENGTH }, (_, i) => text[i] || "");
    setCode(next);
    inputsRef.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const value = code.join("");
    if (value.length < CODE_LENGTH) {
      setError("Enter all 6 digits.");
      return;
    }
    setStatus("verifying");
    setTimeout(() => {
      // Demo: accept any code that isn't all zeros
      if (value === "000000") {
        setStatus("error");
        setError("Invalid verification code. Try again.");
      } else {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    }, 800);
  }

  function handleResend() {
    setResendCooldown(30);
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
                  ? "Hang on while we confirm your code."
                  : status === "error"
                  ? error || "We couldn't verify this code."
                  : (
                    <>
                      We sent a 6-digit code to{" "}
                      <span className="text-white font-semibold">{email}</span>.
                      Enter it below to activate your account.
                    </>
                  )}
              </p>
            </div>
          </div>

          {status === "input" || (status === "error" && !initialToken) ? (
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div
                className="flex justify-between gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKey(i, e)}
                    aria-label={`Digit ${i + 1}`}
                    className="w-full h-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <ShieldAlert className="size-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.2)] group"
              >
                Verify Email
                <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
                <span>Didn't receive a code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-primary font-bold hover:underline underline-offset-4 disabled:opacity-50 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                </button>
              </div>
            </form>
          ) : status === "success" ? (
            <Button asChild className="h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold text-lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : status === "error" ? (
            <Button
              onClick={() => {
                setStatus("input");
                setError("");
              }}
              variant="outline"
              className="h-14 rounded-full border-white/10 hover:bg-white/5 font-bold"
            >
              Try a Different Code
            </Button>
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
