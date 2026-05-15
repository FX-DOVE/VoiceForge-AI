"use client";

import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "For hobbyists and individual exploration.",
      features: [
        "10 minutes of voice generation",
        "Standard AI voices",
        "Community support",
        "MP3 downloads"
      ],
      btnText: "Get Started Free",
      highlight: false
    },
    {
      name: "Pro",
      price: isYearly ? "$15" : "$19",
      desc: "Perfect for creators and professional studios.",
      features: [
        "100 minutes of voice generation",
        "Premium xAI voices",
        "Instant voice cloning",
        "Priority support",
        "Commercial rights"
      ],
      btnText: "Start Pro Trial",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "Tailored solutions for global organizations.",
      features: [
        "Unlimited voice generation",
        "Custom voice creation",
        "API access & integration",
        "Dedicated manager",
        "SLA & Security"
      ],
      btnText: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      
      <TopNavBar />
      
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
        <div className="w-full max-w-container-max flex flex-col items-center">
           {/* Header */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-center flex flex-col items-center gap-6 mb-16"
           >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight">Simple, transparent pricing</h1>
              <p className="text-base sm:text-lg lg:text-xl text-on-surface-variant max-w-2xl">Choose the perfect plan for your voice generation needs.</p>
           </motion.div>

           {/* Toggle */}
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex mb-16"
           >
              <div className="flex h-14 items-center bg-white/5 p-1.5 rounded-full border border-white/10 shadow-2xl relative">
                 <div 
                   className={cn(
                     "absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-primary rounded-full transition-all duration-300 shadow-lg shadow-primary/20",
                     isYearly ? "translate-x-full" : "translate-x-0"
                   )}
                 />
                 <button 
                   onClick={() => setIsYearly(false)}
                   className={cn(
                     "relative z-10 px-8 h-full rounded-full text-sm font-bold transition-colors",
                     !isYearly ? "text-on-primary" : "text-on-surface-variant hover:text-white"
                   )}
                 >
                   Monthly
                 </button>
                 <button 
                   onClick={() => setIsYearly(true)}
                   className={cn(
                     "relative z-10 px-8 h-full rounded-full text-sm font-bold transition-colors",
                     isYearly ? "text-on-primary" : "text-on-surface-variant hover:text-white"
                   )}
                 >
                   Yearly <span className="text-[10px] opacity-70 ml-1">(-20%)</span>
                 </button>
              </div>
           </motion.div>

           {/* Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch">
              {plans.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "glass-panel p-6 sm:p-8 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border-white/5 flex flex-col gap-8 lg:gap-10 relative overflow-hidden transition-all",
                    p.highlight ? "bg-white/[0.05] border-primary/30 ring-1 ring-primary/20 lg:scale-105 lg:z-10" : "hover:bg-white/[0.03]"
                  )}
                >
                  {p.highlight && (
                    <div className="absolute top-0 right-0 px-6 py-2 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-bl-3xl">
                       Most Popular
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                     <h2 className="text-2xl font-bold text-white tracking-tight">{p.name}</h2>
                     <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">{p.price}</span>
                        {p.price !== "Custom" && <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">/mo</span>}
                     </div>
                     <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
                  </div>

                  <Button className={cn(
                    "h-14 w-full rounded-full font-bold text-lg",
                    p.highlight 
                      ? "bg-primary hover:bg-primary/90 text-on-primary shadow-[0_0_30px_rgba(59,130,246,0.2)]" 
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  )}>
                    {p.btnText}
                  </Button>

                  <div className="flex flex-col gap-6 pt-8 lg:pt-10 border-t border-white/5">
                     {p.features.map((f) => (
                       <div key={f} className="flex gap-4 items-start">
                          <div className={cn("size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5", p.highlight ? "bg-primary/20 text-primary" : "bg-white/5 text-on-surface-variant")}>
                             <Check className="size-3.5" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-medium text-white/80">{f}</span>
                       </div>
                     ))}
                  </div>
                </motion.div>
              ))}
           </div>

           {/* FAQ Lead */}
           <div className="mt-32 w-full pt-16 border-t border-white/5 flex flex-col items-center gap-6">
              <h2 className="text-3xl font-bold text-white tracking-tight">Need a custom enterprise solution?</h2>
              <Button variant="link" className="text-primary font-bold text-lg group">
                 Contact our sales team
                 <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
        </div>
      </main>

      <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-black/20">
         <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="size-6 bg-primary rounded-sm" />
               <span className="text-xl font-bold text-white">VoiceForge AI</span>
            </div>
            <p className="text-on-surface-variant font-medium">© 2024 VoiceForge AI. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
