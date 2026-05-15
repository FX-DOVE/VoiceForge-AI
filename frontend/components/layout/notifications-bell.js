"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, AlertCircle, Mic, CreditCard, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { notificationsApi } from "@/lib/api";

const TYPE_ICONS = {
  clone_ready: CheckCircle2,
  success: CheckCircle2,
  info: Mic,
  warning: AlertCircle,
  billing: CreditCard,
  promo: Sparkles,
};

const TYPE_STYLES = {
  success: "bg-green-500/10 text-green-400",
  clone_ready: "bg-green-500/10 text-green-400",
  info: "bg-primary/10 text-primary",
  warning: "bg-orange-500/10 text-orange-400",
  billing: "bg-purple-500/10 text-purple-400",
  promo: "bg-yellow-500/10 text-yellow-400",
};

function mapNotification(n) {
  const Icon = TYPE_ICONS[n.type] || Mic;
  return {
    id: n.id,
    type: n.type,
    icon: Icon,
    title: n.title,
    message: n.message,
    time: n.createdAt
      ? new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : "",
    href: n.type === "clone_ready" ? "/studio" : "/history",
    unread: !n.read,
  };
}

export function NotificationsBell({ className }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);
  const unreadCount = items.filter((n) => n.unread).length;

  useEffect(() => {
    notificationsApi
      .list()
      .then((data) => setItems((data.notifications || []).map(mapNotification)))
      .catch(() => setItems([]));
  }, [open]);

  useEffect(() => {
    function onClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  async function markRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    try {
      await notificationsApi.markRead(id);
    } catch {
      /* ignore */
    }
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative size-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-white transition-colors"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[min(92vw,380px)] rounded-3xl border border-white/10 bg-surface-container/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-2 py-12 px-6">
                  <Bell className="size-8 text-on-surface-variant opacity-40" />
                  <p className="text-sm text-on-surface-variant">You&apos;re all caught up.</p>
                </div>
              ) : (
                <ul className="flex flex-col">
                  {items.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={n.href}
                        onClick={() => {
                          markRead(n.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex items-start gap-3 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0",
                          n.unread && "bg-primary/[0.04]"
                        )}
                      >
                        <div
                          className={cn(
                            "size-9 rounded-xl flex items-center justify-center shrink-0",
                            TYPE_STYLES[n.type] || TYPE_STYLES.info
                          )}
                        >
                          <n.icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-white truncate">{n.title}</p>
                            {n.unread && (
                              <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mt-1.5">
                            {n.time}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-white/5 p-3">
              <Link
                href="/settings#notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-bold text-on-surface-variant hover:text-white transition-colors py-2"
              >
                Notification Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
