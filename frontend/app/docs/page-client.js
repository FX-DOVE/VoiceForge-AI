"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Terminal,
  Webhook,
  Key,
  ArrowRight,
  Copy,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";

const SECTIONS = [
  {
    icon: BookOpen,
    title: "Quick Start",
    description: "Set up your first generation in under 2 minutes.",
    href: "#quick-start",
  },
  {
    icon: Key,
    title: "Authentication",
    description: "Authenticate API requests with your secret keys.",
    href: "#auth",
  },
  {
    icon: Code2,
    title: "Endpoints",
    description: "Reference for /generate, /voices, /clones, and /usage.",
    href: "#endpoints",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Subscribe to generation.completed and clone.ready events.",
    href: "#webhooks",
  },
];

const EXAMPLE = `curl -X POST https://voiceforgeai.site/api/generate \\
  -H "Authorization: Bearer $VF_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "voice_id": "antoni",
    "text": "Hello from VoiceForge AI.",
    "format": "mp3"
  }'`;

export default function DocsPage() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(EXAMPLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <MarketingPageShell
      eyebrow="API Documentation"
      title="Build with the VoiceForge API"
      subtitle="Generate studio-quality audio, clone voices, and stream output programmatically. REST + Webhooks. Official SDKs for JS, Python, and Go."
    >
      <div className="flex flex-col gap-12">
        {/* Quick links grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SECTIONS.map((s, i) => (
            <motion.a
              key={s.title}
              href={s.href}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-3xl border-white/5 p-6 flex flex-col gap-3 hover:bg-white/[0.05] transition-all group"
            >
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <s.icon className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{s.title}</h3>
              <p className="text-sm text-on-surface-variant flex-1">
                {s.description}
              </p>
              <span className="text-xs font-bold text-primary inline-flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                Read <ArrowRight className="size-3" />
              </span>
            </motion.a>
          ))}
        </div>

        {/* Quick start */}
        <section id="quick-start" className="flex flex-col gap-6 scroll-mt-28">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Quick Start
            </h2>
            <p className="text-on-surface-variant max-w-2xl">
              Generate your first audio file with a single HTTP request. Replace
              <code className="px-1.5 py-0.5 mx-1 rounded bg-white/5 text-primary font-mono text-xs">$VF_API_KEY</code>
              with a key from <Link href="/settings#apikeys" className="text-primary hover:underline">Settings → API Keys</Link>.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <Terminal className="size-3.5" /> Bash
              </div>
              <button
                type="button"
                onClick={copy}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="size-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" /> Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 overflow-x-auto text-sm text-white font-mono leading-relaxed">
              <code>{EXAMPLE}</code>
            </pre>
          </div>
        </section>

        {/* Auth */}
        <section id="auth" className="flex flex-col gap-4 scroll-mt-28">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Authentication
          </h2>
          <p className="text-on-surface-variant max-w-2xl">
            All requests require a Bearer token in the
            <code className="px-1.5 py-0.5 mx-1 rounded bg-white/5 text-primary font-mono text-xs">Authorization</code>
            header. Keys are scoped per project; rotate them anytime from
            Settings.
          </p>
        </section>

        {/* Endpoints */}
        <section id="endpoints" className="flex flex-col gap-6 scroll-mt-28">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Core Endpoints
          </h2>
          <p className="text-on-surface-variant max-w-2xl">
            All API endpoints are available at{" "}
            <code className="px-1.5 py-0.5 mx-1 rounded bg-white/5 text-primary font-mono text-xs">https://voiceforgeai.site/api</code>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                method: "POST",
                path: "/api/generate",
                desc: "Create a new TTS generation.",
                color: "text-green-400 bg-green-500/10 border-green-500/20",
              },
              {
                method: "GET",
                path: "/api/voices",
                desc: "List stock and community voices.",
                color: "text-primary bg-primary/10 border-primary/20",
              },
              {
                method: "POST",
                path: "/api/clones",
                desc: "Submit audio samples to start cloning.",
                color: "text-green-400 bg-green-500/10 border-green-500/20",
              },
              {
                method: "GET",
                path: "/api/usage",
                desc: "Retrieve credit and usage metrics.",
                color: "text-primary bg-primary/10 border-primary/20",
              },
            ].map((e) => (
              <div
                key={e.path}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${e.color}`}
                >
                  {e.method}
                </span>
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-mono text-white block truncate">
                    {e.path}
                  </code>
                  <p className="text-xs text-on-surface-variant truncate">
                    {e.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Webhooks */}
        <section id="webhooks" className="flex flex-col gap-4 scroll-mt-28">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Webhooks
          </h2>
          <p className="text-on-surface-variant max-w-2xl">
            Subscribe a HTTPS endpoint to receive
            <code className="px-1.5 py-0.5 mx-1 rounded bg-white/5 text-primary font-mono text-xs">generation.completed</code>
            and
            <code className="px-1.5 py-0.5 mx-1 rounded bg-white/5 text-primary font-mono text-xs">clone.ready</code>
            events. Each delivery is signed with your project secret.
          </p>
        </section>

        {/* CTA */}
        <div className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-primary/10 via-background to-purple-500/10">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold text-white">Ready to build?</h3>
            <p className="text-on-surface-variant">
              Get an API key from your dashboard and ship in minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold h-12 px-6"
            >
              <Link href="/settings#apikeys">
                <Key className="mr-2 size-4" />
                Get API Key
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/10 hover:bg-white/5 font-bold h-12 px-6"
            >
              <a href="https://github.com/voiceforge" target="_blank" rel="noopener noreferrer">
                SDKs on GitHub
                <ExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </MarketingPageShell>
  );
}
