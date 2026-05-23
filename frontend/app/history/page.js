"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Play, 
  Download, 
  MoreVertical, 
  Timer, 
  User,
  History as HistoryIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { useGenerations } from "@/hooks/use-generations";
import { GenerationDetailModal } from "@/components/history/generation-detail-modal";

export default function HistoryPage() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);
  const { items: generations, loading, remove, isRefreshing } = useGenerations(search);

  function handlePlayItem(item, e) {
    e.stopPropagation();
    if (!item.audioUrl) return;
    if (playingId === item.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = item.audioUrl;
      audioRef.current.play().then(() => setPlayingId(item.id)).catch(() => {});
    }
  }

  return (
    <>
      <header className="hidden lg:flex h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-30 items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3 text-white">
          <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-xl border border-primary/20">
            <HistoryIcon className="size-4" />
          </div>
          <h2 className="text-base font-bold tracking-tight">Generation History</h2>
          {isRefreshing && (
            <span className="ml-3 text-[11px] text-on-surface-variant/70 flex items-center gap-1">
              <span className="size-1.5 bg-primary rounded-full animate-pulse" /> updating
            </span>
          )}
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full pb-16">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input 
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50" 
              placeholder="Search generations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/5">
            <Filter className="mr-2 size-4" />
            Filters
          </Button>
        </div>

        <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />
        {/* History List */}
        <div className="flex flex-col gap-4">
          {loading && (
            <p className="text-on-surface-variant text-sm">Loading history...</p>
          )}
          {!loading && generations.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-center glass-panel rounded-2xl border-white/5">
            <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <HistoryIcon className="size-7 text-neutral-600" />
            </div>
            <p className="text-white font-semibold">No generations found</p>
            <p className="text-neutral-500 text-sm">{search ? `No results for "${search}"` : "Your generated audio will appear here."}</p>
          </div>
        )}
          {generations.map((item, i) => (
            <motion.div
              key={item.id || i}
              role="button"
              tabIndex={0}
              onClick={() => setSelected({ ...item, id: i })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected({ ...item, id: i });
                }
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "glass-card p-4 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 border-white/5 hover:bg-white/5 transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                item.status === "expired" && "opacity-50 grayscale"
              )}
            >
              <div className="flex items-start gap-4 lg:contents">
                <Button
                  className="size-12 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shrink-0"
                  variant="ghost"
                  disabled={item.status === "expired" || !item.audioUrl}
                  onClick={(e) => handlePlayItem(item, e)}
                >
                  {playingId === item.id ? (
                    <span className="size-5 flex items-center justify-center">
                      <span className="size-2 bg-current rounded-sm" />
                    </span>
                  ) : (
                    <Play className="size-5 fill-current" />
                  )}
                </Button>

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                   <p className="text-base sm:text-lg text-on-surface font-medium line-clamp-2 lg:truncate">"{item.text}"</p>
                   <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-on-surface-variant">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="size-4 shrink-0" />
                        <span className="truncate">{item.voice}</span>
                      </div>
                      <span className="opacity-30">•</span>
                      <span>{item.time}</span>
                      <span className="opacity-30">•</span>
                      <span>{item.duration}</span>
                      {item.processingTime && (item.rawStatus === "completed" || item.status === "neutral") && (
                        <>
                          <span className="opacity-30">•</span>
                          <span className="text-emerald-400/80">Generated in {item.processingTime}</span>
                        </>
                      )}
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                {/* Status Badge */}
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border",
                  item.status === "queued" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  item.status === "processing" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  item.status === "failed" && "bg-red-500/10 text-red-400 border-red-500/20",
                  item.status === "warning" && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                  item.status === "expired" && "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
                  (item.status === "neutral" || item.status === "completed") && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}>
                  {item.status === "queued" && "Queued"}
                  {item.status === "processing" && "Processing..."}
                  {item.status === "failed" && "Failed"}
                  {item.status === "warning" && item.expiry}
                  {item.status === "expired" && "Expired"}
                  {(item.status === "neutral" || item.status === "completed") && item.expiry}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10"
                    disabled={item.status === "expired" || (!item.downloadUrl && !item.audioUrl)}
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = item.downloadUrl || item.audioUrl;
                      if (!url) return;
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `voiceforge-${item.id || "audio"}.mp3`;
                      a.click();
                    }}
                  >
                    <Download className="size-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-on-surface-variant hover:bg-white/5" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="size-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <GenerationDetailModal
        open={!!selected}
        generation={selected}
        onClose={() => setSelected(null)}
        onDelete={(id) => { remove(id); setSelected(null); }}
      />
    </>
  );
}
