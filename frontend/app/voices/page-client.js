"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { voicesApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Play, Pause, Search, Loader2, Zap, Crown, ChevronLeft, ChevronRight, Globe, Users, SlidersHorizontal, X, Star, Pointer } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

function getVoiceDisplay(v) {
  // Prefer backend-provided rebrand-safe fields (displayTier/displayName/quality)
  if (v.displayTier && v.displayName) {
    const dt = v.displayTier;
    const q = v.quality || (dt === "free" ? "Basic" : dt === "pro" ? "Enhanced" : "Studio");
    const isStudio = q === "Studio";
    const isEnhanced = q === "Enhanced";
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
  // Fallback (legacy data without display fields yet)
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

const LANGUAGES = [
  "All Languages","Multilingual","English","Chinese","Japanese","Korean",
  "Spanish","Portuguese","French","German","Italian","Russian","Arabic",
  "Hindi","Dutch","Swedish","Norwegian","Danish","Finnish","Polish",
  "Turkish","Greek","Czech","Hungarian","Romanian","Ukrainian","Vietnamese",
  "Thai","Indonesian","Hebrew","Catalan","Slovak","Slovenian","Croatian",
  "Serbian","Bulgarian",
];

function VoiceCard({ v, playingSlug, loadingSlug, onPlay, onSelect }) {
  const slug = v.slug || v.id;
  const isPlaying = playingSlug === slug;
  const isLoading = loadingSlug === slug;
  const display = getVoiceDisplay(v);
  const isCore = v.isCoreVoice;

  return (
    <div className="glass-card group relative flex flex-col gap-3 p-4 hover:bg-white/[0.04] transition-all rounded-2xl border border-white/5">
      {/* Header row */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="size-11 shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">
          {v.name?.[0] || "V"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold truncate">{v.name}</h3>
            <span className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
              display.badgeClass
            )}>
              {display.icon}
              {display.planLabel}
            </span>
            {display.quality && (
              <span className={cn("text-[9px] px-1 py-0.5 rounded font-bold ml-0.5", 
                display.quality === "Studio" ? "bg-fuchsia-500/20 text-fuchsia-400" : 
                display.quality === "Enhanced" ? "bg-violet-500/20 text-violet-400" : "bg-emerald-500/20 text-emerald-400")}>
                {display.quality}
              </span>
            )}
            {isCore && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-amber-500/15 text-amber-400 border-amber-500/30">
                <Star className="size-2.5 fill-current" /> Core
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 truncate mt-0.5">
            {v.gender && `${v.gender} · `}{v.country || v.accent || (v.languages?.[0] ?? "")}
          </p>
        </div>
        {/* Preview button */}
        <button
          type="button"
          onClick={(e) => onPlay(slug, e)}
          disabled={isLoading}
          className={cn(
            "size-9 shrink-0 rounded-full flex items-center justify-center border transition-all active:scale-95",
            isPlaying
              ? "bg-primary border-primary text-on-primary shadow-md shadow-primary/25"
              : "bg-white/5 border-white/10 text-white hover:bg-primary hover:border-primary hover:shadow-md hover:shadow-primary/25 disabled:opacity-40"
          )}
          aria-label={`Preview ${v.name}`}
        >
          {isLoading ? <Loader2 className="size-3.5 animate-spin" />
            : isPlaying ? <Pause className="size-3.5 fill-current" />
            : <Play className="size-3.5 fill-current" />}
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-neutral-400">
        {v.languages?.[0] && <span>{v.languages[0]}</span>}
        {v.accent && <span>{v.accent}</span>}
        {v.country && <span>{v.country}</span>}
        {v.age && <span>{v.age}</span>}
        {v.style && <span>{v.style}</span>}
      </div>

      {/* Tags */}
      {(v.tags?.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {v.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-[10px] text-neutral-400 font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-auto pt-2 border-t border-white/5 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => onPlay(slug, e)}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white py-1.5 text-[10px] font-bold transition-all disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="size-3 animate-spin" />
            : isPlaying ? <Pause className="size-3 fill-current" />
            : <Play className="size-3 fill-current" />}
          Preview
        </button>
        <button
          type="button"
          onClick={() => onSelect(slug)}
          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary py-1.5 text-[10px] font-bold transition-all"
        >
          <Pointer className="size-3" /> Select
        </button>
      </div>
    </div>
  );
}

export default function VoicesPage() {
  const router = useRouter();
  const [allVoices, setAllVoices] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [tier, setTier]           = useState("all");
  const [voiceTab, setVoiceTab] = useState("all"); // All / free / pro / premium / my-clones (user-facing VoiceForge tiers only)
  const [providerFilter, setProviderFilter] = useState("all"); // legacy compat
  const [gender, setGender]       = useState("all");
  const [language, setLanguage]   = useState("All Languages");
  const [country, setCountry]     = useState("");
  const [age, setAge]             = useState("");
  const [coreOnly, setCoreOnly]   = useState(false);
  const [englishOnly, setEnglishOnly] = useState(false);
  const [multilingualOnly, setMultilingualOnly] = useState(false);
  const [page, setPage]           = useState(1);
  const [playingSlug, setPlayingSlug]   = useState(null);
  const [loadingSlug, setLoadingSlug]   = useState(null);
  const audioRef = useRef(null);

  // Load voices (re-fetch when tab changes). voiceTab uses user-facing names (free/pro/premium),
  // mapped here to internal provider filters only (never shown in UI).
  useEffect(() => {
    setLoading(true);
    const params = {};
    let useSkipAuth = true;
    if (voiceTab === "my-clones") {
      params.provider = "my-clones";
      useSkipAuth = false; // send token so backend can filter owner
    } else if (voiceTab === "pro") {
      params.provider = "xai"; // internal: maps to VoiceForge Pro tier
    } else if (voiceTab === "premium") {
      params.provider = "elevenlabs"; // internal: maps to VoiceForge Premium tier
    } else if (voiceTab !== "all") {
      params.provider = voiceTab; // free
    }
    voicesApi.list(params, { skipAuth: useSkipAuth })
      .then((data) => setAllVoices(data.voices || []))
      .catch((e) => {
        if (voiceTab === "my-clones") {
          // likely not logged in
          setAllVoices([]);
          toast.info("Sign in to view your cloned voices.");
        } else {
          toast.error("Could not load voices.");
        }
      })
      .finally(() => setLoading(false));
  }, [voiceTab]);

  // When switching to Pro/Premium/My Clones tabs, auto-clear filters that would hide those voices.
  // This ensures the tab always shows its voices. (internal mapping only)
  useEffect(() => {
    if (voiceTab === "pro" || voiceTab === "premium" || voiceTab === "my-clones") {
      setTier("all");
      if (voiceTab === "premium" || voiceTab === "pro") {
        setCoreOnly(false);
        setEnglishOnly(false);
        setMultilingualOnly(false);
        setLanguage("All Languages");
      }
    }
  }, [voiceTab]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, tier, voiceTab, providerFilter, gender, language, country, age, coreOnly, englishOnly, multilingualOnly]);

  // Client-side filtering (primary driven by voiceTab which already server-filtered for providers)
  // Use displayTier when available for user-facing logic; fall back to legacy for old data.
  const filtered = useMemo(() => {
    return allVoices.filter((v) => {
      if (tier !== "all" && voiceTab !== "pro" && voiceTab !== "premium" && voiceTab !== "my-clones" && v.tier !== tier) return false;
      // voiceTab already applied via server query; keep light client filter for legacy providerFilter
      // also map new user-facing to internal for compat (these strings are never rendered)
      if (providerFilter !== "all") {
        const dt = v.displayTier || null;
        if (providerFilter === "pro" && dt && dt !== "pro") return false;
        if (providerFilter === "premium" && dt && dt !== "premium") return false;
        if (providerFilter === "free" && dt && dt !== "free") return false;
        if (!dt) {
          // legacy fallback only
          const vProv = (v.provider || v.source || "").toLowerCase();
          if (providerFilter === "pro" && !["xai", "pro"].includes(vProv)) return false;
          if (providerFilter === "premium" && !["elevenlabs", "professional", "voiceforge-premium"].includes(vProv)) return false;
          if (providerFilter === "free" && !["free", "edge"].includes(vProv)) return false;
        }
      }
      if (gender !== "all" && (v.gender || "").toLowerCase() !== gender) return false;
      if (language !== "All Languages") {
        const langs = v.languages || [];
        const accent = v.accent || "";
        const matches =
          langs.some((l) => l.toLowerCase().includes(language.toLowerCase())) ||
          accent.toLowerCase().includes(language.toLowerCase());
        if (!matches) return false;
      }
      if (country && !(v.country || "").toLowerCase().includes(country.toLowerCase())) return false;
      if (age && !(v.age || "").toLowerCase().includes(age.toLowerCase())) return false;
      if (coreOnly && !v.isCoreVoice) return false;
      if (englishOnly) {
        const langs = (v.languages || []).map((l) => l.toLowerCase());
        if (!langs.includes("english")) return false;
      }
      if (multilingualOnly) {
        const langs = (v.languages || []).map((l) => l.toLowerCase());
        if (!langs.includes("multilingual") && langs.length < 3) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          v.name?.toLowerCase().includes(q) ||
          v.accent?.toLowerCase().includes(q) ||
          v.country?.toLowerCase().includes(q) ||
          v.style?.toLowerCase().includes(q) ||
          (v.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (v.languages || []).some((l) => l.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allVoices, tier, voiceTab, providerFilter, gender, language, search, country, age, coreOnly, englishOnly, multilingualOnly]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters =
    voiceTab !== "all" || tier !== "all" || gender !== "all" || language !== "All Languages" ||
    search || country || age || coreOnly || englishOnly || multilingualOnly;

  function clearFilters() {
    setTier("all");
    setGender("all");
    setLanguage("All Languages");
    setSearch("");
    setCountry("");
    setAge("");
    setCoreOnly(false);
    setEnglishOnly(false);
    setMultilingualOnly(false);
    setProviderFilter("all");
    setVoiceTab("all");
  }

  function handleSelect(slug) {
    router.push(`/studio?voice=${slug}`);
  }

  async function handlePlay(slug, e) {
    e.preventDefault();
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playingSlug === slug) { audio.pause(); setPlayingSlug(null); return; }
    if (loadingSlug === slug) return;
    audio.pause(); setPlayingSlug(null); setLoadingSlug(slug);
    try {
      const data = await voicesApi.preview(slug);
      await new Promise((resolve, reject) => {
        const ok   = () => { audio.removeEventListener("canplay", ok); audio.removeEventListener("error", fail); resolve(); };
        const fail = (err) => { audio.removeEventListener("canplay", ok); audio.removeEventListener("error", fail); reject(err); };
        audio.addEventListener("canplay", ok);
        audio.addEventListener("error", fail);
        audio.src = data.url; audio.load();
      });
      setLoadingSlug(null); setPlayingSlug(slug);
      await audio.play();
    } catch (err) {
      setLoadingSlug(null); setPlayingSlug(null);
      toast.error(err?.status === 429 ? "Too many requests." : "Could not play preview.");
    }
  }

  return (
    <>
      <header className="hidden lg:flex h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-30 items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-xl border border-primary/20">
            <Globe className="size-4" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-white">Voice Library</h2>
        </div>
        <span className="text-xs text-neutral-500 font-medium">{allVoices.length} voices</span>
      </header>

      <audio ref={audioRef} onEnded={() => setPlayingSlug(null)} className="hidden" playsInline preload="none" />

      <main className="max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-16 space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Voice Library</h1>
            <p className="text-sm text-neutral-400 mt-1">
              {allVoices.length}+ studio-quality AI voices across {LANGUAGES.length - 1} languages
            </p>
          </div>
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, language…"
              className="w-full bg-white/5 border border-white/10 rounded-2xl h-10 pl-10 pr-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-4 text-neutral-500 shrink-0" />

          {/* Tier — user facing VoiceForge plan tiers */}
          {[{k:"all",l:"All"},{k:"free",l:"VoiceForge Free"},{k:"pro",l:"VoiceForge Pro"}].map(({k,l}) => (
            <button key={k} onClick={() => setTier(k)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                tier === k
                  ? k === "free" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : k === "pro"  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
              )}>
              {k === "free" && <Zap className="size-3 fill-current" />}
              {k === "pro"  && <Crown className="size-3 fill-current" />}
              {l}
            </button>
          ))}

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* User-facing filters - VoiceForge plans only, no provider names */}
          {[
            {k:"all", l:"All Voices"},
            {k:"free", l:"VoiceForge Free"},
            {k:"pro", l:"VoiceForge Pro"},
            {k:"premium", l:"VoiceForge Premium"},
            {k:"my-clones", l:"My Cloned Voices"},
          ].map(({k,l}) => (
            <button key={k} onClick={() => setVoiceTab(k)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                voiceTab === k
                  ? k === "free" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                    : k === "pro" ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                    : k === "premium" ? "bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-400"
                    : k === "my-clones" ? "bg-sky-500/15 border-sky-500/40 text-sky-400"
                    : "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
              )}>
              {l}
            </button>
          ))}

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Gender */}
          {[{k:"all",l:"Any Gender"},{k:"male",l:"Male"},{k:"female",l:"Female"}].map(({k,l}) => (
            <button key={k} onClick={() => setGender(k)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                gender === k
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
              )}>
              {k !== "all" && <Users className="size-3" />}
              {l}
            </button>
          ))}

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Language dropdown */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs font-bold text-neutral-300 outline-none focus:border-primary/40 cursor-pointer hover:border-white/20 transition-all"
          >
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Country filter */}
          <input
            type="text"
            placeholder="Country…"
            className="w-28 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs font-bold text-neutral-300 outline-none focus:border-primary/40 transition-all placeholder:text-neutral-500"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          {/* Age filter */}
          <input
            type="text"
            placeholder="Age…"
            className="w-24 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs font-bold text-neutral-300 outline-none focus:border-primary/40 transition-all placeholder:text-neutral-500"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Core Voices only */}
          <button onClick={() => setCoreOnly((v) => !v)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
              coreOnly
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                : "bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
            )}>
            <Star className="size-3" /> Core Voices
          </button>

          {/* English only */}
          <button onClick={() => setEnglishOnly((v) => !v)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
              englishOnly
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
            )}>
            <Globe className="size-3" /> English
          </button>

          {/* Multilingual only */}
          <button onClick={() => setMultilingualOnly((v) => !v)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
              multilingualOnly
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
            )}>
            <Globe className="size-3" /> Multilingual
          </button>

          {/* Clear filters */}
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all ml-auto">
              <X className="size-3" /> Clear filters
            </button>
          )}

          <span className={cn("text-xs text-neutral-500 font-medium", hasFilters ? "" : "ml-auto")}>
            {filtered.length} voice{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Recommended Voices — only when no filters */}
        {!loading && !hasFilters && (
          (() => {
            const coreVoices = allVoices.filter((v) => v.isCoreVoice);
            if (coreVoices.length === 0) return null;
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-amber-400 fill-amber-400" />
                  <h2 className="text-sm font-bold text-white tracking-tight">Recommended Voices</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {coreVoices.map((v) => (
                    <VoiceCard
                      key={v.slug || v.id}
                      v={v}
                      playingSlug={playingSlug}
                      loadingSlug={loadingSlug}
                      onPlay={handlePlay}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>
            );
          })()
        )}

        {/* All Voices Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center glass-panel rounded-2xl border-white/5">
            <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <Globe className="size-7 text-neutral-600" />
            </div>
            <p className="text-white font-semibold">No voices found</p>
            <p className="text-neutral-500 text-sm">Try adjusting your filters.</p>
            <button onClick={clearFilters} className="mt-1 text-xs text-primary underline">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((v) => (
              <VoiceCard
                key={v.slug || v.id}
                v={v}
                playingSlug={playingSlug}
                loadingSlug={loadingSlug}
                onPlay={handlePlay}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-neutral-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="size-8 rounded-xl flex items-center justify-center border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p;
                if (totalPages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else p = page - 3 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "size-8 rounded-xl text-xs font-bold border transition-all",
                      p === page
                        ? "bg-primary border-primary text-on-primary"
                        : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="size-8 rounded-xl flex items-center justify-center border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
          </div>
        )}
      </main>
    </>
  );
}
