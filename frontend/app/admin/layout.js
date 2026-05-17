"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Billing", href: "/admin/billing", icon: CreditCard },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function Sidebar({ pathname, onClose }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const handleSignOut = () => {
    logout();
    onClose?.();
    router.push("/login");
  };
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col bg-surface-container border-r border-white/5 relative z-20 shadow-[4px_0_32px_rgba(0,0,0,0.3)] overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="flex items-center justify-between gap-4 px-6 py-8">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 bg-primary/20 rounded-xl flex items-center justify-center ring-1 ring-primary/40 shadow-[0_0_16px_rgba(59,130,246,0.25)] shrink-0">
            <Activity className="size-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-white text-sm font-bold leading-none tracking-tight truncate">VoiceForge AI</h1>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mt-1.5">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-9 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-white lg:hidden shrink-0"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
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
                  layoutId="admin-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 ring-1 ring-primary/20"
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                />
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
              )}
              <item.icon className={cn("size-4 shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-white")} />
              <span className="text-sm font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5 pt-5 border-t border-white/5 mt-auto">
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="flex items-center gap-3 p-3.5">
            <div className="size-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <Users className="size-4 text-on-surface" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-on-surface-variant truncate font-medium leading-tight mt-0.5">{user?.email || ""}</p>
            </div>
          </div>
          <div className="h-px bg-white/5 mx-3.5" />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
          >
            <LogOut className="size-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background w-full relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar pathname={pathname} />
      </div>

      {/* Mobile Drawer */}
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
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
            >
              <Sidebar pathname={pathname} onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 h-full flex flex-col overflow-hidden min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden h-16 border-b border-white/5 bg-surface-container/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary/20 rounded-xl flex items-center justify-center ring-1 ring-primary/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <Activity className="size-4 text-primary" />
            </div>
            <div>
              <span className="text-white font-bold tracking-tight text-sm">VoiceForge Admin</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="size-10 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-white"
          >
            <Menu className="size-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
