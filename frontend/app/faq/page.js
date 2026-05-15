"use client";

import Link from "next/link";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Search, 
  HelpCircle, 
  CreditCard, 
  Code, 
  BookOpen, 
  PlayCircle,
  ChevronDown,
  Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FaqPage() {
  const categories = [
    {
      id: "general",
      title: "General",
      icon: HelpCircle,
      questions: [
        {
          q: "What is VoiceForge AI?",
          a: "VoiceForge AI is a cutting-edge platform that leverages advanced artificial intelligence to generate high-quality, natural-sounding synthetic voices for various applications, including content creation, accessibility, and interactive media."
        },
        {
          q: "What languages are supported?",
          a: "Currently, we support over 30 languages including English, Spanish, French, German, Mandarin, and Japanese. We are continuously training our models to add more languages and distinct regional dialects every month."
        },
        {
          q: "Is there a free trial?",
          a: "Yes! Every new account comes with 10,000 complimentary characters so you can test our premium voices and explore the API before committing to a paid plan. No credit card is required for the trial."
        }
      ]
    },
    {
      id: "billing",
      title: "Billing",
      icon: CreditCard,
      questions: [
        {
          q: "How do character quotas work?",
          a: "Your quota is based on the number of characters processed by our engine. Spaces and punctuation count towards this limit. Quotas reset on your billing cycle date. Unused characters do not roll over to the next month."
        },
        {
          q: "Can I upgrade or downgrade my plan at any time?",
          a: "Absolutely. You can modify your subscription plan from the Billing section of your dashboard. Upgrades take effect immediately and are prorated. Downgrades will take effect at the start of your next billing cycle."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical",
      icon: Code,
      questions: [
        {
          q: "What audio formats do you support?",
          a: "We support output in MP3, WAV, and OGG formats. By default, audio is generated as a high-quality 44.1kHz MP3, but you can specify your preferred format and sample rate via the API parameters."
        },
        {
          q: "What is the API rate limit?",
          a: "Standard plans allow for 5 concurrent requests and up to 100 requests per minute. Pro and Enterprise plans have significantly higher limits and dedicated infrastructure. If you hit a rate limit, the API will return a 429 status code."
        }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <TopNavBar />

      <main className="flex-1 container-custom py-10 sm:py-12 lg:py-16 flex flex-col md:flex-row gap-10 lg:gap-16">
        {/* Sidebar */}
        <aside className="w-full md:w-1/3 lg:w-1/4 shrink-0">
          <div className="sticky top-24 flex flex-col gap-8">
            <div className="glass-panel rounded-2xl p-8 flex flex-col gap-4">
              <h3 className="text-2xl font-bold tracking-tight">Need more help?</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Can't find the answer you're looking for? Our dedicated support team is available to assist you with any technical or billing inquiries.
              </p>
              <Button className="mt-2 w-full rounded-full bg-primary hover:bg-primary/90 text-on-primary h-12">
                <Headphones className="mr-2 size-5" />
                Contact Support
              </Button>
            </div>
            
            <div className="glass-panel rounded-2xl p-8 flex flex-col gap-6">
              <h4 className="text-xs font-bold text-outline uppercase tracking-widest">Quick Links</h4>
              <div className="flex flex-col gap-4">
                <Link href="/docs" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-3 font-medium">
                  <BookOpen className="size-5" />
                  API Documentation
                </Link>
                <Link href="/tutorials" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-3 font-medium">
                  <PlayCircle className="size-5" />
                  Video Tutorials
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* FAQ Content */}
        <div className="flex-1 flex flex-col gap-12">
          {/* Hero / Search Area */}
          <div className="flex flex-col gap-8">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Frequently Asked <br/>Questions
            </motion.h1>
            <div className="relative w-full max-w-2xl group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                <Search className="size-6" />
              </div>
              <input 
                className="w-full h-16 pl-16 pr-8 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface text-lg placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.2)]" 
                placeholder="Search for help articles, features, or billing..." 
                type="text"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-16">
            {categories.map((cat, idx) => (
              <section key={cat.id} className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-primary p-3 rounded-2xl bg-primary/10">
                    <cat.icon className="size-8" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{cat.title}</h2>
                </div>
                
                <div className="flex flex-col gap-3">
                  {cat.questions.map((q, qIdx) => (
                    <details 
                      key={qIdx} 
                      className="glass-card rounded-2xl group overflow-hidden border-white/5"
                      open={idx === 0 && qIdx === 0}
                    >
                      <summary className="flex items-center justify-between gap-4 p-4 sm:p-6 cursor-pointer select-none hover:bg-white/5 transition-colors">
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-on-surface">{q.q}</span>
                        <ChevronDown className="text-outline group-open:rotate-180 transition-transform duration-300 size-5 sm:size-6 shrink-0" />
                      </summary>
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base lg:text-lg text-on-surface-variant leading-relaxed">
                        {q.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 flex justify-center mt-24">
        <p className="text-sm text-on-surface-variant">© 2024 VoiceForge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
