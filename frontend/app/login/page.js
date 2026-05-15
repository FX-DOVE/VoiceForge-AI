"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Activity } from "lucide-react";
import { GithubIcon as Github, GoogleIcon as Chrome } from "@/components/ui/icons";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success("Signed in successfully.");
      const next = searchParams.get("next");
      if (user?.role === "admin") {
        router.push(next?.startsWith("/admin") ? next : "/admin");
      } else {
        router.push(next && !next.startsWith("/admin") ? next : "/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-8 sm:p-10 w-full flex flex-col gap-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold text-on-surface">Welcome back</h1>
        <p className="text-on-surface-variant">Sign in to continue your audio synthesis.</p>
      </motion.div>

      <form className="flex flex-col gap-6" onSubmit={handleLogin}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <label className="text-sm font-medium text-on-surface-variant" htmlFor="email">
            Email
          </label>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex items-center group"
          >
            <Mail className="absolute left-4 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <Input
              className="h-14 pl-12 bg-surface-container-low border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-on-surface-variant" htmlFor="password">
              Password
            </label>
            <Link
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex items-center group"
          >
            <Lock className="absolute left-4 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <Input
              className="h-14 pl-12 bg-surface-container-low border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </motion.div>
        </motion.div>

        <Button
          className="h-14 w-full bg-primary hover:bg-primary/90 text-on-primary rounded-full text-lg font-bold"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Sign In"}
          <ArrowRight className="ml-2 size-5" />
        </Button>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 opacity-60"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 h-[1px] bg-outline-variant"
        />
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
          OR CONTINUE WITH
        </span>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 h-[1px] bg-outline-variant"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4"
      >
        <Button variant="outline" className="h-12 border-outline-variant hover:bg-white/5 rounded-2xl" type="button" disabled>
          <Github className="mr-2 size-5" />
          Github
        </Button>
        <Button variant="outline" className="h-12 border-outline-variant hover:bg-white/5 rounded-2xl" type="button" disabled>
          <Chrome className="mr-2 size-5" />
          Google
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background text-on-surface antialiased min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-30"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[800px] h-[800px] bg-primary rounded-full blur-[120px] mix-blend-screen opacity-10 -translate-y-1/4"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[600px] h-[600px] bg-secondary-container rounded-full blur-[100px] mix-blend-screen opacity-10 translate-y-1/4 -translate-x-1/4"
        />
      </motion.div>

      <main className="relative z-10 w-full max-w-md px-6 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Link href="/" className="flex items-center gap-3 text-primary group">
            <Activity className="size-8 group-hover:scale-110 transition-transform" />
            <span className="text-3xl font-bold text-on-surface tracking-tight">VoiceForge</span>
          </Link>
        </motion.div>

        <Suspense fallback={<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-3xl p-10 animate-pulse h-96" />}>
          <LoginForm />
        </Suspense>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link className="text-primary hover:text-primary/80 font-bold transition-colors" href="/signup">
              Sign up
            </Link>
          </p>
        </motion.div>
      </main>
    </motion.div>
  );
}
