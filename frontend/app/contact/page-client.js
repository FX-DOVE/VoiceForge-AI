"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Headphones,
  Building2,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CHANNELS = [
  {
    icon: MessageSquare,
    title: "General Inquiries",
    description: "Feedback, partnership ideas, or anything else.",
    contact: "hello@voiceforge.ai",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Trouble with your account or a generation? We can help.",
    contact: "support@voiceforge.ai",
  },
  {
    icon: Building2,
    title: "Sales & Enterprise",
    description: "Custom pricing, SLAs, on-prem, and volume discounts.",
    contact: "sales@voiceforge.ai",
  },
];

const TOPICS = [
  "General question",
  "Sales / Enterprise",
  "Technical support",
  "Billing issue",
  "Press / Media",
  "Other",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [topic, setTopic] = useState("General question");

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <TopNavBar />

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              Contact
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              We&apos;d love to hear from you
            </h1>
            <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl">
              Whether you have a question about features, pricing, an enterprise
              deal, or anything else &mdash; our team is ready to answer.
            </p>
          </motion.div>
        </section>

        {/* Channels */}
        <section className="w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {CHANNELS.map((c, i) => (
            <motion.a
              key={c.title}
              href={`mailto:${c.contact}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-3xl border-white/5 p-6 flex flex-col gap-4 hover:bg-white/[0.05] transition-all group"
            >
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <c.icon className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-white">{c.title}</h3>
                <p className="text-sm text-on-surface-variant">
                  {c.description}
                </p>
              </div>
              <p className="text-sm font-bold text-primary group-hover:underline mt-auto">
                {c.contact}
              </p>
            </motion.a>
          ))}
        </section>

        {/* Form */}
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-6 sm:p-10 lg:p-12">
            {submitted ? (
              <div className="flex flex-col items-center text-center gap-6 py-6">
                <div className="size-16 rounded-[2rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="size-8 text-green-400" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Message sent
                  </h2>
                  <p className="text-on-surface-variant max-w-md">
                    Thanks for reaching out. A member of our team will reply
                    within one business day.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 hover:bg-white/5 font-bold"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Send us a message
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    Fill in the form and we&apos;ll get back to you shortly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">
                      Full name
                    </label>
                    <Input
                      required
                      placeholder="Jane Doe"
                      className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
                      <Input
                        required
                        type="email"
                        placeholder="you@company.com"
                        className="h-12 pl-11 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">
                    Topic
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTopic(t)}
                        className={cn(
                          "h-9 px-4 rounded-full text-xs font-bold border transition-all",
                          topic === t
                            ? "bg-primary text-on-primary border-primary"
                            : "bg-white/5 text-on-surface-variant border-white/10 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="How can we help?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold shadow-[0_0_30px_rgba(59,130,246,0.2)] self-start group"
                >
                  <Send className="mr-2 size-4" />
                  Send Message
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
