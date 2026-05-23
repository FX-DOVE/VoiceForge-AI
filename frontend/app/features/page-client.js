"use client";

import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Languages, 
  Mic, 
  Play, 
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeaturesPage() {
  const featureCards = [
    { 
      title: "VoiceForge Realism", 
      desc: "Generate studio-quality speech with emotions, breathing, and natural inflections.",
      icon: Sparkles 
    },
    { 
      title: "Multi-Language Support", 
      desc: "Translate and dub your audio into 50+ languages while preserving the original voice identity.",
      icon: Languages 
    },
    { 
      title: "Instant Voice Cloning", 
      desc: "Create a perfect digital replica of any voice using just a 10-second audio sample.",
      icon: Mic 
    }
  ];

  const sections = [
    {
      title: "VoiceForge Realism",
      desc: "Experience the pinnacle of artificial intelligence. Our VoiceForge models understand context, ensuring every word is spoken with the exact right tone and emotion, completely eliminating the robotic feel of traditional text-to-speech.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDI2xveijjbjblieuO8WpyGYF6FLGrpetIRoxZpL51I-cdb1Ru2DueNQLTJbAqx_yS7otun6MqN3iY_rizXdVaiIiVvzdZbrIOLGmxxGVEhDCU4BhusL1OjztEObDqwNHnfHhpC1m4bAN5MYsfxwnO7J0QVUhfgeQaXu5MupEzo1p2ae3ZZNAHZYSWdvGsMouKQC1uUTc3fYwUqpjlQp87EUNw8L_tUhJBQ8ekVW7o8sx1XGk43aZaINq3b8Ztr95dKwftSiKRRGo",
      btnText: "Hear Examples",
      reverse: false
    },
    {
      title: "Multi-Language Support",
      desc: "Take your content global. Instantly convert your English podcast, video, or presentation into Spanish, French, Mandarin, and more. Our engine automatically adjusts phonetics so you sound like a native speaker while preserving your unique vocal identity.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXtGACzdLbJsxbW8yzei-izeeJlbCwzlh8_4CGjbGZjScDiFRYTIq5_ADZIPcDY3SRHeXiDMDv99NiUlq_n9PLrUAKr9Plvf3wgSWHjO8crc_962q1DxdKjgSthmtWSS_8ENkOlx7ZgwTOf9NyFt5VkKyS3XBTEOfbXeoGTMZpYHgbcWlhCc9C-vQVv5-g12rm47X23RG4f1sVdS7B9-6K1xq_x_24d990J61j58sELWIbEDk3HpqeCRqaQzNguUKndgEy0v93KP8",
      btnText: "View Supported Languages",
      reverse: true
    },
    {
      title: "Instant Voice Cloning",
      desc: "Create a perfect digital replica of any voice using just a 10-second audio sample. Our advanced cloning technology captures the subtle nuances, timber, and cadence of the source audio, providing a highly accurate synthetic voice for dubbing, avatars, or accessibility.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC72q3R4vwQY5_hYwgNQylW30N4Wbp1tKIkoggli_FnwAM1zKmbMnZjUq67gtmzyR0AFnUG2Yvk68f-iDXYQ8ZFxA96jL8DmDZUMqvJJxlJgbR2RI2BkIsdMWGr9ZBJgM_5Bq0N7bSxCLkkchoVJm9bGzfCQiI0FnRpy90rqoyW05nL3eF7KeQgn0FpU-gtfjFkbKDY-mUbprhpOguyKecZZzBP67FZ95jKpNpoL8P1lK2SmmCupbzeEI0mB55PxAxVG7FN2l0doDw",
      btnText: "Clone a Voice Now",
      reverse: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNavBar />
      
      <main className="flex-1 flex flex-col items-center">
        {/* Features Hero */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32 flex flex-col items-center text-center gap-10">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex flex-col gap-6 items-center"
           >
              <span className="px-6 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest border border-primary/20">Platform Capabilities</span>
              <h1 className="text-4xl sm:text-5xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1] lg:leading-none">
                 Next-Generation <br/><span className="text-primary">Voice AI</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-on-surface-variant max-w-3xl leading-relaxed mt-4">
                 Explore the powerful features that make VoiceForge AI the industry leader in synthetic speech. 
                 Effortlessly create studio-quality audio with unprecedented control and realism.
              </p>
           </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
           {featureCards.map((f, i) => (
             <motion.div
               key={f.title}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="glass-panel p-6 sm:p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border-white/5 flex flex-col gap-6 group hover:bg-white/[0.05] transition-all"
             >
                <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <f.icon className="size-8" />
                </div>
                <div className="flex flex-col gap-3">
                   <h3 className="text-2xl font-bold text-white tracking-tight">{f.title}</h3>
                   <p className="text-on-surface-variant leading-relaxed text-base">{f.desc}</p>
                </div>
             </motion.div>
           ))}
        </section>

        {/* Detailed Sections */}
        <div className="w-full flex flex-col gap-32 py-20">
           {sections.map((s, i) => (
             <section key={s.title} className="w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8">
                <div className={cn(
                  "flex flex-col lg:flex-row gap-10 lg:gap-16 items-center",
                  s.reverse ? "lg:flex-row-reverse" : ""
                )}>
                   <motion.div 
                     initial={{ opacity: 0, x: s.reverse ? 30 : -30 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     className="w-full lg:w-1/2 aspect-video rounded-[3rem] overflow-hidden glass-panel p-2 shadow-2xl relative"
                   >
                      <div 
                        className="w-full h-full rounded-[2.5rem] bg-cover bg-center" 
                        style={{ backgroundImage: `url(${s.img})` }}
                      />
                      {/* Decorative ambient light */}
                      <div className="absolute -top-10 -left-10 size-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
                   </motion.div>

                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     className="w-full lg:w-1/2 flex flex-col gap-8"
                   >
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">{s.title}</h2>
                      <p className="text-base sm:text-lg lg:text-xl text-on-surface-variant leading-relaxed">{s.desc}</p>
                      <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-on-primary rounded-full w-fit font-bold group">
                         {s.btnText}
                         <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                   </motion.div>
                </div>
             </section>
           ))}
        </div>

        {/* CTA Section */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
           <div className="glass-panel p-8 sm:p-12 lg:p-20 rounded-[2.5rem] lg:rounded-[4rem] border-white/5 bg-gradient-to-br from-primary/10 via-background to-purple-500/10 flex flex-col items-center text-center gap-8 lg:gap-10">
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white tracking-tight max-w-3xl leading-[1.15]">Ready to experience the future of voice?</h2>
              <p className="text-base sm:text-lg lg:text-xl text-on-surface-variant max-w-2xl">Join thousands of creators using VoiceForge AI to bring their stories to life.</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 lg:gap-6 w-full sm:w-auto">
                 <Button className="h-14 lg:h-16 px-8 lg:px-12 bg-primary hover:bg-primary/90 text-on-primary rounded-full text-base lg:text-xl font-bold shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                    Create Your Account
                 </Button>
                 <Button variant="outline" className="h-14 lg:h-16 px-8 lg:px-12 rounded-full border-white/10 hover:bg-white/5 text-base lg:text-xl font-bold">
                    Talk to Sales
                 </Button>
              </div>
           </div>
        </section>

        {/* Simple Footer */}
        <footer className="w-full border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
           <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <p className="text-on-surface-variant font-medium">© 2024 VoiceForge AI. All rights reserved.</p>
              <div className="flex gap-10 text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                 <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                 <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                 <a href="/contact" className="hover:text-white transition-colors">Contact</a>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
}
