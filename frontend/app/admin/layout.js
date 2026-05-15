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
    <aside className="flex h-full w-72 shrink-0 flex-col bg-surface-container border-r border-white/5 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between gap-4 px-8 py-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center ring-1 ring-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
            <Activity className="size-6 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-white text-lg font-bold leading-none tracking-tight truncate">
              VoiceForge AI
            </h1>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mt-1">
              Admin Panel
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden shrink-0">
            <X className="size-5 text-on-surface-variant" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                />
              )}
              <item.icon className={cn("size-5", isActive ? "text-primary" : "group-hover:text-white")} />
              <span className="text-sm font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 mt-auto bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
            <Users className="size-5 text-on-surface" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-on-surface-variant truncate">{user?.email || ""}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="text-on-surface-variant hover:text-red-400 shrink-0"
          >
            <LogOut className="size-4" />
          </Button>
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
        <header className="lg:hidden h-16 border-b border-white/5 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-30">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center ring-1 ring-primary/50">
              <Activity className="size-4 text-primary" />
            </div>
            <span className="text-white font-bold tracking-tight">Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="size-6 text-white" />
          </Button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
