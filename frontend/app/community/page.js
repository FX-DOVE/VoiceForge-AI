"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Mic,
  Globe,
  Heart,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Users,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { studioVoices } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All", icon: Globe },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "new", label: "New", icon: Sparkles },
  { id: "favorites", label: "Favorites", icon: Heart },
];

export default function CommunityPage() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());

  const communityVoices = useMemo(() => {
    return studioVoices
      .filter((v) => v.type === "community" || ["luna", "marcus"].includes(v.id))
      .map((v, i) => ({
        ...v,
        type: "community",
        trending: i % 2 === 0,
        new: i === 0,
      }));
  }, []);

  const filtered = useMemo(() => {
    let items = communityVoices;
    if (filter === "trending") items = items.filter((v) => v.trending);
    if (filter === "new") items = items.filter((v) => v.new);
    if (filter === "favorites") items = items.filter((v) => favorites.has(v.id));
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          (v.description || "").toLowerCase().includes(q)
      );
    }
    return items;
  }, [communityVoices, filter, query, favorites]);

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <header className="hidden lg:flex shrink-0 items-center justify-between border-b border-outline-variant/30 px-8 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
            <Users className="size-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Community Voices</h2>
        </div>
        <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-on-primary">
          <Link href="/cloning">
            <Plus className="mr-2 size-4" />
            Share Your Voice
          </Link>
        </Button>
      </header>

      <div className="flex-1 max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
              Marketplace
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Voices shared by the community
            </h1>
            <p className="text-on-surface-variant max-w-2xl">
              Discover hand-tuned voices created and shared by fellow creators.
              Add your favourites to the studio with one click, or contribute
              your own.
            </p>
          </div>
          <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-on-primary h-12 px-6 self-start md:hidden">
            <Link href="/cloning">
              <Plus className="mr-2 size-4" />
              Share Yours
            </Link>
          </Button>
        </motion.div>

        {/* Filters + Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex p-1 rounded-full bg-white/5 border border-white/10 w-full md:w-fit overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 h-10 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                  filter === f.id
                    ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                    : "text-on-surface-variant hover:text-white"
                )}
              >
                <f.icon className="size-4" />
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search community voices..."
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Featured row */}
        {filter === "all" && !query && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Trending this week
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {communityVoices
                .filter((v) => v.trending)
                .slice(0, 3)
                .map((v, i) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel rounded-3xl border-white/5 p-6 flex flex-col gap-4 relative overflow-hidden"
                  >
                    <div className="absolute -top-12 -right-12 size-40 bg-primary/10 rounded-full blur-3xl -z-0" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="relative size-16 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                        <Image src={v.img} alt={v.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-base font-bold text-white truncate">
                          {v.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <Star className="size-3 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold text-white">{v.rating}</span>
                          <span>·</span>
                          <span>{v.usage}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant line-clamp-2">
                      {v.description}
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFavorite(v.id)}
                        className={cn(
                          "rounded-full text-xs font-bold",
                          favorites.has(v.id) && "text-red-400"
                        )}
                      >
                        <Heart
                          className={cn(
                            "mr-1.5 size-3.5",
                            favorites.has(v.id) && "fill-current"
                          )}
                        />
                        {favorites.has(v.id) ? "Saved" : "Save"}
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="rounded-full bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold"
                      >
                        <Link href={`/voices/${v.id}`}>
                          View
                          <ArrowRight className="ml-1.5 size-3" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="glass-panel p-10 sm:p-16 rounded-[2rem] border-white/5 flex flex-col items-center text-center gap-4">
            <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center text-on-surface-variant">
              <Mic className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No voices found</h3>
            <p className="text-on-surface-variant max-w-sm">
              {query
                ? `No community voices match "${query}".`
                : "Nothing here yet. Try a different filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-panel rounded-3xl border-white/5 overflow-hidden flex flex-col group hover:bg-white/[0.05] transition-all relative"
              >
                <Link href={`/voices/${v.id}`} className="relative aspect-[4/3] block overflow-hidden">
                  <Image
                    src={v.img}
                    alt={v.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {v.new && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-[10px] font-bold uppercase tracking-widest border border-green-500/30 backdrop-blur-md">
                      New
                    </span>
                  )}
                  {v.trending && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold uppercase tracking-widest border border-orange-500/30 backdrop-blur-md flex items-center gap-1">
                      <TrendingUp className="size-3" />
                      Trending
                    </span>
                  )}
                </Link>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/voices/${v.id}`}
                      className="text-base font-bold text-white truncate hover:text-primary transition-colors"
                    >
                      {v.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(v.id)}
                      className={cn(
                        "size-8 rounded-full flex items-center justify-center transition-colors",
                        favorites.has(v.id)
                          ? "bg-red-500/10 text-red-400"
                          : "bg-white/5 text-on-surface-variant hover:text-white"
                      )}
                      aria-label="Toggle favorite"
                    >
                      <Heart
                        className={cn(
                          "size-4",
                          favorites.has(v.id) && "fill-current"
                        )}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Star className="size-3 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-white">{v.rating}</span>
                    <span>·</span>
                    <span className="truncate">by {v.creator}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2 min-h-[2rem]">
                    {v.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {v.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
