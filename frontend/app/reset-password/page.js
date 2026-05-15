"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LockKeyhole,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tokenInvalid = !token;

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0..4
  }, [password]);

  const strengthLabel = ["Too weak", "Weak", "Okay", "Strong", "Excellent"][strength];
  const strengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ][strength];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
      toast.success("Password updated successfully.");
      setTimeout(() => router.push("/login"), 2200);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Reset failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
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
                done
                  ? "bg-green-500/10 border-green-500/20"
                  : tokenInvalid
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-primary/10 border-primary/20"
              )}
            >
              {done ? (
                <CheckCircle2 className="size-8 text-green-400" />
              ) : tokenInvalid ? (
                <ShieldAlert className="size-8 text-red-400" />
              ) : (
                <LockKeyhole className="size-8 text-primary" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {done
                  ? "Password Updated"
                  : tokenInvalid
                  ? "Invalid Link"
                  : "Set a New Password"}
              </h1>
              <p className="text-on-surface-variant leading-relaxed">
                {done
                  ? "You can now sign in with your new password. Redirecting you to login..."
                  : tokenInvalid
                  ? "This reset link is missing or has expired. Request a fresh one to continue."
                  : "Choose a strong password you don't use anywhere else."}
              </p>
            </div>
          </div>

          {done ? (
            <Button asChild className="h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold text-lg">
              <Link href="/login">Continue to Login</Link>
            </Button>
          ) : tokenInvalid ? (
            <Button asChild className="h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold text-lg">
              <Link href="/forgot-password">Request New Link</Link>
            </Button>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="h-14 pl-12 pr-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 text-white placeholder:text-on-surface-variant/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                {password && (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all", strengthColor)}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPwd ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                    className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 text-white placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <ShieldAlert className="size-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.2)] group"
              >
                {submitting ? "Updating..." : "Update Password"}
                <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          )}

          <div className="pt-6 sm:pt-8 border-t border-white/5 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
              Remember your password?
              <Link href="/login" className="text-primary hover:text-white ml-2 underline-offset-8 hover:underline transition-all">
                Return to Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
