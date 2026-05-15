"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

export default function CloningTrainPage() {
  const [progress, setProgress] = useState(8);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setDone(true);
          return 100;
        }
        return p + 6;
      });
    }, 420);
    return () => clearInterval(id);
  }, [done]);

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Training</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            We&apos;re optimizing weights for your samples. This is a mocked
            progress state.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>Overall progress</span>
              <span>{Math.min(100, progress)}%</span>
            </div>
            <Progress value={Math.min(100, progress)} />
            <ul className="space-y-3 text-sm text-on-surface-variant">
              {[
                { label: "Validating audio", threshold: 25 },
                { label: "Extracting speaker embedding", threshold: 55 },
                { label: "Fine-tuning synthesis head", threshold: 85 },
                { label: "Packaging voice profile", threshold: 100 },
              ].map((row) => {
                const active = progress >= row.threshold - 15;
                return (
                  <li
                    key={row.label}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-surface-container-low/40 px-3 py-2"
                  >
                    <span
                      className={
                        active ? "text-on-surface" : "text-on-surface-variant"
                      }
                    >
                      {row.label}
                    </span>
                    {progress >= row.threshold ? (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : (
                      <span className="vf-skeleton h-2 w-10 rounded-full" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          {done && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300"
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Voice ready (mock)
            </motion.div>
          )}
          <Button size="lg" className="rounded-full" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
