"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, Play, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cloningApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SharedVoicePage() {
  const { token } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    cloningApi
      .getShared(token)
      .then((res) => setData(res))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="size-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-400">
          <AlertTriangle className="size-10" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Voice Not Found</h1>
          <p className="text-on-surface-variant max-w-sm">
            This shared voice link is invalid or has been removed by its owner.
          </p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90 text-on-primary h-12 px-8" onClick={() => router.push("/")}>
          Go to VoiceForge
        </Button>
      </div>
    );
  }

  const isReady = data?.status === "ready";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 gap-10">
      {/* Brand */}
      <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
        <Mic className="size-5 text-primary" />
        VoiceForge
      </div>

      {/* Card */}
      <div className="w-full max-w-md glass-panel rounded-[2rem] border-white/10 p-8 flex flex-col gap-6">
        {/* Icon + Status */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "size-16 rounded-2xl flex items-center justify-center shrink-0",
            isReady ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-400"
          )}>
            <Mic className="size-8" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white">{data.name || "Cloned Voice"}</h1>
            {isReady ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-400 mt-0.5">
                <CheckCircle2 className="size-3.5" />
                Ready to use
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 mt-0.5">
                <Loader2 className="size-3.5 animate-spin" />
                {data.status === "training" ? "Training in progress" : "Not ready yet"}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-sm text-on-surface-variant">{data.description}</p>
        )}

        {/* Shared badge */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-on-surface-variant">
          <Lock className="size-3.5 shrink-0" />
          <span>Shared via private link &mdash; only people with this URL can view it.</span>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-2">
          {isReady && data.voice?.slug && (
            <Button
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold"
              onClick={() => router.push(`/studio?voice=${data.voice.slug}`)}
            >
              <Play className="mr-2 size-4 fill-current" />
              Try in Studio
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full h-12 rounded-full border border-white/10 hover:bg-white/5 text-on-surface-variant font-bold"
            onClick={() => router.push("/voices")}
          >
            Browse All Voices
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant/50">
        Powered by <span className="text-primary font-bold">VoiceForge</span>
      </p>
    </div>
  );
}
