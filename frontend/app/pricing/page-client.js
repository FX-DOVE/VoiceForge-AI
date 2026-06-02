"use client";

import Link from "next/link";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Zap, Crown, ChevronDown, HelpCircle, Mic, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { paymentsApi } from "@/lib/api";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border rounded-2xl overflow-hidden transition-all", open ? "border-white/10" : "border-white/[0.05]")}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-sm sm:text-base font-bold text-white leading-snug">{q}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-neutral-400 transition-transform duration-300", open && "rotate-180 text-primary")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-neutral-400 leading-relaxed border-t border-white/5 pt-4">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const creditPacks = [
    { amount: 1, label: "Starter" },
    { amount: 5, label: "Basic" },
    { amount: 10, label: "Creator", highlight: true },
    { amount: 25, label: "Studio" },
    { amount: 50, label: "Agency" },
    { amount: 100, label: "Enterprise" },
  ];

  const [packCredits, setPackCredits] = useState({});

  useEffect(() => {
    (async () => {
      const creditsMap = {};
      for (const pack of creditPacks) {
        try {
          const res = await paymentsApi.estimate(pack.amount, "professional");
          creditsMap[pack.amount] = res.credits || Math.floor(pack.amount * 66666);
        } catch {
          creditsMap[pack.amount] = Math.floor(pack.amount * 66666);
        }
      }
      setPackCredits(creditsMap);
    })();
  }, []);

  const plans = [
    {
      name: "VoiceForge Free",
      price: "$0",
      desc: "Basic voices. Free generation. Starter experience.",
      features: [
        "Basic voices",
        "Free generation",
        "Starter experience",
        "No voice cloning",
        "No custom voice uploads",
        "No credit card required"
      ],
      btnText: "Get Started Free",
      highlight: false,
      badge: "FREE",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    },
    {
      name: "VoiceForge Pro",
      price: "Pay as you go",
      desc: "Better quality voices. Faster generation. Premium voice library.",
      features: [
        "Better quality voices",
        "Faster generation",
        "Premium voice library",
        "Pay-as-you-go credits (one wallet)",
        "Credits never expire"
      ],
      btnText: "Buy Credits",
      highlight: true,
      badge: "PRO",
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30"
    },
    {
      name: "VoiceForge Premium",
      price: "$2.99 / month",
      desc: "Voice cloning, studio-quality voices, custom uploads, professional badge.",
      features: [
        "Voice cloning",
        "Studio-quality voices",
        "Custom voice uploads",
        "Premium voice library",
        "Professional badge",
        "Still pay credits per generation",
        "One wallet across all tiers"
      ],
      btnText: "Subscribe $2.99/mo",
      highlight: false,
      badge: "PREMIUM",
      badgeClass: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
      isSub: true
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden overflow-y-auto">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <TopNavBar />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
        <div className="w-full max-w-container-max flex flex-col items-center">
           {/* Header */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-center flex flex-col items-center gap-5 mb-16"
           >
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
               <span className="size-1.5 rounded-full bg-primary" />
               Free · Pay-as-you-go · $2.99/mo Premium
             </div>
             <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.05]">Simple, transparent pricing</h1>
             <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">VoiceForge Free: basic voices &amp; free gen. VoiceForge Pro: enhanced voices, pay-as-you-go. VoiceForge Premium ($2.99/mo): studio voices, cloning &amp; uploads. Credits required for all generations.</p>
           </motion.div>

           {/* Non-Refundable Notice */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.15 }}
             className="w-full max-w-4xl mb-8"
           >
             <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
               <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
               <div className="text-sm text-amber-200/80">
                 <p className="font-semibold text-amber-200 mb-1">All purchases are final and non-refundable.</p>
                 <p>Please use your complimentary credits to test the platform thoroughly before purchasing additional credits. By making a purchase, you agree to our <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>.</p>
               </div>
             </div>
           </motion.div>

           {/* Plans Grid — 3 plans per spec */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl items-stretch">
              {plans.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    "glass-panel p-6 sm:p-7 lg:p-8 rounded-3xl border-white/5 flex flex-col gap-6 relative overflow-hidden transition-all",
                    p.highlight ? "bg-white/[0.05] border-primary/30 ring-1 ring-primary/20 lg:scale-[1.02] lg:z-10" : "hover:bg-white/[0.03]",
                    p.isSub ? "border-violet-500/30" : ""
                  )}
                >
                  {p.highlight && (
                    <div className="absolute top-0 right-0 px-5 py-1.5 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-bl-3xl">
                       Most Popular
                    </div>
                  )}
                  {p.isSub && (
                    <div className="absolute top-0 right-0 px-5 py-1.5 bg-violet-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-3xl">
                       Subscription
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">{p.name}</h2>
                      {p.badge && <span className={cn("text-[9px] px-2 py-0.5 rounded-full border font-bold tracking-widest", p.badgeClass)}>{p.badge}</span>}
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                       <span className="text-4xl font-bold text-white">{p.price}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-2">{p.desc}</p>
                    {/* provider details hidden from users per rebrand spec */}
                  </div>

                  <Button className={cn(
                    "h-12 w-full rounded-full font-bold text-sm mt-auto",
                    p.isSub
                      ? "bg-violet-600 hover:bg-violet-500 text-white"
                      : p.highlight
                        ? "bg-primary hover:bg-primary/90 text-on-primary shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  )} asChild>
                    <Link href={p.isSub ? "/checkout?plan=professional" : (p.highlight ? "/billing" : "/studio")}>{p.btnText}</Link>
                  </Button>

                  <div className="flex flex-col gap-3 pt-5 border-t border-white/5 text-sm">
                     {p.features.map((f) => (
                       <div key={f} className="flex gap-3 items-start">
                          <Check className="size-3.5 mt-1 text-primary shrink-0" />
                          <span className="text-white/80 leading-snug">{f}</span>
                       </div>
                     ))}
                  </div>
                </motion.div>
              ))}
           </div>

           {/* Credit Packs Grid */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="mt-20 w-full"
           >
             <div className="flex items-center gap-3 mb-8">
               <Zap className="size-5 text-primary" />
               <h2 className="text-2xl font-bold text-white tracking-tight">Popular Credit Packs (for PRO &amp; PROFESSIONAL)</h2>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
               {creditPacks.map((pack) => {
                 const credits = packCredits[pack.amount] || Math.floor(pack.amount * 66666);
                 return (
                   <Link
                     key={pack.amount}
                     href="/checkout"
                     className={cn(
                       "relative glass-panel p-4 sm:p-5 rounded-2xl border flex flex-col items-center gap-2 transition-all group hover:scale-[1.03] hover:shadow-lg",
                       pack.highlight
                         ? "bg-primary/[0.06] border-primary/30 ring-1 ring-primary/20 hover:shadow-primary/10"
                         : "border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                     )}
                   >
                     {pack.highlight && (
                       <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                         Popular
                       </div>
                     )}
                     <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{pack.label}</span>
                     <span className="text-2xl sm:text-3xl font-bold text-white">${pack.amount}</span>
                     <span className={cn("text-[10px] font-bold", pack.highlight ? "text-primary" : "text-neutral-400")}>{credits.toLocaleString()} cr</span>
                     <span className="text-[10px] text-neutral-600">~{Math.floor(credits / 2).toLocaleString()} chars</span>
                   </Link>
                 );
               })}
             </div>
           </motion.div>

           {/* FAQ Section */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="mt-24 w-full max-w-3xl"
           >
             <div className="flex items-center gap-3 mb-8">
               <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center">
                 <HelpCircle className="size-5 text-primary" />
               </div>
               <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
             </div>
             <div className="flex flex-col gap-2.5">
               {[
                 { q: "Do credits expire?", a: "No. Credits never expire — they roll over indefinitely until you use them." },
                 { q: "What is the difference between free and premium voices?", a: "VoiceForge Free: basic voices, free generation. VoiceForge Pro: enhanced quality pay-as-you-go. VoiceForge Premium ($2.99/mo): studio quality + cloning + uploads (credits still apply per gen)." },
                 { q: "Can I use VoiceForge AI for commercial projects?", a: "Yes. All generated audio is yours to use commercially, including in YouTube videos, podcasts, apps, and products." },
                 { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards via Stripe. No PayPal or crypto at this time." },
                 { q: "Is there a refund policy?", a: "Due to the digital nature of credits, all purchases are final. Please use the free tier to evaluate the platform before purchasing." },
               ].map((item, i) => (
                 <FaqItem key={i} q={item.q} a={item.a} />
               ))}
             </div>
             <div className="mt-6 text-center">
               <Link href="/faq" className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1.5">
                 View full FAQ
                 <ArrowRight className="size-3.5" />
               </Link>
             </div>
           </motion.div>

           {/* Enterprise CTA */}
           <div className="mt-20 w-full pt-16 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div>
               <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Need a custom enterprise solution?</h2>
               <p className="text-sm text-neutral-400 mt-1">Volume discounts, dedicated support, and custom integrations available.</p>
             </div>
             <Button variant="outline" className="h-12 px-8 rounded-full border-white/10 hover:bg-white/5 font-bold shrink-0 group">
               Contact Sales
               <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
             </Button>
           </div>
        </div>
      </main>

      <footer className="w-full py-10 px-4 sm:px-6 lg:px-8 border-t border-white/5 shrink-0">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-on-primary">
              <Mic className="size-4" />
            </div>
            <span className="text-base font-bold text-white">VoiceForge AI</span>
          </div>
          <p className="text-sm text-on-surface-variant">&copy; 2024 VoiceForge AI. All rights reserved.</p>
          <div className="flex gap-5 text-sm font-semibold text-on-surface-variant">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
