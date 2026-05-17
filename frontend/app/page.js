"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PlayCircle, Mic, MemoryStick, Languages, Play, Pause, Loader2, Volume2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { voiceSamples } from "@/lib/voiceSamples";
import { getMediaUrl } from "@/lib/api/config";

/** Animated waveform bars shown when a voice is actively playing */
function WaveformBars() {
  return (
    <div className="flex items-end gap-[3px] h-4" aria-hidden>
      {[0.6, 1, 0.7, 0.9, 0.5, 0.8, 0.65].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-on-primary"
          animate={{ scaleY: [h, 1, h * 0.4, 0.9, h] }}
          transition={{
            duration: 0.9 + i * 0.07,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originY: 1, height: "100%" }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const audioRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [errorId, setErrorId] = useState(null);

  const handleListen = useCallback(async (id, audioPath) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Toggle off if already playing this voice
    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    // Stop any currently playing voice and clear any previous error flash
    audio.pause();
    audio.removeAttribute("src");
    setPlayingId(null);
    setErrorId(null);
    setLoadingId(id);

    try {
      // Load local static asset — zero API calls, zero credits deducted
      await new Promise((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener("canplay", onCanPlay);
          audio.removeEventListener("error", onErr);
          resolve();
        };
        const onErr = () => {
          audio.removeEventListener("canplay", onCanPlay);
          audio.removeEventListener("error", onErr);
          reject(new Error("Audio file not found"));
        };
        audio.addEventListener("canplay", onCanPlay);
        audio.addEventListener("error", onErr);
        audio.src = getMediaUrl(audioPath);
        audio.load();
      });

      setLoadingId(null);
      setPlayingId(id);
      await audio.play();
    } catch (err) {
      console.warn(`[VoiceSample] Could not load ${audioPath}:`, err.message);
      setLoadingId(null);
      setPlayingId(null);
      setErrorId(id);
      // Auto-clear error flash after 3 s so the button stays usable
      setTimeout(() => setErrorId((prev) => (prev === id ? null : prev)), 3000);
    }
  }, [playingId]);

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
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <TopNavBar />

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/8 rounded-full blur-[140px] opacity-60" />
        <div className="absolute bottom-1/3 right-0 w-[600px] h-[400px] bg-purple-600/8 rounded-full blur-[120px] opacity-50" />
      </div>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-7 text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest w-fit">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Powered by xAI Grok TTS
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Generate Natural<br />AI Voices with <span className="text-primary">xAI</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-on-surface-variant max-w-xl leading-relaxed">
              Convert any script into realistic speech in seconds. Studio-quality text-to-speech for creators and developers.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button className="h-12 sm:h-14 px-8 sm:px-10 bg-primary hover:bg-primary/90 text-on-primary rounded-full text-base sm:text-lg font-bold shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all hover:scale-105" asChild>
                <Link href="/signup">Start Free</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleListen(voiceSamples[0].id, voiceSamples[0].audioPath)}
                className="h-12 sm:h-14 px-8 sm:px-10 rounded-full border-white/10 hover:bg-white/5 text-base sm:text-lg font-bold transition-all"
              >
                {loadingId === voiceSamples[0].id ? (
                  <Loader2 className="mr-2 size-5 animate-spin" />
                ) : playingId === voiceSamples[0].id ? (
                  <Pause className="mr-2 size-5" />
                ) : (
                  <PlayCircle className="mr-2 size-5" />
                )}
                {playingId === voiceSamples[0].id ? "Playing..." : loadingId === voiceSamples[0].id ? "Loading..." : "Listen to Demo"}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div
              className="w-full aspect-video bg-center bg-no-repeat bg-cover rounded-[2rem] lg:rounded-[3rem] shadow-2xl border border-white/5 ring-1 ring-white/8"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB_7rCsegpxK0ELZVC4N_-mnZLMsYk7655oSzClcJhe3fPg_poYc2ZkaUNID2Yy7TaN6B40P7d_MgmTXhhSDhZ1wCrkmSqJ0JFX7riytNJ-bvlPwww8m4jFPthMhJWY0VgQJ1mXGNRv06bqnFItVp1DakVGVUNseaJ6tEVXTIDP1hrPqKIiI1wZw8KXASF3EJwwCo9PJeRP1vDjNsclSpHxabU9C-SCiBy5eG3QQlftsCkTvm1mQKa8Z10rzWLO7y8CcYS7EYui3no")' }}
            />
            <div className="absolute -top-16 -right-16 size-72 bg-primary/15 rounded-full blur-[100px] -z-10" />
            <div className="absolute -bottom-16 -left-16 size-72 bg-purple-500/15 rounded-full blur-[100px] -z-10" />
          </motion.div>
        </section>

        {/* Voice Samples */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col gap-2 mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Voice Samples</h2>
            <p className="text-on-surface-variant">Click to preview any xAI voice — played locally, no credits used.</p>
          </div>

          {/* xAI badge */}
          <div className="mb-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest">
            <Volume2 className="size-3" />
            Powered by xAI Grok TTS
          </div>

          <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
            {voiceSamples.map((v, i) => {
              const isPlaying = playingId === v.id;
              const isLoading = loadingId === v.id;
              const hasError = errorId === v.id;
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    "glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border-white/5 flex flex-col gap-5 group transition-all",
                    isPlaying
                      ? "border-primary/30 bg-white/[0.06] shadow-xl shadow-primary/5"
                      : "hover:bg-white/[0.04] hover:border-primary/15"
                  )}
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square overflow-hidden rounded-xl sm:rounded-[2rem] border border-white/10">
                    <div
                      className="absolute inset-0 bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${v.img})` }}
                    />
                    {/* Playing overlay */}
                    {isPlaying && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="size-16 rounded-full bg-primary/30 backdrop-blur-sm flex items-center justify-center border border-primary/40">
                          <WaveformBars />
                        </div>
                      </div>
                    )}
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80">
                        {v.category}
                      </span>
                    </div>
                  </div>

                  {/* Info + Button */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">{v.displayName}</h3>
                      <p className="text-primary font-bold uppercase tracking-widest text-[10px] mt-0.5">{v.description}</p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleListen(v.id, v.audioPath)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleListen(v.id, v.audioPath);
                        }
                      }}
                      disabled={isLoading}
                      aria-label={`${isPlaying ? "Pause" : "Play"} ${v.displayName} voice sample`}
                      aria-pressed={isPlaying}
                      className={cn(
                        "w-full h-11 rounded-full border-white/10 transition-all font-bold text-sm",
                        isPlaying
                          ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/25"
                          : hasError
                          ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                          : "hover:bg-primary hover:text-on-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="mr-2 size-4 fill-current" />
                      ) : hasError ? (
                        <AlertCircle className="mr-2 size-4" />
                      ) : (
                        <Play className="mr-2 size-4 fill-current" />
                      )}
                      {isLoading ? "Loading..." : isPlaying ? "Pause" : hasError ? "Audio not ready" : "Listen"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 flex flex-col items-center">
          <div className="text-center flex flex-col items-center gap-5 mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Why Choose VoiceForge AI</h2>
            <p className="text-base sm:text-lg lg:text-xl text-on-surface-variant max-w-2xl leading-relaxed">The most advanced text-to-speech features powered by xAI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 w-full">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-7 sm:p-10 rounded-2xl sm:rounded-[3rem] border-white/5 flex flex-col items-center text-center gap-6 sm:gap-8 group hover:border-primary/20 transition-all"
              >
                <div className="size-16 sm:size-20 bg-white/5 rounded-2xl sm:rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                  <f.icon className="size-8 sm:size-10" />
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{f.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm sm:text-base lg:text-lg">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full max-w-container-max px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative glass-panel rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 text-center flex flex-col items-center gap-6 overflow-hidden border-primary/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                Start creating today
              </h2>
              <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                Free voices, no credit card required. Premium xAI voices available on demand.
              </p>
              <Button className="h-14 px-12 bg-primary hover:bg-primary/90 text-on-primary rounded-full text-lg font-bold shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all hover:scale-105" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                <Mic className="size-4" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">VoiceForge AI</h2>
            </div>
            <p className="text-sm text-on-surface-variant font-medium">© 2024 VoiceForge AI. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-bold text-on-surface-variant">
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
