"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Heart,
  Share2,
  Star,
  Globe,
  Users,
  AudioLines,
  Mic,
  Sparkles,
  Languages,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { voicesApi } from "@/lib/api";
import { getMediaUrl } from "@/lib/api/config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SAMPLE_CLIPS = [
  { title: "Narration",      text: "The first travelers arrived at dawn, their footsteps echoing across the empty plaza." },
  { title: "Conversational", text: "Hey, did you check out the new release? I think you'll really like it." },
  { title: "Promotional",    text: "Introducing the next evolution in synthetic voice technology." },
  { title: "Emotional",      text: "After all these years, she still remembered the smell of jasmine on the porch." },
];

export default function VoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [voice, setVoice] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Audio playback state
  const audioRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingClip, setLoadingClip] = useState(null); // index | null
  const [playingClip, setPlayingClip] = useState(null); // index | null
  const [clipError, setClipError] = useState(null);    // index | null

  useEffect(() => {
    if (!id) return;
    Promise.all([voicesApi.get(id), voicesApi.list()])
      .then(([voiceData, listData]) => {
        const v = voiceData?.voice ?? voiceData;
        if (!v) { setNotFoundState(true); return; }
        setVoice(v);
        setRelated((listData?.voices || []).filter((r) => r.id !== id).slice(0, 3));
      })
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Stop audio when navigating away
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const handleClipPlay = useCallback(async (index) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Toggle off
    if (playingClip === index) {
      audio.pause();
      setPlayingClip(null);
      return;
    }

    // Deduplicate
    if (loadingClip === index) return;

    audio.pause();
    setPlayingClip(null);
    setClipError(null);
    setLoadingClip(index);

    try {
      // Fetch preview URL once and cache it; all clips share the same voice audio
      let url = previewUrl;
      if (!url) {
        const slug = voice?.slug || id;
        const data = await voicesApi.preview(slug);
        url = getMediaUrl(data?.url || data?.audioUrl || data);
        setPreviewUrl(url);
      }

      await new Promise((resolve, reject) => {
        const onReady = () => { audio.removeEventListener("canplay", onReady); audio.removeEventListener("error", onFail); resolve(); };
        const onFail  = () => { audio.removeEventListener("canplay", onReady); audio.removeEventListener("error", onFail); reject(new Error("Audio load failed")); };
        audio.addEventListener("canplay", onReady);
        audio.addEventListener("error", onFail);
        audio.src = url;
        audio.load();
      });

      setLoadingClip(null);
      setPlayingClip(index);
      await audio.play();
    } catch (err) {
      console.error("[VoiceDetail clip]", err);
      setLoadingClip(null);
      setClipError(index);
      toast.error("Could not play sample clip.");
      setTimeout(() => setClipError((p) => p === index ? null : p), 3000);
    }
  }, [id, voice, previewUrl, playingClip, loadingClip]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-on-surface-variant animate-pulse">Loading voice...</p>
      </div>
    );
  }

  if (notFoundState) notFound();

  return (
    <>
      <div className="flex-1 max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-8">
        {/* Breadcrumb */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-white transition-colors group w-fit"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to library
        </button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] border-white/5 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-12 relative overflow-hidden"
        >
          <div className="absolute -top-32 -right-32 size-96 bg-primary/10 rounded-full blur-[120px] -z-0" />

          {/* Avatar / Cover */}
          <div className="relative size-48 sm:size-64 lg:size-80 rounded-3xl overflow-hidden shrink-0 border border-white/10 shadow-2xl mx-auto lg:mx-0">
            {voice.img ? (
              <Image
                src={voice.img}
                alt={voice.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 80vw, 320px"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <Mic className="size-16 text-primary opacity-60" />
              </div>
            )}
            <button
              type="button"
              onClick={() => handleClipPlay(playingClip === 0 ? null : 0)}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              aria-label={playingClip !== null ? "Pause" : "Play sample"}
            >
              <span className="size-20 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl">
                {loadingClip === 0 ? (
                  <Loader2 className="size-8 animate-spin" />
                ) : playingClip !== null ? (
                  <Pause className="size-8 fill-current" />
                ) : (
                  <Play className="size-8 fill-current ml-1" />
                )}
              </span>
            </button>
            {voice.type === "community" && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest border border-purple-500/30 backdrop-blur-md">
                Community
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col gap-6 relative z-10">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {voice.tags.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                {voice.name}
              </h1>
              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                {voice.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-white">{voice.rating}</span>
                <span className="text-xs text-on-surface-variant">rating</span>
              </div>
              <div className="flex items-center gap-2">
                <AudioLines className="size-4 text-primary" />
                <span className="text-sm font-bold text-white">{voice.usage}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-on-surface-variant" />
                <span className="text-xs text-on-surface-variant">
                  by <span className="text-white font-bold">{voice.creator}</span>
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button
                asChild
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold shadow-[0_0_30px_rgba(59,130,246,0.2)]"
              >
                <Link href={`/studio?voice=${voice.id}`}>
                  <Sparkles className="mr-2 size-4" />
                  Use this voice
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFavorite((f) => !f)}
                className={cn(
                  "h-12 px-6 rounded-full border-white/10 hover:bg-white/5 font-bold",
                  isFavorite && "bg-red-500/10 border-red-500/30 text-red-400"
                )}
              >
                <Heart className={cn("mr-2 size-4", isFavorite && "fill-current")} />
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-12 px-6 rounded-full hover:bg-white/5 font-bold"
              >
                <Share2 className="mr-2 size-4" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Properties + Sample Clips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Properties */}
          <div className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-6 sm:p-8 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-white tracking-tight">Properties</h3>
            <div className="flex flex-col gap-4">
              {[
                { icon: Users, label: "Gender", value: voice.gender },
                { icon: Globe, label: "Accent", value: voice.accent },
                { icon: Mic, label: "Age", value: voice.age },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-b-0">
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <p.icon className="size-4" />
                    {p.label}
                  </div>
                  <span className="text-sm font-bold text-white">{p.value}</span>
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <Languages className="size-4" />
                  Languages
                </div>
                <div className="flex flex-wrap gap-2">
                  {voice.languages.map((l) => (
                    <span
                      key={l}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sample Clips */}
          <div className="lg:col-span-2 glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-lg font-bold text-white tracking-tight">Sample Clips</h3>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {SAMPLE_CLIPS.length} clips
              </span>
            </div>

            {/* Hidden audio element */}
            <audio ref={audioRef} onEnded={() => setPlayingClip(null)} className="hidden" />

            <div className="flex flex-col gap-3">
              {SAMPLE_CLIPS.map((clip, i) => {
                const isActive  = playingClip === i;
                const isLoading = loadingClip === i;
                const hasError  = clipError === i;
                return (
                  <button
                    type="button"
                    key={clip.title}
                    onClick={() => handleClipPlay(i)}
                    disabled={isLoading}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                      isActive
                        ? "bg-primary/10 border-primary/30"
                        : hasError
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5",
                      "disabled:opacity-60"
                    )}
                  >
                    <div
                      className={cn(
                        "size-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        isActive   ? "bg-primary text-on-primary" :
                        hasError   ? "bg-red-500/20 text-red-400" :
                        isLoading  ? "bg-white/10 text-white" :
                                     "bg-white/5 text-on-surface-variant"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : hasError ? (
                        <AlertCircle className="size-4" />
                      ) : isActive ? (
                        <Pause className="size-4 fill-current" />
                      ) : (
                        <Play className="size-4 fill-current ml-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{clip.title}</span>
                        {isActive && (
                          <span className="flex gap-0.5 items-end h-3">
                            {[0.6,1,0.7,0.9,0.5].map((h,k) => (
                              <motion.span
                                key={k}
                                className="w-0.5 rounded-full bg-primary"
                                animate={{ scaleY: [h, 1, h * 0.4, 0.9, h] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: k * 0.1 }}
                                style={{ height: "100%", transformOrigin: "bottom" }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-2">
                        &ldquo;{clip.text}&rdquo;
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Best for / Recommendations */}
        <div className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-6 sm:p-8 flex flex-col gap-5">
          <h3 className="text-lg font-bold text-white tracking-tight">Best for</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              "Audiobook narration",
              "Explainer videos",
              "Podcast intros",
              "Product demos",
            ].map((u) => (
              <div
                key={u}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <CheckCircle2 className="size-4 text-green-400 shrink-0" />
                <span className="text-sm text-white">{u}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related voices */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              You might also like
            </h3>
            <Button asChild variant="ghost" className="rounded-full text-primary font-bold">
              <Link href="/voices">
                Browse all voices
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((v) => (
              <Link
                key={v.id}
                href={`/voices/${v.id}`}
                className="glass-panel rounded-2xl border-white/5 p-5 flex items-center gap-4 hover:bg-white/5 transition-colors group"
              >
                <div className="relative size-16 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  {v.img ? (
                    <Image src={v.img} alt={v.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {v.name?.[0] || "V"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white truncate">{v.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {v.tags.join(" · ")}
                  </p>
                </div>
                <ArrowRight className="size-4 text-on-surface-variant group-hover:translate-x-1 group-hover:text-white transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
