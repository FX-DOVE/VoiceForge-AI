"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Bolt, Play, Pause, Loader2, Settings2, Trash2, History, Info, Mic, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { voicesApi, ttsApi } from "@/lib/api";
import { getMediaUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/client";

export default function StudioPage() {
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(1);
  const [stability, setStability] = useState(75);
  const [voices, setVoices] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [generating, setGenerating] = useState(false);
  const [lastAudioUrl, setLastAudioUrl] = useState(null);
  const [previewingSlug, setPreviewingSlug] = useState(null);
  const [loadingPreviewSlug, setLoadingPreviewSlug] = useState(null);
  const previewAudioRef = useRef(null);
  const generatedAudioRef = useRef(null);
  const maxChars = 5000;
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
    voicesApi
      .list()
      .then((data) => {
        const list = data.voices || [];
        setVoices(list);
        if (list.length) setSelectedSlug(list[0].slug || list[0].id);
      })
      .catch(() => toast.error("Could not load voices."));
  }, []);

  const speedLabel = useMemo(() => `${speed.toFixed(1)}x`, [speed]);
  const stabilityLabel = useMemo(() => `${stability}%`, [stability]);
  const selectedVoice = voices.find((v) => (v.slug || v.id) === selectedSlug);

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
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        <header className="hidden lg:flex h-20 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
               <Mic className="size-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Voice Studio</h2>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" className="rounded-full text-on-surface-variant hover:text-white" onClick={() => setText("")}>
               <Trash2 className="size-4 mr-2" />
               Clear
             </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 max-w-container-max mx-auto w-full">

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Script Input */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            <div className="flex items-center justify-between">
               <div>
                 <h1 className="text-3xl font-bold tracking-tight">Generate Audio</h1>
                 <p className="text-neutral-400 mt-1">Transform your script into high-fidelity speech.</p>
               </div>
               <Button variant="outline" size="sm" className="hidden sm:flex border-white/5 bg-white/5 rounded-full" onClick={() => setText("")}>
                 <Trash2 className="size-4 mr-2" />
                 Clear Script
               </Button>
            </div>

            <div className="glass-panel overflow-hidden border-white/10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                   <Settings2 className="size-4 text-blue-500" />
                   <span>Text Input</span>
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  {count.toLocaleString()} / {maxChars.toLocaleString()}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                className="w-full min-h-[400px] bg-transparent p-6 text-lg leading-relaxed text-neutral-200 outline-none placeholder:text-neutral-600 resize-none"
                placeholder="Paste your script here... For better results, use punctuation and paragraph breaks."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass-panel p-6 border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">Generation Speed</label>
                    <span className="text-xs font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{speedLabel}</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <p className="text-[11px] text-neutral-500">Faster speeds may slightly impact naturalness.</p>
               </div>
               
               <div className="glass-panel p-6 border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">Stability</label>
                    <span className="text-xs font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{stabilityLabel}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={stability}
                    onChange={(e) => setStability(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <p className="text-[11px] text-neutral-500">Higher values produce more consistent but less expressive speech.</p>
               </div>
            </div>
          </div>

          {/* Hidden audio element for voice previews */}
          <audio
            ref={previewAudioRef}
            onEnded={() => setPreviewingSlug(null)}
            className="hidden"
          />

          {/* Right Column: Voice Selection & Action (Sticky on Desktop) */}
          <div className="w-full lg:w-[400px] lg:sticky lg:top-[100px] space-y-6">
            <div className="glass-panel flex flex-col border-white/10 h-full max-h-[700px]">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h3 className="font-bold">Select Voice</h3>
                <History className="size-4 text-neutral-500 cursor-pointer hover:text-white transition-colors" />
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {["free", "pro"].map((tier) => {
                  const tierVoices = voices.filter(v => (v.tier || "free") === tier);
                  if (!tierVoices.length) return null;
                  return (
                    <div key={tier} className="mb-4">
                      {/* Section header */}
                      <div className={`flex items-center gap-2 px-1 mb-2 ${
                        tier === "free" ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {tier === "free" ? (
                          <Zap className="size-3.5 fill-current" />
                        ) : (
                          <Crown className="size-3.5 fill-current" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {tier === "free" ? "Free — Edge TTS" : "Pro — xAI Grok TTS"}
                        </span>
                        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          tier === "free"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}>
                          {tierVoices.length} voices
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {tierVoices.map((v) => {
                          const slug = v.slug || v.id;
                          const isSelected = selectedSlug === slug;
                          return (
                          <button
                            key={slug}
                            onClick={() => setSelectedSlug(slug)}
                            className={`group w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                              isSelected
                              ? tier === "free"
                                ? "bg-emerald-600/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                                : "bg-amber-600/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                              : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-white/10">
                                {v.img ? (
                                  <Image src={v.img} alt={v.name} fill className="object-cover" />
                                ) : (
                                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                                    {v.name?.[0] || "V"}
                                  </div>
                                )}
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-sm font-bold">{v.name}</h4>
                                  <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                                    tier === "free"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-amber-500/20 text-amber-400"
                                  }`}>
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
                              <div className={`size-2 rounded-full ${
                                tier === "free"
                                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                                  : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                              }`} />
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handlePreview(slug, e)}
                                disabled={loadingPreviewSlug === slug}
                                className="size-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-60"
                                aria-label={`Preview ${v.name}`}
                              >
                                {loadingPreviewSlug === slug ? (
                                  <Loader2 className="size-3.5 text-primary animate-spin" />
                                ) : previewingSlug === slug ? (
                                  <Pause className="size-3.5 text-primary fill-current" />
                                ) : (
                                  <Play className="size-3.5 text-neutral-400 fill-current" />
                                )}
                              </button>
                            )}
                          </button>
                        )})}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.01] space-y-4">
                <Button 
                  className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xl shadow-blue-900/20 group"
                  onClick={handleGenerate}
                  disabled={!text || !selectedSlug || generating}
                >
                  <Bolt className="size-5 mr-2 fill-current" />
                  {generating ? "Generating..." : "Generate Audio"}
                </Button>
                {lastAudioUrl && (
                  <audio ref={generatedAudioRef} controls src={lastAudioUrl} autoPlay className="w-full rounded-lg" />
                )}
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                   <Info className="size-3" />
                   <span>Estimated cost: {count} characters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </>
  );
}

