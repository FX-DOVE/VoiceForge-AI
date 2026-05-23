"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Search,
  Plus,
  Globe,
  Shield,
  Play,
  Square,
  MoreVertical,
  Loader2,
  CheckCircle2,
  Trash2,
  Pencil,
  Share2,
  AlertTriangle,
  RefreshCcw,
  Link2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cloningApi, voicesApi } from "@/lib/api";
import { toast } from "sonner";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "private", label: "Private" },
  { id: "unlisted", label: "Link Only" },
  { id: "public", label: "Public" },
];

export default function ClonedVoicesLibraryPage() {
  const [voices, setVoices] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  // Rename state
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  // Visibility toggling
  const [togglingId, setTogglingId] = useState(null);
  // Preview audio
  const [playingId, setPlayingId] = useState(null);
  const [previewLoadingId, setPreviewLoadingId] = useState(null);
  const audioRef = React.useRef(null);

  const fetchList = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await cloningApi.list();
      setVoices(data.clones || []);
    } catch {
      toast.error("Could not load cloned voices.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const filteredVoices = useMemo(() => {
    return voices.filter((v) => {
      if (filter !== "all" && v.visibility !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        v.name?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q)
      );
    });
  }, [voices, filter, query]);

  const counts = useMemo(() => ({
    all: voices.length,
    private: voices.filter((v) => v.visibility === "private").length,
    unlisted: voices.filter((v) => v.visibility === "unlisted").length,
    public: voices.filter((v) => v.visibility === "public").length,
  }), [voices]);

  async function handleToggleVisibility(v) {
    const cycle = { private: "unlisted", unlisted: "public", public: "private" };
    const newVis = cycle[v.visibility] || "private";
    setTogglingId(v.id);
    setOpenMenuId(null);
    try {
      const res = await cloningApi.update(v.id, { visibility: newVis });
      setVoices((prev) => prev.map((c) => c.id === v.id
        ? { ...c, visibility: newVis, shareToken: res.shareToken || null }
        : c
      ));
      const label = newVis === "unlisted" ? "link only" : newVis;
      toast.success(`Voice is now ${label}.`);
    } catch (err) {
      toast.error(err?.message || "Could not update visibility.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleRenameSubmit(v) {
    const trimmed = renameValue.trim();
    if (!trimmed) return toast.error("Name cannot be empty.");
    try {
      await cloningApi.update(v.id, { name: trimmed });
      setVoices((prev) => prev.map((c) => c.id === v.id ? { ...c, name: trimmed } : c));
      toast.success("Voice renamed.");
    } catch (err) {
      toast.error(err?.message || "Could not rename voice.");
    } finally {
      setRenamingId(null);
      setRenameValue("");
    }
  }

  async function handlePreview(v) {
    // Stop current audio if same card
    if (playingId === v.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    // Stop any other playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    if (!v.voiceSlug) return toast.error("No voice available to preview.");
    setPreviewLoadingId(v.id);
    try {
      const data = await voicesApi.preview(v.voiceSlug);
      const url = data?.url;
      if (!url) throw new Error("No preview URL");
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => { setPlayingId(null); toast.error("Failed to play preview."); };
      await audio.play();
      setPlayingId(v.id);
    } catch (err) {
      toast.error(err?.message || "Could not load preview.");
    } finally {
      setPreviewLoadingId(null);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await cloningApi.delete(id);
      setVoices((prev) => prev.filter((c) => c.id !== id));
      toast.success("Voice deleted.");
    } catch (err) {
      toast.error(err?.message || "Could not delete voice.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  return (
    <>
      <header className="hidden lg:flex shrink-0 items-center justify-between border-b border-outline-variant/30 px-8 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
            <Mic className="size-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Cloned Voices</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5" onClick={fetchList} disabled={loadingList}>
            <RefreshCcw className={cn("size-4 text-on-surface-variant", loadingList && "animate-spin")} />
          </Button>
          <Button className="rounded-full bg-primary hover:bg-primary/90 text-on-primary" asChild>
            <Link href="/cloning">
              <Plus className="mr-2 size-4" />
              Clone New Voice
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">My Cloned Voices</h1>
            <p className="text-on-surface-variant max-w-2xl">
              Browse every voice you've cloned. Private voices are only visible to you;
              public voices appear in the Voice Library for all users.
            </p>
          </div>
          <Button className="rounded-full bg-primary hover:bg-primary/90 text-on-primary h-12 px-6 self-start md:hidden" asChild>
            <Link href="/cloning"><Plus className="mr-2 size-4" />Clone New Voice</Link>
          </Button>
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex p-1 rounded-full bg-white/5 border border-white/10 w-full md:w-fit overflow-x-auto">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" onClick={() => setFilter(f.id)}
                className={cn(
                  "flex-1 md:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 h-10 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                  filter === f.id ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(59,130,246,0.25)]" : "text-on-surface-variant hover:text-white"
                )}
              >
                {f.label}
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", filter === f.id ? "bg-white/20 text-white" : "bg-white/5 text-on-surface-variant")}>
                  {counts[f.id]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
              placeholder="Search by name or description..."
            />
          </div>
        </div>

        {/* Grid */}
        {loadingList ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        ) : filteredVoices.length === 0 ? (
          <div className="glass-panel p-10 sm:p-16 rounded-[2rem] border-white/5 flex flex-col items-center text-center gap-4">
            <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center text-on-surface-variant">
              <Mic className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No voices found</h3>
            <p className="text-on-surface-variant max-w-sm">
              {query ? `No cloned voices match "${query}".` : "You don't have any voices in this category yet."}
            </p>
            <Button className="mt-2 rounded-full bg-primary hover:bg-primary/90 text-on-primary h-12 px-6" asChild>
              <Link href="/cloning"><Plus className="mr-2 size-4" />Clone New Voice</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVoices.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="glass-panel rounded-3xl border-white/5 bg-white/[0.02] p-6 flex flex-col gap-5 group hover:bg-white/[0.05] transition-all relative"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("size-12 rounded-2xl flex items-center justify-center shrink-0",
                      v.status === "ready" ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-400"
                    )}>
                      <Mic className="size-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      {renamingId === v.id ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(v); }} className="flex gap-1">
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => { setRenamingId(null); setRenameValue(""); }}
                            className="text-sm font-bold text-white bg-white/10 border border-primary/40 rounded-lg px-2 py-0.5 outline-none w-32"
                          />
                        </form>
                      ) : (
                        <h3 className="text-base font-bold text-white truncate">{v.name || "Unnamed Voice"}</h3>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {v.visibility === "private" ? <Shield className="size-3" /> : v.visibility === "unlisted" ? <Link2 className="size-3" /> : <Globe className="size-3" />}
                        <span>{v.visibility === "unlisted" ? "link only" : (v.visibility || "private")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions menu */}
                  <div className="relative shrink-0">
                    <button type="button"
                      onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}
                      className="size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-white transition-colors"
                      aria-label="Voice actions"
                    >
                      {togglingId === v.id || deletingId === v.id
                        ? <Loader2 className="size-4 animate-spin" />
                        : <MoreVertical className="size-4" />}
                    </button>
                    {openMenuId === v.id && (
                      <div className="absolute right-0 top-10 z-20 w-52 rounded-2xl border border-white/10 bg-surface-container/95 backdrop-blur-xl shadow-2xl p-1.5 flex flex-col"
                        onMouseLeave={() => setOpenMenuId(null)}
                      >
                        <button type="button"
                          onClick={() => { setOpenMenuId(null); setRenamingId(v.id); setRenameValue(v.name || ""); }}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/5"
                        >
                          <Pencil className="size-4" /> Rename
                        </button>
                        {v.visibility === "unlisted" && v.shareToken && (
                          <button type="button"
                            onClick={() => {
                              const url = `${window.location.origin}/cloning/shared/${v.shareToken}`;
                              navigator.clipboard.writeText(url).then(() => { toast.success("Link copied!"); setOpenMenuId(null); });
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/5"
                          >
                            <Copy className="size-4" /> Copy Share Link
                          </button>
                        )}
                        <button type="button"
                          onClick={() => handleToggleVisibility(v)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/5"
                        >
                          <Share2 className="size-4" />
                          {v.visibility === "private" ? "Make Public" : v.visibility === "public" ? "Make Private" : "Change Visibility"}
                        </button>
                        <div className="my-1 h-px bg-white/5" />
                        {confirmDeleteId === v.id ? (
                          <button type="button"
                            onClick={() => handleDelete(v.id)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 font-bold"
                          >
                            <AlertTriangle className="size-4" /> Confirm Delete
                          </button>
                        ) : (
                          <button type="button"
                            onClick={() => setConfirmDeleteId(v.id)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="size-4" /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-on-surface-variant line-clamp-2 min-h-[2.5rem]">
                  {v.description || <span className="italic opacity-50">No description</span>}
                </p>

                {/* Status badge */}
                {v.status === "training" || v.status === "uploading" || v.status === "configured" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2 text-orange-400">
                        <Loader2 className="size-3.5 animate-spin" />
                        {v.status === "training" ? "Training" : "Preparing"}
                      </span>
                      <span className="text-primary">{v.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-purple-500" style={{ width: `${v.progress || 0}%` }} />
                    </div>
                  </div>
                ) : v.status === "ready" ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                    <CheckCircle2 className="size-3.5" />
                    Ready to use
                  </div>
                ) : v.status === "failed" ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                    <AlertTriangle className="size-3.5" />
                    Training failed
                  </div>
                ) : null}

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] text-on-surface-variant/70">
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Preview button — only shown when ready */}
                    {v.status === "ready" && v.voiceSlug && (
                      <button
                        type="button"
                        onClick={() => handlePreview(v)}
                        disabled={previewLoadingId === v.id}
                        className={cn(
                          "size-9 rounded-full flex items-center justify-center border transition-all",
                          playingId === v.id
                            ? "bg-primary/20 border-primary/40 text-primary"
                            : "bg-white/5 border-white/10 text-on-surface-variant hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                        )}
                        aria-label={playingId === v.id ? "Stop preview" : "Play preview"}
                      >
                        {previewLoadingId === v.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : playingId === v.id ? (
                          <Square className="size-3.5 fill-current" />
                        ) : (
                          <Play className="size-3.5 fill-current" />
                        )}
                      </button>
                    )}
                    {/* Use button */}
                    <Button type="button" disabled={v.status !== "ready"}
                      className="h-9 px-5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary font-bold disabled:opacity-40 text-sm"
                      asChild={v.status === "ready"}
                    >
                      {v.status === "ready" ? (
                        <Link href={`/studio${v.voiceSlug ? `?voice=${v.voiceSlug}` : ""}`}>
                          Use
                        </Link>
                      ) : (
                        <>Use</>
                      )}
                    </Button>
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
