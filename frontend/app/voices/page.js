"use client";

import { useEffect, useRef, useState } from "react";
import { voicesApi } from "@/lib/api";
import Image from "next/image";
import { toast } from "sonner";
import { Play, Pause, Search, ArrowRight, Loader2, Zap, Crown } from "lucide-react";
import Link from "next/link";

const TIERS = [
  { key: "all", label: "All Voices" },
  { key: "free", label: "Free", icon: Zap, color: "text-emerald-400" },
  { key: "pro",  label: "Pro",  icon: Crown, color: "text-amber-400" },
];

export default function VoicesPage() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("all");
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingSlug, setPlayingSlug] = useState(null);
  const [loadingSlug, setLoadingSlug] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const params = { search };
    if (tier !== "all") params.tier = tier;
    voicesApi
      .list(params)
      .then((data) => setVoices(data.voices || []))
      .catch(() => toast.error("Could not load voices."))
      .finally(() => setLoading(false));
  }, [search, tier]);

  async function handlePlay(slug, e) {
    e.preventDefault();
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (playingSlug === slug) {
      audio.pause();
      setPlayingSlug(null);
      return;
    }

    audio.pause();
    setPlayingSlug(null);
    setLoadingSlug(slug);

    try {
      const data = await voicesApi.preview(slug);
      await new Promise((resolve, reject) => {
        const ok = () => { audio.removeEventListener("canplay", ok); audio.removeEventListener("error", fail); resolve(); };
        const fail = (err) => { audio.removeEventListener("canplay", ok); audio.removeEventListener("error", fail); reject(err); };
        audio.addEventListener("canplay", ok);
        audio.addEventListener("error", fail);
        audio.src = data.url;
        audio.load();
      });
      setLoadingSlug(null);
      setPlayingSlug(slug);
      await audio.play();
    } catch (err) {
      console.error("[VoiceLib preview]", err);
      setLoadingSlug(null);
      setPlayingSlug(null);
      toast.error("Could not play preview.");
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <audio ref={audioRef} onEnded={() => setPlayingSlug(null)} className="hidden" />

      <main className="flex-1 container-custom py-8 lg:py-12 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Voice Library</h1>
            <p className="text-neutral-400 mt-1">Explore our collection of studio-quality AI voices.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search voices or styles..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tier tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {TIERS.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setTier(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                tier === key
                  ? key === "free"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                    : key === "pro"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                    : "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
              }`}
            >
              {Icon && <Icon className={`size-3.5 fill-current ${tier === key ? color : ""}`} />}
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs text-neutral-500">{voices.length} voices</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {voices.map((v) => {
              const slug = v.slug || v.id;
              const isPlaying = playingSlug === slug;
              const isLoading = loadingSlug === slug;
              const isFree = (v.tier || "free") === "free";
              return (
                <Link
                  href={`/voices/${v.id}`}
                  key={slug}
                  className="glass-card group relative p-6 flex flex-col gap-4 hover:bg-white/[0.05] transition-all"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/5">
                    {v.img ? (
                      <Image
                        src={v.img}
                        alt={v.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl">
                        {v.name?.[0] || "V"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    {/* Tier badge */}
                    <span className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border ${
                      isFree
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}>
                      {isFree ? <Zap className="size-2.5 fill-current" /> : <Crown className="size-2.5 fill-current" />}
                      {isFree ? "Free" : "Pro"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold truncate">{v.name}</h3>
                      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-1">
                        {(v.tags || []).slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">{tag}</span>
                        ))}
                      </div>
                      {v.accent && (
                        <p className="text-[10px] text-neutral-600 mt-0.5">{v.accent}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handlePlay(slug, e)}
                      disabled={isLoading}
                      className={`size-11 shrink-0 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-lg border ${
                        isPlaying
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white/5 border-white/10 text-white hover:bg-blue-600 hover:border-blue-600"
                      } disabled:opacity-50`}
                      aria-label={`Play sample of ${v.name}`}
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="size-4 fill-current" />
                      ) : (
                        <Play className="size-4 fill-current" />
                      )}
                    </button>
                  </div>

                  <span className="w-full inline-flex items-center justify-center text-xs text-neutral-400 group-hover:text-blue-500 transition-colors font-bold">
                    View voice <ArrowRight className="ml-2 size-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && voices.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-neutral-500">No voices found{search ? ` matching "${search}"` : ""}.</p>
          </div>
        )}
      </main>
    </div>
  );
}
