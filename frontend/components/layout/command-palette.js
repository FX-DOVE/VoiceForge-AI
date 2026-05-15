"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Mic,
  Users,
  History,
  CreditCard,
  Settings,
  Sparkles,
  Library,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  ArrowRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COMMANDS = [
  // Navigation
  { id: "dashboard", label: "Go to Dashboard", group: "Navigation", href: "/dashboard", icon: LayoutDashboard, keywords: "home overview" },
  { id: "studio", label: "Open Studio", group: "Navigation", href: "/studio", icon: Mic, keywords: "generate tts text speech" },
  { id: "voices", label: "Browse Voices", group: "Navigation", href: "/voices", icon: Sparkles, keywords: "library catalog community" },
  { id: "cloning", label: "Voice Cloning", group: "Navigation", href: "/cloning", icon: Users, keywords: "clone create voice" },
  { id: "library", label: "My Cloned Voices", group: "Navigation", href: "/cloning/library", icon: Library, keywords: "private public list" },
  { id: "history", label: "Generation History", group: "Navigation", href: "/history", icon: History, keywords: "past audio" },
  { id: "billing", label: "Billing & Plan", group: "Navigation", href: "/billing", icon: CreditCard, keywords: "invoices subscription pro" },
  { id: "settings", label: "Settings", group: "Navigation", href: "/settings", icon: Settings, keywords: "account profile api keys" },

  // Actions
  { id: "new", label: "Create New Generation", group: "Actions", href: "/studio", icon: Plus, keywords: "tts new project" },
  { id: "clone-new", label: "Clone a New Voice", group: "Actions", href: "/cloning", icon: Plus, keywords: "record upload voice" },
  { id: "upgrade", label: "Upgrade to Pro", group: "Actions", href: "/checkout", icon: Sparkles, keywords: "billing plan pro premium" },

  // Help
  { id: "help", label: "Help Center", group: "Help & Legal", href: "/help", icon: HelpCircle, keywords: "support docs" },
  { id: "docs", label: "API Documentation", group: "Help & Legal", href: "/docs", icon: FileText, keywords: "developer reference" },
  { id: "privacy", label: "Privacy Policy", group: "Help & Legal", href: "/privacy", icon: Shield, keywords: "legal" },
  { id: "terms", label: "Terms of Service", group: "Help & Legal", href: "/terms", icon: FileText, keywords: "legal tos" },

  // Account
  { id: "logout", label: "Sign Out", group: "Account", href: "/login", icon: LogOut, keywords: "logout exit", danger: true },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  // Open with Ctrl/Cmd+K
  useEffect(() => {
    function onKey(e) {
      const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
      const trigger = (isMac ? e.metaKey : e.ctrlKey) && (e.key === "k" || e.key === "K");
      if (trigger) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.keywords.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((c) => {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group).push(c);
    });
    return Array.from(map.entries());
  }, [filtered]);

  function executeCommand(cmd) {
    setOpen(false);
    if (cmd.id === "logout") {
      try {
        document.cookie = "vf_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        if (typeof window !== "undefined") {
          window.localStorage?.removeItem("vf_session");
          window.sessionStorage?.removeItem("vf_session");
        }
      } catch {}
    }
    router.push(cmd.href);
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) executeCommand(cmd);
    }
  }

  let runningIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-surface-container/95 backdrop-blur-2xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Search className="size-5 text-on-surface-variant shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, commands, settings..."
                  className="flex-1 bg-transparent text-white placeholder:text-on-surface-variant/50 focus:outline-none text-base"
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-on-surface-variant">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="py-10 px-6 flex flex-col items-center text-center gap-2">
                    <Search className="size-6 text-on-surface-variant opacity-40" />
                    <p className="text-sm text-on-surface-variant">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                  </div>
                ) : (
                  grouped.map(([group, items]) => (
                    <div key={group} className="mb-3 last:mb-0">
                      <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                        {group}
                      </div>
                      <ul>
                        {items.map((cmd) => {
                          runningIndex++;
                          const isActive = runningIndex === activeIndex;
                          return (
                            <li key={cmd.id}>
                              <button
                                type="button"
                                onMouseEnter={() => setActiveIndex(runningIndex)}
                                onClick={() => executeCommand(cmd)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                                  isActive
                                    ? "bg-white/10 text-white"
                                    : "text-on-surface hover:bg-white/5"
                                )}
                              >
                                <div
                                  className={cn(
                                    "size-8 rounded-lg flex items-center justify-center",
                                    cmd.danger
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-white/5 text-on-surface-variant"
                                  )}
                                >
                                  <cmd.icon className="size-4" />
                                </div>
                                <span
                                  className={cn(
                                    "flex-1 text-sm font-medium",
                                    cmd.danger && "text-red-400"
                                  )}
                                >
                                  {cmd.label}
                                </span>
                                {isActive && (
                                  <ArrowRight className="size-4 text-on-surface-variant" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↵</kbd>
                    Select
                  </span>
                </div>
                <span className="hidden sm:flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">⌘K</kbd>
                  Toggle
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
