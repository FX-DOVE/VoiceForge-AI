"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, notFound } from "next/navigation";
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
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { studioVoices, findVoiceById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const SAMPLE_CLIPS = [
  { title: "Narration", duration: "0:24", text: "The first travelers arrived at dawn, their footsteps echoing across the empty plaza." },
  { title: "Conversational", duration: "0:18", text: "Hey, did you check out the new release? I think you'll really like it." },
  { title: "Promotional", duration: "0:12", text: "Introducing the next evolution in synthetic voice technology." },
  { title: "Emotional", duration: "0:30", text: "After all these years, she still remembered the smell of jasmine on the porch." },
];

export default function VoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const voice = findVoiceById(id);
  const [activeClip, setActiveClip] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const related = useMemo(
    () =>
      studioVoices
        .filter((v) => v.id !== id)
        .slice(0, 3),
    [id]
  );

  if (!voice) {
    if (typeof window !== "undefined") {
      // graceful fallback while client-side routing
    }
    notFound();
  }

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
            <Image
              src={voice.img}
              alt={voice.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 80vw, 320px"
              priority
            />
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              aria-label={isPlaying ? "Pause sample" : "Play sample"}
            >
              <span className="size-20 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl">
                {isPlaying ? (
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
              <h3 className="text-lg font-bold text-white tracking-tight">
                Sample Clips
              </h3>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {SAMPLE_CLIPS.length} clips
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {SAMPLE_CLIPS.map((clip, i) => (
                <button
                  type="button"
                  key={clip.title}
                  onClick={() => {
                    setActiveClip(i);
                    setIsPlaying(true);
                  }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                    activeClip === i
                      ? "bg-primary/10 border-primary/30"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                  )}
                >
                  <div
                    className={cn(
                      "size-10 rounded-full flex items-center justify-center shrink-0",
                      activeClip === i
                        ? "bg-primary text-on-primary"
                        : "bg-white/5 text-on-surface-variant"
                    )}
                  >
                    {activeClip === i && isPlaying ? (
                      <Pause className="size-4 fill-current" />
                    ) : (
                      <Play className="size-4 fill-current ml-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{clip.title}</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">
                        {clip.duration}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      &ldquo;{clip.text}&rdquo;
                    </p>
                  </div>
                </button>
              ))}
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
                  <Image src={v.img} alt={v.name} fill className="object-cover" sizes="64px" />
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
