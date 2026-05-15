"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PlayCircle, Mic, MemoryStick, Languages, Play, Pause, Loader2 } from "lucide-react";
import { voicesApi } from "@/lib/api";
import { toast } from "sonner";

export default function LandingPage() {
  const audioRef = useRef(null);
  const [playingSlug, setPlayingSlug] = useState(null);
  const [loadingSlug, setLoadingSlug] = useState(null);

  async function handleListen(slug) {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingSlug === slug) {
      audio.pause();
      setPlayingSlug(null);
      return;
    }

    audio.pause();
    setPlayingSlug(null);
    setLoadingSlug(slug);

    try {
      const data = await voicesApi.preview(slug);
      const url = data.url;

      await new Promise((resolve, reject) => {
        const onReady = () => { audio.removeEventListener("canplay", onReady); audio.removeEventListener("error", onFail); resolve(); };
        const onFail = (e) => { audio.removeEventListener("canplay", onReady); audio.removeEventListener("error", onFail); reject(e); };
        audio.addEventListener("canplay", onReady);
        audio.addEventListener("error", onFail);
        audio.src = url;
        audio.load();
      });

      setLoadingSlug(null);
      setPlayingSlug(slug);
      await audio.play();
    } catch (err) {
      console.error("[Preview]", err);
      setLoadingSlug(null);
      setPlayingSlug(null);
      toast.error("Could not play voice preview. Please try again.");
    }
  }

  const voiceSamples = [
    { 
      name: "Antoni", slug: "antoni",
      style: "Professional, Deep", 
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvtHzWYW9YJzgO_ZRR1_fwvCYGCE5I40t2H_nT91mQWjl56adu0N2kKqLKgfU22nQqPBKuyL7MynP0811hmBL_xZoZcRzkWWHjhOihdPB4D1vsB7r7HQ1uebjx6KJpiFk8b233ysRamZ8A1_4j6OZSVzwJxGQ3HSOIoI-9LbJy59tXbu1ZnPsIov4A9Wr-sOI1wxo-VQgvxkEfwpwYOfkopYZZKxqnm60BoQtEUSzdBX8TCAtr3a3Yh-rhnnUB3QygZepRyo6kmV4" 
    },
    { 
      name: "Bella", slug: "bella",
      style: "Conversational, Soft", 
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3yNFip8ipSMpdIPkUH62nYg3INJqnyq-TYzXmHVpq2mOblZtDXHU7mUH1kXIcEzeU5pRbk3z-co0NZdouUqZgenIC9CzOzcm5vLxPv0lyWdcorypmqjNiZ3qvEICSkYGilD3I1zDIz1izW8Zm7PoIN3ureDYiW40G2tgkmnpZJ-c9TnPGMtnE9rBFdlUpNQ6Afj9F73PyJ4EwL_Oe6BCfIO4ADZkfAvfNYgv2mangcbceP0efVAGn8Xg8Zw4QpXbT9mXIlNaWaFQ" 
    },
    { 
      name: "Rachel", slug: "rachel",
      style: "Energetic, Clear", 
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2tgjHbZwPadn9cw8gkAsLy3BUQBYyoxAwGgVkLfOyM6HiZjVInAwRHZ1aW_apmv2jonV32Kt8XI9EP_naAtJe1iDk6A52iZXSjIl74mKvtM5bE3JvRw-3eomYwDnOaX0BKJRV8tVDFyzjtxOYVMLzTEQwVedzcpD_GEraL1Ox2JLl2XK43bwHtKAixzquKTfrV3kd_0LWxm1NRbjHKQCnRksMEV-1EyqOpag-yGBjGHJgwuPMkiQrwlqxgRbyI15wJl86LQg2tMA" 
    }
  ];

  const features = [
    { 
      title: "xAI Powered", 
      desc: "Industry-leading models for unmatched realism and emotional depth in every generated voice.",
      icon: MemoryStick 
    },
    { 
      title: "Global Languages", 
      desc: "Over 100 languages and diverse accents supported to reach a truly global audience.",
      icon: Languages 
    },
    { 
      title: "Custom Cloning", 
      desc: "Instantly clone your own voice or any talent with just 1 minute of clear audio reference.",
      icon: Mic 
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNavBar />
      
      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8 text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Generate Natural <br/>AI Voices with <span className="text-primary">xAI</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed">
              Convert any script into realistic speech in seconds. Studio-quality text-to-speech for creators and developers.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-on-primary rounded-full text-lg font-bold shadow-[0_0_30px_rgba(59,130,246,0.3)]" asChild>
                <Link href="/signup">Start Free</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleListen("antoni")}
                className="h-14 px-10 rounded-full border-white/10 hover:bg-white/5 text-lg font-bold"
              >
                {loadingSlug === "antoni" ? (
                  <Loader2 className="mr-2 size-6 animate-spin" />
                ) : playingSlug === "antoni" ? (
                  <Pause className="mr-2 size-6" />
                ) : (
                  <PlayCircle className="mr-2 size-6" />
                )}
                {playingSlug === "antoni" ? "Playing..." : loadingSlug === "antoni" ? "Loading..." : "Listen to Demo"}
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div 
              className="w-full aspect-video bg-center bg-no-repeat bg-cover rounded-[3rem] shadow-2xl border border-white/5 ring-1 ring-white/10" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB_7rCsegpxK0ELZVC4N_-mnZLMsYk7655oSzClcJhe3fPg_poYc2ZkaUNID2Yy7TaN6B40P7d_MgmTXhhSDhZ1wCrkmSqJ0JFX7riytNJ-bvlPwww8m4jFPthMhJWY0VgQJ1mXGNRv06bqnFItVp1DakVGVUNseaJ6tEVXTIDP1hrPqKIiI1wZw8KXASF3EJwwCo9PJeRP1vDjNsclSpHxabU9C-SCiBy5eG3QQlftsCkTvm1mQKa8Z10rzWLO7y8CcYS7EYui3no")' }}
            />
            {/* Ambient Glows */}
            <div className="absolute -top-20 -right-20 size-80 bg-primary/20 rounded-full blur-[120px] -z-10" />
            <div className="absolute -bottom-20 -left-20 size-80 bg-purple-500/20 rounded-full blur-[120px] -z-10" />
          </motion.div>
        </section>

        {/* Voice Samples */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h2 className="text-4xl font-bold text-white mb-12 tracking-tight">Voice Samples</h2>
          {/* hidden shared audio element */}
          <audio ref={audioRef} onEnded={() => setPlayingSlug(null)} className="hidden" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {voiceSamples.map((v, i) => {
              const isPlaying = playingSlug === v.slug;
              const isLoading = loadingSlug === v.slug;
              return (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 rounded-[2.5rem] border-white/5 flex flex-col gap-6 group hover:bg-white/[0.05] transition-all"
              >
                <div 
                  className="w-full aspect-square bg-center bg-no-repeat bg-cover rounded-[2rem] border border-white/10" 
                  style={{ backgroundImage: `url(${v.img})` }}
                />
                <div className="flex flex-col gap-4">
                   <div className="flex flex-col gap-1">
                      <h3 className="text-2xl font-bold text-white">{v.name}</h3>
                      <p className="text-primary font-bold uppercase tracking-widest text-[10px]">{v.style}</p>
                   </div>
                   <Button
                     variant="outline"
                     onClick={() => handleListen(v.slug)}
                     disabled={isLoading}
                     className={`w-full h-12 rounded-full border-white/10 transition-all font-bold ${
                       isPlaying
                         ? "bg-primary text-on-primary border-primary"
                         : "hover:bg-primary hover:text-on-primary hover:border-primary"
                     }`}
                   >
                     {isLoading ? (
                       <Loader2 className="mr-2 size-4 animate-spin" />
                     ) : isPlaying ? (
                       <Pause className="mr-2 size-4 fill-current" />
                     ) : (
                       <Play className="mr-2 size-4 fill-current" />
                     )}
                     {isLoading ? "Loading..." : isPlaying ? "Pause" : "Listen"}
                   </Button>
                </div>
              </motion.div>
            )})}
          </div>
        </section>

        {/* Features */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 py-20 sm:py-32 flex flex-col items-center">
           <div className="text-center flex flex-col items-center gap-6 mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Why Choose VoiceForge AI</h2>
              <p className="text-xl text-on-surface-variant max-w-2xl">The most advanced text-to-speech features powered by xAI.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel p-10 rounded-[3rem] border-white/5 flex flex-col items-center text-center gap-8 group hover:border-primary/30 transition-all"
                >
                  <div className="size-20 bg-white/5 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <f.icon className="size-10" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-2xl font-bold text-white">{f.title}</h3>
                    <p className="text-on-surface-variant leading-relaxed text-lg">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 mt-20">
          <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="size-6 bg-primary rounded-sm" />
              <h2 className="text-xl font-bold text-white tracking-tight">VoiceForge AI</h2>
            </div>
            <p className="text-on-surface-variant font-medium">© 2024 VoiceForge AI. All rights reserved.</p>
            <div className="flex gap-8 text-sm font-bold text-on-surface-variant">
               <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
               <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
               <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
