"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Bolt, Play, Pause, Loader2, Settings2, Trash2, History, Mic, Crown, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { voicesApi, ttsApi, cloningApi } from "@/lib/api";
import { getMediaUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/client";
import { EmailVerificationBanner } from "@/components/email-verification-banner";

function StudioPageInner() {
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(1);
  const [stability, setStability] = useState(75);
  const [voices, setVoices] = useState([]);
  const [clonedVoices, setClonedVoices] = useState([]);
  const [voiceFilter, setVoiceFilter] = useState("all");
  const [selectedSlug, setSelectedSlug] = useState("");
  const [generating, setGenerating] = useState(false);
  const [lastAudioUrl, setLastAudioUrl] = useState(null);
  const [previewingSlug, setPreviewingSlug] = useState(null);
  const [loadingPreviewSlug, setLoadingPreviewSlug] = useState(null);
  const previewAudioRef = useRef(null);
  const generatedAudioRef = useRef(null);
  const maxChars = 10000;
  const count = text.length;

  async function handlePreview(slug, e) {
    e.stopPropagation();
    const audio = previewAudioRef.current;
    if (!audio) return;

    if (previewingSlug === slug) {
      audio.pause();
      setPreviewingSlug(null);
      return;
    }

    audio.pause();
    setPreviewingSlug(null);
    setLoadingPreviewSlug(slug);

    try {
      const data = await voicesApi.preview(slug);
      const url = data.url;

      await new Promise((resolve, reject) => {
        const onReady = () => {
          audio.removeEventListener("canplay", onReady);
          audio.removeEventListener("error", onFail);
          resolve();
        };
        const onFail = (e) => {
          audio.removeEventListener("canplay", onReady);
          audio.removeEventListener("error", onFail);
          reject(new Error(e?.message || "Audio load error"));
        };
        // Register BEFORE setting src — prevents any race condition
        audio.addEventListener("canplay", onReady);
        audio.addEventListener("error", onFail);
        audio.src = url;
        audio.load();
      });

      setLoadingPreviewSlug(null);
      setPreviewingSlug(slug);
      await audio.play();
    } catch (err) {
      console.error("[Preview]", err);
      setLoadingPreviewSlug(null);
      setPreviewingSlug(null);
      toast.error("Could not load voice preview.");
    }
  }

  useEffect(() => {
    const urlVoice = searchParams?.get("voice");
    Promise.all([
      voicesApi.list().catch(() => ({ voices: [] })),
      cloningApi.list().catch(() => ({ clones: [] })),
    ]).then(([stockData, cloneData]) => {
      const stockList = stockData.voices || [];
      const readyClones = (cloneData.clones || [])
        .filter((c) => c.status === "ready" && c.voiceSlug)
        .map((c) => ({
          slug: c.voiceSlug,
          id: c.voiceSlug,
          name: c.name || "My Clone",
          type: "cloned",
          tier: "free",
          tags: ["Cloned"],
          description: c.description || "",
          cloneId: c.id,
          visibility: c.visibility,
        }));
      setVoices(stockList);
      setClonedVoices(readyClones);
      // Pre-select from URL param first, then first stock voice
      if (urlVoice) {
        setSelectedSlug(urlVoice);
        if (readyClones.some((c) => c.slug === urlVoice)) setVoiceFilter("cloned");
      } else if (stockList.length) {
        setSelectedSlug(stockList[0].slug || stockList[0].id);
      }
    });
  }, [searchParams]);

  const speedLabel = useMemo(() => `${speed.toFixed(1)}x`, [speed]);
  const stabilityLabel = useMemo(() => `${stability}%`, [stability]);

  const allVoices = useMemo(() => [...voices, ...clonedVoices], [voices, clonedVoices]);
  const selectedVoice = allVoices.find((v) => (v.slug || v.id) === selectedSlug);

  async function handleGenerate() {
    if (!text.trim() || !selectedSlug) return;
    setGenerating(true);
    try {
      const data = await ttsApi.generate({
        text,
        voiceSlug: selectedSlug,
        speed,
        stability: stability / 100,
      });
      const url = getMediaUrl(data.generation?.playbackUrl || data.generation?.audioUrl);
      setLastAudioUrl(url);
      toast.success("Audio generated successfully.");
      setTimeout(() => {
        generatedAudioRef.current?.play().catch(() => {});
      }, 100);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-full">
        <header className="hidden lg:flex h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-30 items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3 text-white">
            <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-xl border border-primary/20">
              <Mic className="size-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight">Voice Studio</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="rounded-full text-on-surface-variant hover:text-white h-9 px-4" onClick={() => setText("")}>
              <Trash2 className="size-3.5 mr-1.5" />
              Clear
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-container-max mx-auto w-full pb-16">

        <EmailVerificationBanner />

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column: Script Input */}
          <div className="flex-1 min-w-0 w-full space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Generate Audio</h1>
                <p className="text-sm text-neutral-400 mt-1">Transform your script into high-fidelity speech.</p>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex border-white/5 bg-white/5 rounded-full h-9 px-4 text-xs" onClick={() => setText("")}>
                <Trash2 className="size-3.5 mr-1.5" />
                Clear Script
              </Button>
            </div>

            <div className="overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-white/[0.04]">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                  <Settings2 className="size-4 text-primary" />
                  <span>Script Input</span>
                </div>
                <div className={`text-xs font-mono px-2 py-0.5 rounded ${count > maxChars * 0.9 ? "text-red-400 bg-red-500/10" : "text-neutral-500"}`}>
                  {count.toLocaleString()} / {maxChars.toLocaleString()}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                className="w-full min-h-[320px] sm:min-h-[400px] bg-transparent p-5 text-base leading-relaxed text-neutral-200 outline-none placeholder:text-neutral-600 resize-none"
                placeholder="Paste your script here... Use punctuation and paragraph breaks for better results."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-neutral-300">Generation Speed</label>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full">{speedLabel}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5"
                />
                <p className="text-[11px] text-neutral-500 leading-relaxed">Faster speeds may slightly impact naturalness.</p>
              </div>

              <div className="glass-panel p-5 border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-neutral-300">Stability</label>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full">{stabilityLabel}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={stability}
                  onChange={(e) => setStability(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5"
                />
                <p className="text-[11px] text-neutral-500 leading-relaxed">Higher values produce consistent but less expressive speech.</p>
              </div>
            </div>
          </div>

          {/* Hidden audio element for voice previews */}
          <audio
            ref={previewAudioRef}
            onEnded={() => setPreviewingSlug(null)}
            className="hidden"
            playsInline
            preload="none"
          />

          {/* Right Column: Voice Selection & Action */}
          <div className="w-full lg:w-[380px] lg:sticky lg:top-[80px] space-y-4">
            <div className="glass-panel flex flex-col border-white/10 rounded-2xl overflow-hidden" style={{ maxHeight: "calc(100vh - 160px)" }}>
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                <h3 className="font-bold text-sm">Select Voice</h3>
                <History className="size-4 text-neutral-500 cursor-pointer hover:text-white transition-colors" />
              </div>

              {/* Filter tabs */}
              <div className="px-3 pt-3 pb-1 flex gap-1 shrink-0 flex-wrap">
                {[
                  { id: "all", label: "All" },
                  { id: "free", label: "Free" },
                  { id: "pro", label: "Pro" },
                  { id: "cloned", label: `My Clones${clonedVoices.length ? ` (${clonedVoices.length})` : ""}` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setVoiceFilter(f.id)}
                    className={cn(
                      "px-3 h-7 rounded-full text-[11px] font-bold transition-all",
                      voiceFilter === f.id
                        ? "bg-primary text-on-primary"
                        : "bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar min-h-0">
                {/* Stock voices — Free + Pro tiers */}
                {["free", "pro"].map((tier) => {
                  if (voiceFilter === "cloned") return null;
                  if (voiceFilter !== "all" && voiceFilter !== tier) return null;
                  const tierVoices = voices.filter(v => (v.tier || "free") === tier);
                  if (!tierVoices.length) return null;
                  return (
                    <div key={tier} className="mb-4">
                      <div className={`flex items-center gap-2 px-1 mb-2 ${tier === "free" ? "text-emerald-400" : "text-amber-400"}`}>
                        {tier === "free" ? <Zap className="size-3.5 fill-current" /> : <Crown className="size-3.5 fill-current" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {tier === "free" ? "Free — VoiceForge TTS" : "Pro — VoiceForge TTS"}
                        </span>
                        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tier === "free" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                          {tierVoices.length} voices
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {tierVoices.map((v) => {
                          const slug = v.slug || v.id;
                          const isSelected = selectedSlug === slug;
                          return (
                            <div key={slug} role="radio" aria-checked={isSelected} tabIndex={0}
                              onClick={() => setSelectedSlug(slug)}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedSlug(slug); } }}
                              className={cn("group w-full flex items-center justify-between p-3 rounded-xl transition-all border cursor-pointer",
                                isSelected
                                  ? tier === "free" ? "bg-emerald-600/10 border-emerald-500/40" : "bg-amber-600/10 border-amber-500/40"
                                  : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-white/10">
                                  {v.img ? (
                                    <Image src={v.img} alt={v.name} fill className="object-cover" />
                                  ) : (
                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary font-bold text-base">{v.name?.[0] || "V"}</div>
                                  )}
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-sm font-bold">{v.name}</h4>
                                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${tier === "free" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                                      {tier === "free" ? "FREE" : "PRO"}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 mt-0.5">
                                    {(v.tags || []).slice(0, 2).map(tag => (
                                      <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {isSelected ? (
                                <div className={`size-2 rounded-full ${tier === "free" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"}`} />
                              ) : (
                                <button type="button" onClick={(e) => handlePreview(slug, e)} disabled={loadingPreviewSlug === slug}
                                  className="size-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-60"
                                  aria-label={`Preview ${v.name}`}
                                >
                                  {loadingPreviewSlug === slug ? <Loader2 className="size-3.5 text-primary animate-spin" /> : previewingSlug === slug ? <Pause className="size-3.5 text-primary fill-current" /> : <Play className="size-3.5 text-neutral-400 fill-current" />}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Cloned voices section */}
                {(voiceFilter === "all" || voiceFilter === "cloned") && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 px-1 mb-2 text-primary">
                      <Mic className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">My Cloned Voices</span>
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                        {clonedVoices.length} voices
                      </span>
                    </div>
                    {clonedVoices.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                        <Mic className="size-5 text-on-surface-variant/40" />
                        <p className="text-[11px] text-on-surface-variant/60">No cloned voices ready yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {clonedVoices.map((v) => {
                          const slug = v.slug || v.id;
                          const isSelected = selectedSlug === slug;
                          return (
                            <div key={slug} role="radio" aria-checked={isSelected} tabIndex={0}
                              onClick={() => setSelectedSlug(slug)}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedSlug(slug); } }}
                              className={cn("group w-full flex items-center justify-between p-3 rounded-xl transition-all border cursor-pointer",
                                isSelected
                                  ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(59,130,246,0.08)]"
                                  : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="size-11 shrink-0 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
                                  <Mic className="size-5" />
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-sm font-bold truncate max-w-[120px]">{v.name}</h4>
                                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-primary/20 text-primary">CLONE</span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Shield className="size-2.5 text-on-surface-variant/50" />
                                    <span className="text-[10px] text-neutral-500 capitalize">{v.visibility || "private"}</span>
                                  </div>
                                </div>
                              </div>
                              {isSelected ? (
                                <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                              ) : (
                                <button type="button" onClick={(e) => handlePreview(slug, e)} disabled={loadingPreviewSlug === slug}
                                  className="size-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-60"
                                  aria-label={`Preview ${v.name}`}
                                >
                                  {loadingPreviewSlug === slug ? <Loader2 className="size-3.5 text-primary animate-spin" /> : previewingSlug === slug ? <Pause className="size-3.5 text-primary fill-current" /> : <Play className="size-3.5 text-neutral-400 fill-current" />}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.02] space-y-3 shrink-0">
                <Button
                  className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-on-primary rounded-xl shadow-lg shadow-primary/20 group transition-all"
                  onClick={handleGenerate}
                  disabled={!text || !selectedSlug || generating}
                >
                  <Bolt className="size-4 mr-2 fill-current" />
                  {generating ? "Generating..." : "Generate Audio"}
                </Button>
                {lastAudioUrl && (
                  <audio ref={generatedAudioRef} controls src={lastAudioUrl} autoPlay playsInline preload="none" className="w-full rounded-xl h-10" />
                )}
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={null}>
      <StudioPageInner />
    </Suspense>
  );
}
