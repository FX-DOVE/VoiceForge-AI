"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Download,
  Copy,
  Trash2,
  Share2,
  RefreshCcw,
  Clock,
  User,
  Calendar,
  Timer,
  AudioLines,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

export function GenerationDetailModal({ open, generation, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);

  function handlePlayPause() {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }

  function handleDownload() {
    const url = generation?.downloadUrl || generation?.audioUrl;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `voiceforge-${generation?.id || "audio"}.mp3`;
    a.click();
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function handleCopy() {
    if (!generation?.text) return;
    navigator.clipboard?.writeText(generation.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <AnimatePresence>
      {open && generation && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              role="dialog"
              aria-modal="true"
              aria-label="Generation details"
              className="w-full max-w-2xl pointer-events-auto rounded-3xl border border-white/10 bg-surface-container/95 backdrop-blur-2xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-6 sm:px-8 pt-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "size-10 rounded-2xl flex items-center justify-center shrink-0",
                      generation.status === "expired"
                        ? "bg-white/5 text-on-surface-variant"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <AudioLines className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-lg font-bold text-white truncate">
                      Generation Detail
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      ID #{(generation.id || generation.text || "")
                        .toString()
                        .slice(0, 8)
                        .toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 sm:px-8 py-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
                {/* Player */}
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 flex flex-col gap-4">
                  {generation.audioUrl && (
                    <audio
                      ref={audioRef}
                      src={generation.audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  )}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      disabled={generation.status === "expired" || !generation.audioUrl}
                      className="size-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isPlaying ? (
                        <Pause className="size-6 fill-current" />
                      ) : (
                        <Play className="size-6 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                          style={{ width: isPlaying ? "60%" : "0%" }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">
                        <span>0:00</span>
                        <span>{generation.duration || "0:00"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={generation.status === "expired" || !generation.audioUrl}
                      onClick={handleDownload}
                      className="rounded-full text-xs font-bold hover:bg-white/5 disabled:opacity-40"
                    >
                      <Download className="mr-1.5 size-3.5" />
                      Download
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-xs font-bold hover:bg-white/5"
                    >
                      <Share2 className="mr-1.5 size-3.5" />
                      Share
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-xs font-bold hover:bg-white/5"
                    >
                      <RefreshCcw className="mr-1.5 size-3.5" />
                      Regenerate
                    </Button>
                  </div>
                </div>

                {/* Transcript */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Transcript
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Copy className="size-3" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm sm:text-base text-white leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    &ldquo;{generation.text}&rdquo;
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: User, label: "Voice", value: generation.voice },
                    { icon: Calendar, label: "Created", value: generation.time },
                    { icon: Clock, label: "Duration", value: generation.duration || "—" },
                    {
                      icon: Timer,
                      label: "Expires",
                      value: generation.expiry || generation.status === "expired" ? "Expired" : "Permanent",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div className="size-8 rounded-lg bg-white/5 text-on-surface-variant flex items-center justify-center shrink-0">
                        <m.icon className="size-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          {m.label}
                        </span>
                        <span className="text-sm font-bold text-white truncate">
                          {m.value || "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Settings used */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Generation settings
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Stability", value: "65%" },
                      { label: "Similarity", value: "75%" },
                      { label: "Style", value: "Default" },
                      { label: "Format", value: "MP3 44.1kHz" },
                    ].map((s) => (
                      <span
                        key={s.label}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-xs"
                      >
                        <Sparkles className="size-3 text-primary" />
                        <span className="text-on-surface-variant">{s.label}</span>
                        <span className="text-white font-bold">{s.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4 border-t border-white/5 bg-black/20">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-400 font-bold"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
