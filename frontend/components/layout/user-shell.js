"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Mic,
  Users,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  History,
  LayoutDashboard,
  Sparkles,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { CommandPalette } from "@/components/layout/command-palette";

export function UserShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen h-screen w-full bg-background overflow-hidden relative">
      <meta name="robots" content="noindex, nofollow" />
      {/* Sidebar - Desktop */}
      <DashboardSidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-[300px] z-50 lg:hidden shadow-2xl shadow-black/50"
            >
              <DashboardSidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-white/5 bg-surface-container/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Mic className="size-5 text-on-primary" />
            </div>
            <span className="text-white font-bold tracking-tight text-base">VoiceForge</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationsBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="size-10 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </header>

        {/* Desktop Top Utility Bar */}
        <div className="hidden lg:flex h-14 border-b border-white/5 bg-background/60 backdrop-blur-md items-center justify-end gap-3 px-6 shrink-0 relative z-30">
          <CommandPaletteTrigger />
          <NotificationsBell />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 overscroll-contain custom-scrollbar">
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}

function CommandPaletteTrigger() {
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
  return (
    <button
      type="button"
      onClick={() => {
        const evt = new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: !isMac,
          metaKey: isMac,
          bubbles: true,
        });
        window.dispatchEvent(evt);
      }}
      className="flex items-center gap-3 h-9 pl-3 pr-2 rounded-full bg-white/5 border border-white/10 text-on-surface-variant hover:bg-white/10 hover:text-white transition-colors min-w-[260px]"
    >
      <Search className="size-4" />
      <span className="text-xs flex-1 text-left">Search or run command...</span>
      <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold">
        ⌘K
      </kbd>
    </button>
  );
}

function DashboardSidebar({ className, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/studio", label: "Studio", icon: Mic },
    { href: "/voices", label: "Voice Library", icon: Sparkles },
    { href: "/cloning", label: "Voice Cloning", icon: Users },
    { href: "/history", label: "History", icon: History },
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  function handleSignOut() {
    logout();
    onClose?.();
    router.push("/login");
  }

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const planLabel = user?.plan ? `${user.plan.charAt(0).toUpperCase()}${user.plan.slice(1)}` : "Free";
  const isPro = planLabel !== "Free";
  const avatarSrc =
    user?.avatar ||
    user?.avatarUrl ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBg7h91fg7bqsAkL62YfMC8IQr_SJ_tniLt0-y6cg2RHooUbIvbp8KWFo83Hgq3sNFj64-P5xukuwjLg6E-ZNDmu_DPIwCZetojleAlsSHqoioPzgRk5Y20A_vMCy-nQmte8tKMrqa7V3K8AOWPobwJkETw5wwFdMAh9TgT9Ke4chPDnB20JpjB7ksQekpIS1GlKwCuuH-nMRb3EpyW-GVkOytcx-61_sxH3PyQ7KIbzd1MMbjlP8lhndHvs7E_JV7Upa1rpuiqiNw";

  return (
    <aside className={cn("w-72 shrink-0 flex flex-col border-r border-white/5 bg-surface-container h-full relative z-20 overflow-hidden", className)}>
      {/* Subtle ambient gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Logo/Brand */}
        <div className="flex items-center justify-between px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/25 ring-1 ring-white/10 shrink-0">
              <Mic className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-white text-base font-bold leading-none tracking-tight">VoiceForge</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Sparkles className="size-2.5 text-primary shrink-0" />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isPro ? "text-amber-400" : "text-on-surface-variant"
                )}>{planLabel} Plan</span>
              </div>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-9 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors lg:hidden shrink-0"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group relative min-h-[48px]",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-white/[0.06] hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 ring-1 ring-primary/20"
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn(
                  "size-4.5 transition-colors shrink-0",
                  isActive ? "text-primary" : "text-on-surface-variant group-hover:text-white"
                )} />
                <span className="text-sm font-semibold tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Bottom */}
        <div className="mt-auto px-4 pb-6 pt-6 border-t border-white/5">
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-3 p-4 group hover:bg-white/[0.04] transition-colors"
            >
              <div className="size-9 rounded-full bg-surface-variant border border-white/10 flex-shrink-0 overflow-hidden">
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors leading-tight">{displayName}</p>
                <p className="text-[11px] text-on-surface-variant truncate font-medium leading-tight mt-0.5">{displayEmail}</p>
              </div>
            </Link>
            <div className="h-px bg-white/5 mx-4" />
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            >
              <LogOut className="size-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
