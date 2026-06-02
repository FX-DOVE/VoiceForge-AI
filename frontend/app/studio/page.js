"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bolt, Play, Pause, Loader2, Settings2, Trash2, History, Mic, Crown, Zap, Shield, Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { voicesApi, ttsApi, cloningApi, adminApi } from "@/lib/api";
import { getMediaUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/client";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { useUsage } from "@/hooks/use-usage";

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
  const [generationProgress, setGenerationProgress] = useState(null); // { elapsed: number, message: string }
  const [lastAudioUrl, setLastAudioUrl] = useState(null);
  const [previewingSlug, setPreviewingSlug] = useState(null);
  const [loadingPreviewSlug, setLoadingPreviewSlug] = useState(null);
  const previewAudioRef = useRef(null);
  const generatedAudioRef = useRef(null);
  const [billingProfiles, setBillingProfiles] = useState({ xai: {creditsPerCharacter: 2}, elevenlabs: {creditsPerCharacter: 7} });

  const { usage } = useUsage();
  const isPremiumUser = usage?.plan === "professional" || !!usage?.professional?.isPremiumUser;

  function getVoiceDisplay(v) {
    // Prefer authoritative rebrand-safe fields from backend (displayTier / displayName / quality)
    if (v && v.displayTier && v.displayName) {
      const dt = v.displayTier;
      const q = v.quality || (dt === "free" ? "Basic" : dt === "pro" ? "Enhanced" : "Studio");
      const isStudio = q === "Studio";
      return {
        planLabel: v.displayName,
        quality: q,
        badgeClass: dt === "free"
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : dt === "pro"
            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
            : (isStudio ? "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30" : "bg-violet-500/15 text-violet-400 border-violet-500/30"),
        icon: <Crown className="size-2.5 fill-current" />,
        costLabel: dt === "premium" ? (isStudio ? "HIGH" : "MED") : (dt === "pro" ? "LOW" : ""),
      };
    }
    // Legacy fallback
    const tier = (v.tier || "free").toLowerCase();
    const prov = (v.provider || v.source || "").toLowerCase();
    const costTier = (v.costTier || "").toLowerCase();
    const model = (v.model || "").toLowerCase();
    const hasElId = !!v.elevenlabsVoiceId;

    const isFree = tier === "free" || prov === "free";
    const isXai = prov === "xai" || (!hasElId && tier === "pro");
    const isEl = hasElId || prov === "elevenlabs" || prov === "professional";

    if (isFree) {
      return {
        planLabel: "VoiceForge Free",
        quality: "Basic",
        badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        icon: <Zap className="size-2.5 fill-current" />,
        costLabel: "",
      };
    }
    if (isXai) {
      return {
        planLabel: "VoiceForge Pro",
        quality: "Enhanced",
        badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        icon: <Crown className="size-2.5 fill-current" />,
        costLabel: costTier === "low" ? "LOW" : "",
      };
    }
    const isHigh = costTier === "high" || model.includes("v3") || model.includes("premium");
    return {
      planLabel: "VoiceForge Premium",
      quality: isHigh ? "Studio" : "Enhanced",
      badgeClass: isHigh 
        ? "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30"
        : "bg-violet-500/15 text-violet-400 border-violet-500/30",
      icon: <Crown className="size-2.5 fill-current" />,
      costLabel: isHigh ? "HIGH" : "MED",
    };
  }

  // Custom generated audio player state (replaces native controls)
  const [isGeneratedPlaying, setIsGeneratedPlaying] = useState(false);
  const [generatedCurrentTime, setGeneratedCurrentTime] = useState(0);
  const [generatedDuration, setGeneratedDuration] = useState(0);
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

  // Load billing profiles using new method for dynamic cost preview per provider
  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.billingSettings();
        if (data) {
          const prof = data.elevenlabs || data.professional || {creditsPerCharacter: 7};
          setBillingProfiles({ xai: {creditsPerCharacter: 2}, elevenlabs: prof });
        }
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    const urlVoice = searchParams?.get("voice");
    // Fetch all (backend gates based on user plan using new professional logic), client filters by provider
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
        else {
          const sv = stockList.find(s => (s.slug || s.id) === urlVoice);
          if (sv) {
            const dt = sv.displayTier || null;
            const p = (sv.provider || sv.source || '').toLowerCase();
            if (dt === 'pro' || (!dt && (p === 'xai' || (sv.tier === 'pro' && !sv.elevenlabsVoiceId)))) setVoiceFilter('pro');
            else if (dt === 'premium' || (!dt && (p === 'elevenlabs' || sv.elevenlabsVoiceId))) setVoiceFilter('premium');
            else setVoiceFilter('free');
          }
        }
      } else if (stockList.length) {
        setSelectedSlug(stockList[0].slug || stockList[0].id);
      }
    });
  }, [searchParams]);

  const speedLabel = useMemo(() => `${speed.toFixed(1)}x`, [speed]);
  const stabilityLabel = useMemo(() => `${stability}%`, [stability]);

  const allVoices = useMemo(() => [...voices, ...clonedVoices], [voices, clonedVoices]);
  const selectedVoice = allVoices.find((v) => (v.slug || v.id) === selectedSlug);

  async function pollGenerationUntilReady(generationId, maxAttempts = 45) {
    const startTime = Date.now();
    const estimatedSeconds = Math.max(25, Math.round((8000 / 8000) * 55)); // rough heuristic

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setGenerationProgress({
        elapsed,
        message: `Generating long audio... ${elapsed}s elapsed`,
      });

      await new Promise((r) => setTimeout(r, 2600));

      try {
        const { generation } = await ttsApi.get(generationId);

        if (generation.status === "completed") {
          setGenerationProgress(null);
          const url = getMediaUrl(generation.playbackUrl || generation.audioUrl);
          setLastAudioUrl(url);
          toast.success("Long audio generated successfully!");
          setTimeout(() => {
            generatedAudioRef.current?.play().catch(() => {});
          }, 80);
          return true;
        }

        if (generation.status === "failed") {
          setGenerationProgress(null);
          toast.error(generation.errorMessage || "Generation failed.");
          return false;
        }
      } catch (e) {
        console.warn("[TTS Poll] temporary error", e);
      }
    }

    setGenerationProgress(null);
    toast.error("Still generating. Check History page for updates.");
    return false;
  }

  async function handleGenerate() {
    if (!text.trim() || !selectedSlug) return;

    const sel = allVoices.find(v => (v.slug || v.id) === selectedSlug);
    const dt = sel?.displayTier || null;
    const p = (sel?.provider || sel?.source || "").toLowerCase();
    const isPremiumSel = dt === "premium" || (!dt && (p === "elevenlabs" || p === "professional") && !!sel?.elevenlabsVoiceId);
    if (isPremiumSel && !isPremiumUser) {
      toast.error("VoiceForge Premium voices are a Professional feature. Upgrade to unlock.");
      return;
    }

    setGenerating(true);

    try {
      const data = await ttsApi.generate({
        text,
        voiceSlug: selectedSlug,
        speed,
        stability: stability / 100,
      });

      const gen = data.generation;

      if (gen.status === "queued" || gen.status === "processing") {
        // Long generation — poll in background
        toast.info("Generating long audio... This may take 30–90 seconds.", { duration: 4000 });
        await pollGenerationUntilReady(gen.id);
      } else {
        // Fast path (short text)
        const url = getMediaUrl(gen.playbackUrl || gen.audioUrl);
        setLastAudioUrl(url);
        toast.success("Audio generated successfully.");
        setTimeout(() => {
          generatedAudioRef.current?.play().catch(() => {});
        }, 100);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Generation failed.");
    } finally {
      setGenerating(false);
      setGenerationProgress(null);
    }
  }

  // --- Custom Generated Audio Player Controls ---
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  function toggleGeneratedPlayback() {
    const audio = generatedAudioRef.current;
    if (!audio) return;
    if (isGeneratedPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }

  function seekGeneratedAudio(time) {
    const audio = generatedAudioRef.current;
    if (!audio) return;
    // Prefer live duration from the element to avoid stale state during initial load
    const dur = audio.duration && isFinite(audio.duration) ? audio.duration : generatedDuration;
    if (!dur) return;
    const newTime = Math.max(0, Math.min(time, dur));
    audio.currentTime = newTime;
    setGeneratedCurrentTime(newTime);
  }

  async function downloadGeneratedAudio() {
    if (!lastAudioUrl) return;

    try {
      // Robust cross-origin download using blob (prevents navigation to the MP3 URL)
      const res = await fetch(lastAudioUrl, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;

      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.download = `voiceforge-${ts}.mp3`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch (err) {
      console.error("[Download] failed", err);
      toast.error("Download failed. Trying fallback...");

      // Fallback to direct link (may still navigate on some cross-origin setups)
      const a = document.createElement("a");
      a.href = lastAudioUrl;
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.download = `voiceforge-${ts}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  // Wire up the audio element events for the custom player
  useEffect(() => {
    const audio = generatedAudioRef.current;
    if (!audio || !lastAudioUrl) return;

    // Reset state for new audio
    setIsGeneratedPlaying(false);
    setGeneratedCurrentTime(0);
    setGeneratedDuration(0);

    const handleTimeUpdate = () => {
      setGeneratedCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setGeneratedDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsGeneratedPlaying(false);
      // optionally reset to start: setGeneratedCurrentTime(0);
    };

    const handlePlay = () => setIsGeneratedPlaying(true);
    const handlePause = () => setIsGeneratedPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // If metadata already available (e.g. cached)
    if (audio.duration && isFinite(audio.duration)) {
      setGeneratedDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [lastAudioUrl]);

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

              {/* Filter tabs - user facing only, no provider names */}
              <div className="px-3 pt-3 pb-1 flex gap-1 shrink-0 flex-wrap">
                {[
                  { id: "all", label: "All" },
                  { id: "free", label: "VoiceForge Free" },
                  { id: "pro", label: "VoiceForge Pro" },
                  { id: "premium", label: isPremiumUser ? "VoiceForge Premium" : "VoiceForge Premium (Upgrade)" },
                  { id: "cloned", label: `My Clones${clonedVoices.length ? ` (${clonedVoices.length})` : ""}` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setVoiceFilter(f.id)}
                    className={cn(
                      "px-3 h-7 rounded-full text-[11px] font-bold transition-all flex items-center gap-1",
                      voiceFilter === f.id
                        ? "bg-primary text-on-primary"
                        : "bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-white"
                    )}

                  >
                    {f.id === "premium" && !isPremiumUser && <Lock className="size-3" />}
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar min-h-0">
                {/* Stock voices — VoiceForge Free + Pro + Premium (user-facing only) */}
                {["free", "pro", "premium"].map((tierOrProv) => {
                  if (voiceFilter === "cloned") return null;
                  if (voiceFilter !== "all" && voiceFilter !== tierOrProv) return null;

                  let tierVoices;
                  if (tierOrProv === "premium") {
                    if (!isPremiumUser) {
                      if (voiceFilter === "premium") {
                        // Show premium upgrade prompt when the Premium tab is selected for non-pro
                        return (
                          <div key={tierOrProv} className="mb-4 p-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 text-center">
                            <div className="flex justify-center mb-2">
                              <Crown className="size-6 text-violet-400" />
                            </div>
                            <div className="font-bold text-violet-300 text-sm">VoiceForge Premium</div>
                            <p className="text-[11px] text-violet-400/80 mt-1 leading-snug">
                              Access dozens of studio-quality voices across languages, ages, accents and countries.
                              Voice cloning also requires Premium.
                            </p>
                            <Button asChild size="sm" className="mt-3 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold">
                              <Link href="/checkout?plan=professional">
                                <Crown className="size-3 mr-1.5" /> Upgrade to VoiceForge Premium — $2.99/mo
                              </Link>
                            </Button>
                            <div className="mt-2 text-[10px] text-violet-500/60">Unlocks Studio voices + cloning. Credits still required for generation.</div>
                          </div>
                        );
                      }
                      return null; // hide in "All" for non-pro
                    }
                    // For premium users: show all real premium voices (VoiceForge Premium tier, based on internal EL)
                    tierVoices = voices.filter(v => {
                      const dt = v.displayTier || null;
                      const p = (v.provider || v.source || "").toLowerCase();
                      const hasRealElId = !!v.elevenlabsVoiceId;
                      if (dt) return dt === "premium";
                      return (p === "elevenlabs" || p === "professional") && hasRealElId;
                    });
                  } else if (tierOrProv === "pro") {
                    // pro stock = VoiceForge Pro tier
                    tierVoices = voices.filter(v => {
                      const dt = v.displayTier || null;
                      if (dt) return dt === "pro";
                      return (v.tier || "free") === "pro" && (v.provider || "xai") !== "elevenlabs" && (v.provider || "xai") !== "professional";
                    });
                  } else {
                    tierVoices = voices.filter(v => {
                      const dt = v.displayTier || null;
                      if (dt) return dt === "free";
                      return (v.tier || "free") === tierOrProv && (v.provider || "xai") !== "elevenlabs" && (v.provider || "xai") !== "professional";
                    });
                  }
                  if (!tierVoices.length) return null;
                  return (
                    <div key={tierOrProv} className="mb-4">
                      <div className={`flex items-center gap-2 px-1 mb-2 ${tierOrProv === "free" ? "text-emerald-400" : tierOrProv === "premium" ? "text-fuchsia-400" : "text-amber-400"}`}>
                        {tierOrProv === "free" ? <Zap className="size-3.5 fill-current" /> : <Crown className="size-3.5 fill-current" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {tierOrProv === "free" ? "VoiceForge Free" : tierOrProv === "premium" ? "VoiceForge Premium" : tierOrProv === "pro" ? "VoiceForge Pro" : "VoiceForge Pro"}
                        </span>
                        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tierOrProv === "free" ? "bg-emerald-500/15 text-emerald-400" : tierOrProv === "premium" ? "bg-fuchsia-500/15 text-fuchsia-400" : "bg-amber-500/15 text-amber-400"}`}>
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
                                  ? tierOrProv === "free" ? "bg-emerald-600/10 border-emerald-500/40" : tierOrProv === "premium" ? "bg-fuchsia-600/10 border-fuchsia-500/40" : "bg-amber-600/10 border-amber-500/40"
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
                                    {(() => {
                                      const d = getVoiceDisplay(v);
                                      return (
                                        <>
                                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${d.badgeClass}`}>
                                            {d.planLabel.replace("VoiceForge ", "")}
                                          </span>
                                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${d.quality === "Studio" ? "bg-fuchsia-500/20 text-fuchsia-400" : d.quality === "Enhanced" ? "bg-violet-500/20 text-violet-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                            {d.quality}
                                          </span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                  <div className="flex gap-1 mt-0.5">
                                    {(v.tags || []).slice(0, 2).map(tag => (
                                      <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {isSelected ? (
                                <div className={`size-2 rounded-full ${tierOrProv === "free" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : tierOrProv === "premium" ? "bg-fuchsia-400 shadow-[0_0_8px_#e879f9]" : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"}`} />
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
                      <span className="text-[10px] font-bold uppercase tracking-widest">MY CLONED (VoiceForge Premium)</span>
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
                {selectedSlug && (
                  <div className="text-[10px] text-center space-y-0.5 border border-white/10 rounded-xl p-2 bg-white/[0.015]">
                    {(() => {
                      const v = allVoices.find(vv => (vv.slug || vv.id) === selectedSlug) || selectedVoice;
                      const display = getVoiceDisplay(v);
                      const planLabel = display.planLabel;
                      const quality = display.quality;
                      const chars = count;
                      const cpc = quality === "Studio" ? 14 : planLabel.includes("Premium") ? 7 : planLabel.includes("Pro") ? 2 : 0 ;
                      const creditsReq = Math.ceil(chars * cpc);
                      return (
                        <>
                          <div className="text-[9px] text-neutral-500">{planLabel} · <span className={quality === 'Studio' ? 'text-fuchsia-400' : quality === 'Enhanced' ? 'text-violet-400' : 'text-emerald-400'}>{quality} Quality</span> · {chars.toLocaleString()} chars</div>
                          <div className="font-mono text-sm text-primary">{planLabel} Estimated Cost: {creditsReq.toLocaleString()} Credits</div>
                        </>
                      );
                    })()}
                  </div>
                )}
                <Button
                  className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-on-primary rounded-xl shadow-lg shadow-primary/20 group transition-all"
                  onClick={handleGenerate}
                  disabled={!text || !selectedSlug || generating}
                >
                  <Bolt className="size-4 mr-2 fill-current" />
                  {generating ? "Generating..." : "Generate Audio"}
                </Button>

                {/* Live progress for long generations */}
                {generating && generationProgress && (
                  <div className="text-center space-y-1.5 pt-1">
                    <div className="text-xs text-on-surface-variant font-medium">
                      {generationProgress.message}
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/70 transition-all duration-500"
                        style={{ width: `${Math.min(95, (generationProgress.elapsed / 70) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-on-surface-variant/70">Large requests run in the background</p>
                  </div>
                )}

                {lastAudioUrl && (
                  <>
                    {/* Hidden audio element — we control it with custom UI below */}
                    <audio
                      ref={generatedAudioRef}
                      src={lastAudioUrl}
                      playsInline
                      preload="none"
                      className="hidden"
                    />

                    {/* Custom audio player with timeline (no native 3-dot menu) */}
                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 rounded-2xl p-3">
                      {/* Play / Pause */}
                      <button
                        type="button"
                        onClick={toggleGeneratedPlayback}
                        className="size-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 active:scale-[0.985] transition-all shadow-sm shrink-0"
                        aria-label={isGeneratedPlaying ? "Pause" : "Play"}
                      >
                        {isGeneratedPlaying ? (
                          <Pause className="size-4 fill-current" />
                        ) : (
                          <Play className="size-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Timecode */}
                      <div className="font-mono text-[10px] text-neutral-400 tabular-nums w-[90px] shrink-0 select-none">
                        {formatTime(generatedCurrentTime)} / {formatTime(generatedDuration)}
                      </div>

                      {/* Clickable Timeline / Progress bar */}
                      <div
                        className="relative flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer group"
                        onClick={(e) => {
                          const audioEl = generatedAudioRef.current;
                          const dur = (audioEl?.duration && isFinite(audioEl.duration)) ? audioEl.duration : generatedDuration;
                          if (!dur) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = (e.clientX - rect.left) / rect.width;
                          seekGeneratedAudio(percent * dur);
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-75"
                          style={{
                            width: generatedDuration
                              ? `${Math.max(0, Math.min(100, (generatedCurrentTime / generatedDuration) * 100))}%`
                              : "0%",
                          }}
                        />
                        {/* Thumb (appears on hover) */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3 rounded-full bg-white shadow ring-1 ring-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{
                            left: generatedDuration
                              ? `${Math.max(0, Math.min(100, (generatedCurrentTime / generatedDuration) * 100))}%`
                              : "0%",
                          }}
                        />
                      </div>

                      {/* Download button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={downloadGeneratedAudio}
                        className="rounded-full text-on-surface-variant hover:text-primary hover:bg-white/10 shrink-0"
                        aria-label="Download audio"
                        title="Download MP3"
                      >
                        <Download className="size-4" />
                      </Button>
                    </div>
                  </>
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
