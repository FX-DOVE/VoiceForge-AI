"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Search,
  Plus,
  Globe,
  Shield,
  Play,
  MoreVertical,
  Loader2,
  CheckCircle2,
  Trash2,
  Pencil,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VOICES = [
  {
    id: "1",
    name: "Narrator One",
    description: "Warm, neutral narrator for long-form content.",
    visibility: "private",
    status: "ready",
    progress: 100,
    samples: 6,
    duration: "4:32",
    createdAt: "Oct 24, 2026",
    tags: ["Narration", "Neutral"],
  },
  {
    id: "2",
    name: "Podcast Host",
    description: "Energetic, conversational male voice. Trained on 3min input.",
    visibility: "private",
    status: "training",
    progress: 65,
    samples: 4,
    duration: "3:14",
    createdAt: "Oct 22, 2026",
    tags: ["Podcast", "Casual"],
  },
  {
    id: "3",
    name: "Corporate Voice",
    description: "Professional female tone for brand work.",
    visibility: "public",
    status: "ready",
    progress: 100,
    samples: 8,
    duration: "6:45",
    createdAt: "Oct 18, 2026",
    tags: ["Corporate", "Professional"],
  },
  {
    id: "4",
    name: "Audiobook Reader",
    description: "Soft British accent, ideal for fiction reading.",
    visibility: "private",
    status: "ready",
    progress: 100,
    samples: 12,
    duration: "9:02",
    createdAt: "Oct 12, 2026",
    tags: ["British", "Audiobook"],
  },
  {
    id: "5",
    name: "Community Storyteller",
    description: "Playful tone shared with the VoiceForge community.",
    visibility: "public",
    status: "ready",
    progress: 100,
    samples: 5,
    duration: "5:20",
    createdAt: "Sep 30, 2026",
    tags: ["Storytelling", "Playful"],
  },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "private", label: "Private" },
  { id: "public", label: "Public" },
];

export default function ClonedVoicesLibraryPage() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const filteredVoices = useMemo(() => {
    return VOICES.filter((v) => {
      if (filter !== "all" && v.visibility !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [filter, query]);

  const counts = useMemo(
    () => ({
      all: VOICES.length,
      private: VOICES.filter((v) => v.visibility === "private").length,
      public: VOICES.filter((v) => v.visibility === "public").length,
    }),
    []
  );

  return (
    <>
      <header className="hidden lg:flex shrink-0 items-center justify-between border-b border-outline-variant/30 px-8 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
            <Mic className="size-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Cloned Voices</h2>
        </div>
        <Button
          className="rounded-full bg-primary hover:bg-primary/90 text-on-primary"
          asChild
        >
          <Link href="/cloning">
            <Plus className="mr-2 size-4" />
            Clone New Voice
          </Link>
        </Button>
      </header>

      <div className="flex-1 max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-8">
        {/* Page Header (mobile-friendly) */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              My Cloned Voices
            </h1>
            <p className="text-on-surface-variant max-w-2xl">
              Browse every voice you've cloned. Switch between your private library
              and voices you've shared with the community.
            </p>
          </div>
          <Button
            className="rounded-full bg-primary hover:bg-primary/90 text-on-primary h-12 px-6 self-start md:hidden"
            asChild
          >
            <Link href="/cloning">
              <Plus className="mr-2 size-4" />
              Clone New Voice
            </Link>
          </Button>
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex p-1 rounded-full bg-white/5 border border-white/10 w-full md:w-fit overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex-1 md:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 h-10 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                  filter === f.id
                    ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                    : "text-on-surface-variant hover:text-white"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    filter === f.id
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-on-surface-variant"
                  )}
                >
                  {counts[f.id]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
              placeholder="Search by name, description, or tag..."
            />
          </div>
        </div>

        {/* Grid */}
        {filteredVoices.length === 0 ? (
          <div className="glass-panel p-10 sm:p-16 rounded-[2rem] border-white/5 flex flex-col items-center text-center gap-4">
            <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center text-on-surface-variant">
              <Mic className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No voices found</h3>
            <p className="text-on-surface-variant max-w-sm">
              {query
                ? `No cloned voices match "${query}". Try a different search term.`
                : "You don't have any voices in this category yet. Clone a new one to get started."}
            </p>
            <Button
              className="mt-2 rounded-full bg-primary hover:bg-primary/90 text-on-primary h-12 px-6"
              asChild
            >
              <Link href="/cloning">
                <Plus className="mr-2 size-4" />
                Clone New Voice
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVoices.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-panel rounded-3xl border-white/5 bg-white/[0.02] p-6 flex flex-col gap-5 group hover:bg-white/[0.05] transition-all relative"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-12 rounded-2xl flex items-center justify-center shrink-0",
                        v.status === "ready"
                          ? "bg-primary/10 text-primary"
                          : "bg-orange-500/10 text-orange-400"
                      )}
                    >
                      <Mic className="size-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-base font-bold text-white truncate">
                        {v.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {v.visibility === "private" ? (
                          <Shield className="size-3" />
                        ) : (
                          <Globe className="size-3" />
                        )}
                        <span>{v.visibility}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(openMenuId === v.id ? null : v.id)
                      }
                      className="size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-white transition-colors"
                      aria-label="Voice actions"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {openMenuId === v.id && (
                      <div
                        className="absolute right-0 top-10 z-20 w-48 rounded-2xl border border-white/10 bg-surface-container/95 backdrop-blur-xl shadow-2xl p-1.5 flex flex-col"
                        onMouseLeave={() => setOpenMenuId(null)}
                      >
                        <button
                          type="button"
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/5"
                        >
                          <Pencil className="size-4" /> Rename
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/5"
                        >
                          <Share2 className="size-4" />
                          {v.visibility === "private"
                            ? "Make Public"
                            : "Make Private"}
                        </button>
                        <div className="my-1 h-px bg-white/5" />
                        <button
                          type="button"
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="size-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-on-surface-variant line-clamp-2 min-h-[2.5rem]">
                  {v.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {v.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Status / progress */}
                {v.status === "training" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2 text-orange-400">
                        <Loader2 className="size-3.5 animate-spin" />
                        Training
                      </span>
                      <span className="text-primary">{v.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500"
                        style={{ width: `${v.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                    <CheckCircle2 className="size-3.5" />
                    Ready to use
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5">
                  <div className="flex flex-col text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    <span>{v.samples} samples · {v.duration}</span>
                    <span className="text-on-surface-variant/70 mt-0.5 normal-case tracking-normal">
                      Created {v.createdAt}
                    </span>
                  </div>
                  <Button
                    type="button"
                    disabled={v.status !== "ready"}
                    className="h-10 px-5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary font-bold disabled:opacity-40"
                    asChild={v.status === "ready"}
                  >
                    {v.status === "ready" ? (
                      <Link href="/studio">
                        <Play className="mr-1.5 size-4 fill-current" />
                        Use
                      </Link>
                    ) : (
                      <>
                        <Play className="mr-1.5 size-4 fill-current" />
                        Use
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
