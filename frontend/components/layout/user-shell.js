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
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { CommandPalette } from "@/components/layout/command-palette";

export function UserShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
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
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
            >
              <DashboardSidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-white/5 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <Mic className="size-5 text-on-primary" />
            </div>
            <span className="text-white font-bold tracking-tight">VoiceForge</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationsBell />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="size-6 text-white" />
            </Button>
          </div>
        </header>

        {/* Desktop Top Utility Bar */}
        <div className="hidden lg:flex h-14 border-b border-white/5 bg-background/60 backdrop-blur-md items-center justify-end gap-2 px-6 shrink-0 relative z-30">
          <CommandPaletteTrigger />
          <NotificationsBell />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
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
    try {
      document.cookie = "vf_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      if (typeof window !== "undefined") {
        window.localStorage?.removeItem("vf_session");
        window.sessionStorage?.removeItem("vf_session");
      }
    } catch {}
    onClose?.();
    router.push("/login");
  }

  return (
    <aside className={cn("w-72 shrink-0 flex flex-col border-r border-white/5 bg-surface-container h-full relative z-20", className)}>
      {/* Glossy top highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex flex-col h-full p-6">
        {/* Logo/Brand */}
        <div className="flex items-center justify-between px-2 py-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 ring-1 ring-white/10">
               <Mic className="size-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-none tracking-tight">VoiceForge</h1>
              <div className="flex items-center gap-1.5 mt-1">
                 <Sparkles className="size-3 text-primary" />
                 <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">Pro Member</span>
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="size-5 text-on-surface-variant" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 mt-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-on-surface-variant hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                  />
                )}
                <item.icon className={cn("size-5 transition-colors", isActive ? "text-primary" : "text-on-surface-variant group-hover:text-white")} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Bottom */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="bg-white/[0.03] p-4 rounded-[2rem] border border-white/5 flex flex-col gap-4">
             <Link 
               href="/settings"
               onClick={onClose}
               className="flex items-center gap-3 group"
             >
               <div className="size-10 rounded-full bg-surface-variant border border-white/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg7h91fg7bqsAkL62YfMC8IQr_SJ_tniLt0-y6cg2RHooUbIvbp8KWFo83Hgq3sNFj64-P5xukuwjLg6E-ZNDmu_DPIwCZetojleAlsSHqoioPzgRk5Y20A_vMCy-nQmte8tKMrqa7V3K8AOWPobwJkETw5wwFdMAh9TgT9Ke4chPDnB20JpjB7ksQekpIS1GlKwCuuH-nMRb3EpyW-GVkOytcx-61_sxH3PyQ7KIbzd1MMbjlP8lhndHvs7E_JV7Upa1rpuiqiNw" 
                    alt="Avatar"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
               </div>
               <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">Jane Doe</p>
                  <p className="text-[10px] text-on-surface-variant truncate font-medium">jane@example.com</p>
               </div>
             </Link>
             <button
               type="button"
               onClick={handleSignOut}
               className="w-full flex items-center justify-center gap-3 h-10 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
             >
               <LogOut className="size-4" />
               Sign Out
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
