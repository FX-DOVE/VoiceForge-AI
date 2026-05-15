"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";

export default function AffiliatePage() {
  return (
    <MarketingPageShell
      eyebrow="Affiliate Program"
      title="Earn 20% recurring commission"
      subtitle="Share VoiceForge AI with your audience and get paid for every subscriber you refer. Simple tracking, monthly payouts."
    >
      <div className="flex flex-col gap-12 max-w-4xl mx-auto w-full">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: DollarSign,
              title: "20% recurring",
              description:
                "Earn 20% of every subscription payment for the lifetime of the customer.",
            },
            {
              icon: TrendingUp,
              title: "30-day cookie",
              description:
                "Referrals are tracked for 30 days after they first visit your link.",
            },
            {
              icon: Shield,
              title: "Reliable payouts",
              description:
                "Monthly payouts via PayPal or bank transfer once you reach $50 minimum.",
            },
          ].map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-3xl border-white/5 p-6 flex flex-col gap-3"
            >
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <benefit.icon className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
              <p className="text-sm text-on-surface-variant">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </section>

        <section className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-8 sm:p-12 flex flex-col gap-6 bg-gradient-to-br from-primary/10 via-background to-purple-500/10">
          <div className="flex flex-col gap-4 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              How it works
            </h2>
            <div className="flex flex-col gap-4">
              {[
                "Sign up for the affiliate program with your existing VoiceForge account.",
                "Get your unique referral link and creative assets from the dashboard.",
                "Share VoiceForge with your audience on your blog, YouTube, or social media.",
                "Earn 20% recurring commission on every paying subscriber you refer.",
                "Receive monthly payouts once you hit the $50 minimum threshold.",
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm sm:text-base text-white"
                >
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Who this is for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "YouTubers and content creators in the AI, tech, or audio space.",
              "Bloggers writing about SaaS tools, AI, or content creation.",
              "Social media influencers on X, LinkedIn, or TikTok.",
              "Podcasters with audiences interested in AI tools.",
              "Course creators teaching content production or AI.",
              "Developers building tools that integrate with voice APIs.",
            ].map((audience) => (
              <div
                key={audience}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <Users className="size-5 text-on-surface-variant shrink-0" />
                <span className="text-sm text-white">{audience}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-2xl border-white/5 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-white">
              Ready to start earning?
            </h3>
            <p className="text-on-surface-variant max-w-md">
              Join the affiliate program in under 2 minutes. No approval process
              required for existing VoiceForge users.
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold h-12 px-6 w-fit"
          >
            <Link href="/signup">
              Join Affiliate Program <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: "When do I get paid?",
                a: "Payouts are processed monthly by the 15th for the previous month's earnings, once you've reached at least $50 in commissions.",
              },
              {
                q: "What if a subscriber cancels?",
                a: "Commissions are tied to active subscriptions. If a subscriber cancels, future commissions for that referral stop.",
              },
              {
                q: "Can I self-refer?",
                a: "No. Self-referrals are not permitted and will result in account suspension.",
              },
              {
                q: "Is there a cap on earnings?",
                a: "No cap. The more you refer, the more you earn.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="glass-panel rounded-2xl border-white/5 p-5 flex flex-col gap-2"
              >
                <h4 className="text-base font-bold text-white">{faq.q}</h4>
                <p className="text-sm text-on-surface-variant">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MarketingPageShell>
  );
}
