"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { useCloningStore } from "@/stores/cloning-store";
import { cloningApi } from "@/lib/api";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

const FALLBACK_STEPS = [
  { label: "Validating audio", threshold: 25 },
  { label: "Extracting speaker embedding", threshold: 55 },
  { label: "Fine-tuning synthesis head", threshold: 85 },
  { label: "Packaging voice profile", threshold: 100 },
];

export default function CloningTrainPage() {
  const { cloneId, reset } = useCloningStore();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [steps, setSteps] = useState([]);
  const [cloneProvider, setCloneProvider] = useState("xai");
  useEffect(() => {
    if (!cloneId) return;

    let cancelled = false;

    async function run() {
      try {
        await cloningApi.start(cloneId);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof ApiError ? err.message : "Could not start training.");
        }
        return;
      }

      const poll = async () => {
        try {
          const status = await cloningApi.status(cloneId);
          if (cancelled) return;

          setProgress(status.progress ?? 0);
          if (status.provider) setCloneProvider(status.provider);

          if (status.provider === "elevenlabs") {
            // Instant for VoiceForge Premium — show simplified UI (provider hidden from user)
            setSteps([{ label: "VoiceForge Premium — Instant Voice Cloning", done: status.status === "ready" }]);
          } else if (status.job?.steps?.length) {
            setSteps(
              status.job.steps.map((s) => ({
                label: s.label,
                done: s.status === "done",
              }))
            );
          }

          if (status.status === "ready") {
            setProgress(100);
            setDone(true);
            reset();
            return;
          }

          if (status.status === "failed") {
            toast.error(status.errorMessage || "Training failed.");
            return;
          }

          setTimeout(poll, 2000);
        } catch {
          if (!cancelled) setTimeout(poll, 3000);
        }
      };

      poll();
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [cloneId, reset]);

  const displaySteps =
    steps.length > 0
      ? steps.map((s, i) => ({
          label: s.label,
          threshold: ((i + 1) / steps.length) * 100,
          done: s.done,
        }))
      : FALLBACK_STEPS.map((s) => ({
          ...s,
          done: progress >= s.threshold,
        }));

  if (!cloneId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 gap-4">
        <p className="text-on-surface-variant">No clone in progress.</p>
        <Button asChild>
          <Link href="/cloning/upload">Start a new clone</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">{cloneProvider === "elevenlabs" ? "VoiceForge Premium Cloning" : "Training"}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {cloneProvider === "elevenlabs"
              ? "Sending your samples for instant voice cloning (VoiceForge Premium). This is usually very fast."
              : "We're optimizing weights for your samples. This may take a few minutes."}
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>Overall progress</span>
              <span>{Math.min(100, Math.round(progress))}%</span>
            </div>
            <Progress value={Math.min(100, progress)} />
            <ul className="space-y-3 text-sm text-on-surface-variant">
              {displaySteps.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-surface-container-low/40 px-3 py-2"
                >
                  <span className={row.done ? "text-on-surface" : "text-on-surface-variant"}>
                    {row.label}
                  </span>
                  {row.done ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : (
                    <span className="vf-skeleton h-2 w-10 rounded-full" />
                  )}
                </li>
              ))}
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
              Voice ready — use it in Studio
            </motion.div>
          )}
          <Button size="lg" className="rounded-full" asChild>
            <Link href={done ? "/studio" : "/dashboard"}>
              {done ? "Open Studio" : "Back to Dashboard"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
