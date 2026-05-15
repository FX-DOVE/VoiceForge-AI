"use client";

import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  HelpCircle, 
  CreditCard, 
  Terminal, 
  MessageSquare, 
  BookOpen, 
  PlayCircle,
  ChevronDown,
  Info,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function HelpPage() {
  const [activeFaq, setActiveFaq] = useState(0);

  const categories = [
    {
      title: "General",
      icon: Info,
      items: [
        { q: "What is VoiceForge AI?", a: "VoiceForge AI is a cutting-edge platform that leverages advanced artificial intelligence to generate high-quality, natural-sounding synthetic voices for various applications, including content creation, accessibility, and interactive media." },
        { q: "What languages are supported?", a: "Currently, we support over 30 languages including English, Spanish, French, German, Mandarin, and Japanese. We are continuously training our models to add more languages and distinct regional dialects every month." },
        { q: "Is there a free trial?", a: "Yes! Every new account comes with 10,000 complimentary characters so you can test our premium voices and explore the API before committing to a paid plan. No credit card is required for the trial." }
      ]
    },
    {
      title: "Billing",
      icon: CreditCard,
      items: [
        { q: "How do character quotas work?", a: "Your quota is based on the number of characters processed by our engine. Spaces and punctuation count towards this limit. Quotas reset on your billing cycle date." },
        { q: "Can I upgrade or downgrade my plan at any time?", a: "Absolutely. You can modify your subscription plan from the Billing section of your dashboard. Upgrades take effect immediately and are prorated." }
      ]
    },
    {
      title: "Technical",
      icon: Terminal,
      items: [
        { q: "What audio formats do you support?", a: "We support output in MP3, WAV, and OGG formats. By default, audio is generated as a high-quality 44.1kHz MP3." },
        { q: "What is the API rate limit?", a: "Standard plans allow for 5 concurrent requests and up to 100 requests per minute. Pro and Enterprise plans have significantly higher limits." }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNavBar />
      
      <main className="flex-1 w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row gap-10 lg:gap-16">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
           <div className="sticky top-24 flex flex-col gap-8">
              <div className="glass-panel p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/5 flex flex-col gap-6">
                 <h3 className="text-2xl font-bold text-white tracking-tight">Need more help?</h3>
                 <p className="text-sm text-on-surface-variant leading-relaxed">
                    Can't find the answer you're looking for? Our dedicated support team is available to assist you.
                 </p>
                 <Button className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold">
                    <MessageSquare className="mr-2 size-4" />
                    Contact Support
                 </Button>
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/5 flex flex-col gap-6">
                 <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Quick Links</h4>
                 <div className="flex flex-col gap-4">
                    <a href="/docs" className="flex items-center gap-3 text-sm font-bold text-primary hover:text-white transition-colors group">
                       <BookOpen className="size-4" />
                       API Documentation
                       <ArrowRight className="size-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <a href="/tutorials" className="flex items-center gap-3 text-sm font-bold text-primary hover:text-white transition-colors group">
                       <PlayCircle className="size-4" />
                       Video Tutorials
                       <ArrowRight className="size-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                 </div>
              </div>
           </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-16">
           <div className="flex flex-col gap-10">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] lg:leading-none"
              >
                 Frequently Asked <br/><span className="text-primary">Questions</span>
              </motion.h1>

              <div className="relative group max-w-2xl">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                 <input 
                   className="w-full h-16 pl-16 pr-8 bg-white/5 border border-white/10 rounded-full text-lg text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl" 
                   placeholder="Search for help articles..."
                 />
              </div>
           </div>

           <div className="flex flex-col gap-16">
              {categories.map((cat, idx) => (
                <section key={cat.title} className="flex flex-col gap-8">
                   <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <cat.icon className="size-6 text-primary" />
                      <h2 className="text-3xl font-bold text-white tracking-tight">{cat.title}</h2>
                   </div>
                   <div className="flex flex-col gap-4">
                      {cat.items.map((item, i) => {
                        const isOpen = activeFaq === (idx * 10 + i);
                        return (
                          <div 
                            key={item.q}
                            className={cn(
                              "glass-panel rounded-3xl border-white/5 transition-all overflow-hidden",
                              isOpen ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"
                            )}
                          >
                             <button 
                               onClick={() => setActiveFaq(isOpen ? null : (idx * 10 + i))}
                               className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 lg:p-8 text-left"
                             >
                                <span className="text-base sm:text-lg font-bold text-white tracking-tight">{item.q}</span>
                                <ChevronDown className={cn("size-5 text-on-surface-variant transition-transform duration-300 shrink-0", isOpen ? "rotate-180" : "")} />
                             </button>
                             <AnimatePresence>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-5 sm:px-6 lg:px-8 pb-5 sm:pb-6 lg:pb-8"
                                  >
                                     <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                                        {item.a}
                                     </p>
                                  </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                        );
                      })}
                   </div>
                </section>
              ))}
           </div>
        </div>
      </main>

      <footer className="w-full border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 mt-20">
         <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-on-surface-variant font-medium">© 2024 VoiceForge AI. All rights reserved.</p>
            <div className="flex gap-10 text-sm font-bold text-on-surface-variant uppercase tracking-widest">
               <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
               <a href="/terms" className="hover:text-white transition-colors">Terms</a>
               <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
