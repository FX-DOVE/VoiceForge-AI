"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCloningStore } from "@/stores/cloning-store";
import { cn } from "@/lib/utils";

export default function CloningConfigurePage() {
  const {
    voiceName,
    visibility,
    description,
    setVoiceName,
    setVisibility,
    setDescription,
  } = useCloningStore();

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Configure voice</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Name your model and choose how it appears in your library.
          </p>
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="voice-name">Voice name</Label>
              <Input
                id="voice-name"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="e.g. Studio Narrator"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-on-surface">
                Visibility
              </span>
              <div className="flex flex-wrap gap-2">
                {["private", "public"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors",
                      visibility === v
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-white/10 text-on-surface-variant hover:border-white/20"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="voice-desc">Description</Label>
              <textarea
                id="voice-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-offset-background placeholder:text-outline focus-visible:ring-2 focus-visible:ring-action/60"
                placeholder="How should teammates use this voice?"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3">
          <Button variant="ghost" asChild>
            <Link href="/cloning/upload">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/cloning/train">Start Training</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
