"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TopNavBar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300 border-b",
      scrolled 
        ? "bg-background/80 backdrop-blur-xl border-white/10 py-3" 
        : "bg-transparent border-transparent py-5"
    )}>
      <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform ring-1 ring-white/10">
            <Mic className="size-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">VoiceForge <span className="text-primary">AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-bold uppercase tracking-widest transition-all hover:text-primary",
                pathname === link.href ? "text-primary" : "text-on-surface-variant"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors">
            Sign In
          </Link>
          <Button className="bg-primary hover:bg-primary/90 text-on-primary rounded-full px-8 h-12 font-bold shadow-[0_0_20px_rgba(59,130,246,0.2)] group" asChild>
            <Link href="/signup">
              Start Building
              <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Nav — full-screen overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed inset-x-0 top-0 bg-surface-container border-b border-white/10 p-6 pt-20 flex flex-col gap-6 lg:hidden shadow-2xl z-50"
            >
              {/* Close area at top */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-12 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-xl font-bold tracking-tight px-4 py-4 rounded-2xl transition-colors min-h-[60px] flex items-center",
                      pathname === link.href
                        ? "text-primary bg-primary/10"
                        : "text-white hover:bg-white/5 hover:text-primary"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex flex-col gap-3 pb-4">
                <Button variant="outline" className="h-14 rounded-full border-white/10 font-bold text-base" asChild>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button className="h-14 rounded-full bg-primary text-on-primary font-bold text-base shadow-lg shadow-primary/20" asChild>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started Free</Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
