"use client";

import Link from "next/link";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  HelpCircle,
  CreditCard,
  Code,
  BookOpen,
  PlayCircle,
  ChevronDown,
  Headphones,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

function AccordionItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div
      className={cn(
        "glass-card rounded-2xl border overflow-hidden transition-all",
        open ? "border-white/10" : "border-white/[0.05]"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-base sm:text-lg font-bold text-on-surface leading-snug">{q}</span>
        <ChevronDown
          className={cn(
            "text-outline transition-transform duration-300 size-5 shrink-0",
            open ? "rotate-180 text-primary" : ""
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-on-surface-variant leading-relaxed border-t border-white/5 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const [query, setQuery] = useState("");

  const categories = [
    {
      id: "general",
      title: "General",
      icon: HelpCircle,
      color: "text-blue-400 bg-blue-500/10",
      questions: [
        {
          q: "What is VoiceForge AI?",
          a: "VoiceForge AI is a cutting-edge platform that leverages advanced artificial intelligence to generate high-quality, natural-sounding synthetic voices for various applications, including content creation, accessibility, and interactive media.",
        },
        {
          q: "What languages are supported?",
          a: "Currently, we support over 30 languages including English, Spanish, French, German, Mandarin, and Japanese. We are continuously training our models to add more languages and distinct regional dialects every month.",
        },
        {
          q: "Is there a free trial?",
          a: "Yes! Every new account gets unlimited access to free Edge TTS voices at no cost, forever. Premium xAI Grok TTS voices require credits — no credit card required for the free tier.",
        },
      ],
    },
    {
      id: "billing",
      title: "Billing",
      icon: CreditCard,
      color: "text-emerald-400 bg-emerald-500/10",
      questions: [
        {
          q: "How do credits work?",
          a: "Credits power premium xAI Grok TTS generations. Each character costs 2 credits. You purchase credits in any amount from $1 to $100+. Credits never expire — they roll over indefinitely.",
        },
        {
          q: "Can I buy more credits at any time?",
          a: "Absolutely. Visit the Billing section or Pricing page to purchase any credit pack instantly. There are no subscriptions — it's pure pay-as-you-go.",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical",
      icon: Code,
      color: "text-violet-400 bg-violet-500/10",
      questions: [
        {
          q: "What audio formats are supported?",
          a: "Audio is generated as high-quality MP3 files (44.1 kHz). Downloads are available directly from your History page or via the dashboard.",
        },
        {
          q: "What is the character limit per generation?",
          a: "Each generation supports up to 5,000 characters. For longer content, split your script into multiple generations.",
        },
        {
          q: "What is the API rate limit?",
          a: "Standard users can make up to 100 requests per minute. Pro credit holders have higher throughput. If you hit a rate limit, the API returns a 429 status code.",
        },
      ],
    },
  ];

  const filtered = categories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (q) =>
          !query ||
          q.q.toLowerCase().includes(query.toLowerCase()) ||
          q.a.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface overflow-x-hidden">
      <TopNavBar />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/6 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col md:flex-row gap-10 lg:gap-16 pb-24">
        {/* Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
          <div className="sticky top-24 flex flex-col gap-5">
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 border-white/5">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Headphones className="size-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Need more help?</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Can&apos;t find the answer you&apos;re looking for? Our support team is ready to help.
              </p>
              <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-on-primary h-11 font-semibold shadow-lg shadow-primary/15">
                <Headphones className="mr-2 size-4" />
                Contact Support
              </Button>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 border-white/5">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Quick Links</h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/docs"
                  className="flex items-center gap-3 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium py-1"
                >
                  <BookOpen className="size-4 shrink-0" />
                  API Documentation
                </Link>
                <Link
                  href="/tutorials"
                  className="flex items-center gap-3 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium py-1"
                >
                  <PlayCircle className="size-4 shrink-0" />
                  Video Tutorials
                </Link>
              </div>
            </div>

            {/* Category jump links — desktop only */}
            <div className="hidden md:flex flex-col gap-1">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:text-white hover:bg-white/5 transition-all font-medium"
                >
                  <div className={cn("size-6 rounded-lg flex items-center justify-center", cat.color)}>
                    <cat.icon className="size-3.5" />
                  </div>
                  {cat.title}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* FAQ Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-12">
          {/* Hero / Search Area */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.08]">
                Frequently Asked<br />Questions
              </h1>
              <p className="text-on-surface-variant text-base sm:text-lg">Everything you need to know about VoiceForge AI.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative w-full max-w-2xl group"
            >
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Search className="size-5" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Search questions..."
                type="text"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 size-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-400 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              )}
            </motion.div>
          </div>

          {/* Categories */}
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <Search className="size-7 text-neutral-600" />
              </div>
              <p className="text-neutral-400 font-semibold">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-neutral-600 text-sm">Try a different search term.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-14">
              {filtered.map((cat, idx) => (
                <section id={cat.id} key={cat.id} className="flex flex-col gap-5 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", cat.color)}>
                      <cat.icon className="size-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{cat.title}</h2>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {cat.questions.map((q, qIdx) => (
                      <AccordionItem
                        key={qIdx}
                        q={q.q}
                        a={q.a}
                        defaultOpen={!query && idx === 0 && qIdx === 0}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="w-full border-t border-white/5 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-7 bg-primary rounded-lg flex items-center justify-center text-on-primary">
              <Mic className="size-3.5" />
            </div>
            <span className="text-base font-bold text-white">VoiceForge AI</span>
          </div>
          <p className="text-sm text-on-surface-variant">© 2024 VoiceForge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
