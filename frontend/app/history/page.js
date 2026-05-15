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
import { useState } from "react";
import { GenerationDetailModal } from "@/components/history/generation-detail-modal";

export default function HistoryPage() {
  const [selected, setSelected] = useState(null);
  const generations = [
    {
      text: "The future of interactive storytelling begins with truly dynamic, emotionally resonant voice generation...",
      voice: "Marcus (British, Professional)",
      time: "Oct 24, 2023, 14:30",
      duration: "0:45",
      expiry: "Deletes in 2 days",
      status: "warning"
    },
    {
      text: "Welcome to the onboarding sequence. Let's get your workspace set up and ready for production.",
      voice: "Sarah (American, Casual)",
      time: "Oct 22, 2023, 09:15",
      duration: "0:12",
      expiry: "Deletes in 4 days",
      status: "neutral"
    },
    {
      text: "Error 404. The requested neural pathway could not be found. Please recalculate your parameters.",
      voice: "System (Robotic, Neutral)",
      time: "Oct 19, 2023, 18:02",
      duration: "0:08",
      expiry: "Deletes in 7 days",
      status: "neutral"
    },
    {
      text: "In a world where artificial intelligence defines the boundaries of creativity, one platform stands alone.",
      voice: "Antoni (Deep, Narrator)",
      time: "Oct 15, 2023, 11:20",
      duration: "1:30",
      expiry: "Expired",
      status: "expired"
    }
  ];

  return (
    <>
      <header className="hidden lg:flex shrink-0 items-center justify-between border-b border-outline-variant/30 px-8 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
             <HistoryIcon className="size-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Generation History</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input 
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50" 
              placeholder="Search generations..."
            />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/5">
            <Filter className="mr-2 size-4" />
            Filters
          </Button>
        </div>

        {/* History List */}
        <div className="flex flex-col gap-4">
          {generations.map((item, i) => (
            <motion.div
              key={i}
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
                  disabled={item.status === "expired"}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Play className="size-5 fill-current" />
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
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border",
                  item.status === "warning" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  "bg-white/5 text-on-surface-variant border-white/10"
                )}>
                  <Timer className="size-3.5" />
                  <span>{item.expiry}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10" disabled={item.status === "expired"} onClick={(e) => e.stopPropagation()}>
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
      />
    </>
  );
}
