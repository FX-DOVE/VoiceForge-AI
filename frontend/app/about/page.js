"use client";

import { motion } from "framer-motion";
import { Users, Zap, Globe, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";

export default function AboutPage() {
  return (
    <MarketingPageShell
      eyebrow="About Us"
      title="The future of voice, built for creators"
      subtitle="We're a team of engineers, designers, and audio obsessives building the most expressive synthetic voice platform on the planet."
    >
      <div className="flex flex-col gap-16">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Our Mission",
              description:
                "To make studio-quality voice generation accessible to every creator, developer, and business.",
            },
            {
              icon: Globe,
              title: "Global Reach",
              description:
                "Supporting 50+ languages and counting, we're breaking down language barriers for creators worldwide.",
            },
            {
              icon: Heart,
              title: "Creator First",
              description:
                "Built by creators, for creators. Every feature is shaped by feedback from our community.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-3xl border-white/5 p-8 flex flex-col gap-4"
            >
              <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <item.icon className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-on-surface-variant">{item.description}</p>
            </motion.div>
          ))}
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            What we believe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Synthetic voices should sound indistinguishable from real ones.",
              "Creators should own the output they generate.",
              "Voice cloning must be transparent and consent-driven.",
              "Great tools should feel simple, even under the hood they're complex.",
              "Privacy and security are non-negotiable.",
              "APIs should be as delightful as the product itself.",
            ].map((belief) => (
              <div
                key={belief}
                className="flex items-start gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                <p className="text-base text-white">{belief}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-br from-primary/10 via-background to-purple-500/10">
          <div className="flex flex-col gap-4 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Join the team
            </h2>
            <p className="text-on-surface-variant">
              We're hiring across engineering, design, and operations. If you're
              passionate about the future of AI and audio, we'd love to meet you.
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold h-12 px-6"
          >
            <Link href="/contact">
              View Open Roles <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </section>
      </div>
    </MarketingPageShell>
  );
}
