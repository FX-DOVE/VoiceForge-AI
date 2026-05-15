"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Play, 
  Download, 
  MoreVertical, 
  Timer, 
  User, 
  Zap,
  Plus
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { GenerationDetailModal } from "@/components/history/generation-detail-modal";

export default function DashboardPage() {
  const [selected, setSelected] = useState(null);
  const stats = [
    { label: "Remaining Credits", value: "1,250", icon: Zap },
    { label: "Usage This Month", value: "145 mins", icon: Timer },
  ];

  const recentGenerations = [
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
    }
  ];

  return (
    <>
      <header className="hidden lg:flex shrink-0 items-center justify-between border-b border-outline-variant/30 px-8 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
             <div className="size-4 bg-primary rounded-sm" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="flex items-center gap-4">
           <Button className="rounded-full bg-primary hover:bg-primary/90 text-on-primary" asChild>
             <Link href="/studio">
               <Plus className="mr-2 size-4" />
               New Project
             </Link>
           </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 rounded-2xl flex flex-col gap-2 border-white/5"
            >
              <div className="flex items-center justify-between">
                <p className="text-on-surface-variant font-medium">{s.label}</p>
                <s.icon className="size-5 text-primary opacity-50" />
              </div>
              <p className="text-4xl font-bold text-white tracking-tight">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Action Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8 border-primary/20 bg-primary/5"
        >
          <div className="flex flex-col gap-2">
             <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
             <p className="text-on-surface-variant text-lg">Start a new project or create a custom voice clone.</p>
          </div>
          <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-on-primary px-8" asChild>
            <Link href="/studio">Generate New Voice</Link>
          </Button>
        </motion.div>

        {/* Recent Generations */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Recent Generations</h2>
          <div className="flex flex-col gap-4">
            {recentGenerations.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                role="button"
                tabIndex={0}
                onClick={() => setSelected({ ...item, id: i })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected({ ...item, id: i });
                  }
                }}
                className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 border-white/5 hover:bg-white/5 transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex items-start gap-4 lg:contents">
                  <Button
                    className="size-12 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shrink-0"
                    variant="ghost"
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
                    item.status === "warning" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-on-surface-variant border-white/10"
                  )}>
                    <Timer className="size-3.5" />
                    <span>{item.expiry}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10" onClick={(e) => e.stopPropagation()}>
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
      </div>

      <GenerationDetailModal
        open={!!selected}
        generation={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
