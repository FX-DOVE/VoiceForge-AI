"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Clock, Sparkles, Bell, Lock, Crown, Upload, Settings2, Zap, CheckCircle2, Copy, Play, Square, RefreshCcw, User, Volume2, Loader2, Shield, Globe, Link2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api/client";
import { voicesApi, cloningApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceRecorder } from "@/components/cloning/voice-recorder";
import Link from "next/link";

export default function CloningPage() {
  const { user } = useAuth();
  const isEnterprise = user?.plan === "enterprise";
  const [step, setStep] = useState(1);
  const [inputMode, setInputMode] = useState("upload"); // upload | record
  const [clonedVoices, setClonedVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  // Sidebar preview state
  const [sidebarPlayingId, setSidebarPlayingId] = useState(null);
  const [sidebarPreviewLoadingId, setSidebarPreviewLoadingId] = useState(null);
  const sidebarAudioRef = useRef(null);

  async function handleSidebarPreview(v) {
    if (sidebarPlayingId === v.id) {
      sidebarAudioRef.current?.pause();
      setSidebarPlayingId(null);
      return;
    }
    if (sidebarAudioRef.current) {
      sidebarAudioRef.current.pause();
      sidebarAudioRef.current = null;
      setSidebarPlayingId(null);
    }
    if (!v.voiceSlug) return toast.error("No voice available to preview.");
    setSidebarPreviewLoadingId(v.id);
    try {
      // Use cached preview URL if available, otherwise fetch from API
      let url = v.voicePreviewUrl;
      if (!url) {
        const data = await voicesApi.preview(v.voiceSlug);
        url = data?.url;
      }
      if (!url) throw new Error("No preview URL");
      const audio = new Audio(url);
      sidebarAudioRef.current = audio;
      audio.onended = () => setSidebarPlayingId(null);
      audio.onerror = () => { 
        setSidebarPlayingId(null); 
        toast.error("Failed to load because no supported source was found.");
      };
      await audio.play();
      setSidebarPlayingId(v.id);
    } catch (err) {
      toast.error(err?.message || "Could not load preview.");
    } finally {
      setSidebarPreviewLoadingId(null);
    }
  }

  // Form State
  const [samples, setSamples] = useState([]);
  const [cloneId, setCloneId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [gender, setGender] = useState(""); // "male" | "female"
  const [shareToken, setShareToken] = useState(null);
  const [progress, setProgress] = useState(0);

  const fetchClones = useCallback(async () => {
    try {
      const data = await cloningApi.list();
      setClonedVoices(data.clones || []);
    } catch (err) {
      console.error("Failed to fetch clones", err);
    }
  }, []);

  useEffect(() => {
    fetchClones();
  }, [fetchClones]);

  // Polling for status if in step 3
  useEffect(() => {
    let timer;
    if (step === 3 && cloneId) {
      timer = setInterval(async () => {
        try {
          const data = await cloningApi.status(cloneId);
          setProgress(data.progress || 0);
          if (data.status === "ready") {
            toast.success("Voice is ready!");
            fetchClones();
            setStep(1); // Reset or go to library
            setCloneId(null);
            setSamples([]);
          } else if (data.status === "failed") {
            toast.error(data.errorMessage || "Training failed.");
            setStep(2);
          }
        } catch (err) {
          console.error("Status check failed", err);
        }
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [step, cloneId, fetchClones]);

  async function handleUpload(files) {
    if (!files?.length) return;
    const fileArray = Array.from(files);
    setSamples(fileArray);
    setLoading(true);
    try {
      const data = await cloningApi.upload(fileArray, cloneId);
      setCloneId(data.cloneId);
      toast.success("Samples uploaded.");
      setStep(2);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfigure() {
    if (!name.trim()) return toast.error("Please enter a name.");
    setLoading(true);
    try {
      const res = await cloningApi.configure({
        cloneId,
        name,
        description,
        visibility,
        gender,
      });
      if (res.shareToken) setShareToken(res.shareToken);
      setStep(3);
      handleStartTraining();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Configuration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTraining() {
    try {
      await cloningApi.start(cloneId);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to start training.");
      setStep(2);
    }
  }

  const steps = [
    { id: 1, label: "Upload Samples", icon: Upload },
    { id: 2, label: "Configure", icon: Settings2 },
    { id: 3, label: "Train", icon: Zap },
  ];

  return (
    <>
      {/* Sticky Desktop Header */}
      <header className="hidden lg:flex h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-30 items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-xl border border-primary/20">
            <Mic className="size-4" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-white">Voice Cloning</h2>
        </div>
      </header>

      <div className="max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-8 pb-16">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Voice Cloning</h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Create a custom AI voice by uploading high-quality audio samples.
            The better the input, the more accurate the clone.
          </p>
        </div>
        
        {!isEnterprise ? null : (
        <>
          {/* Wizard Progress */}
          <div className="flex gap-2 sm:gap-3">
          {steps.map((s) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id === 2 && !cloneId) return toast.error("Upload samples first.");
                  if (s.id === 3 && step < 3) return;
                  setStep(s.id);
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-xs sm:text-sm font-bold transition-all border",
                  active
                    ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_16px_rgba(59,130,246,0.12)]"
                    : done
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-white/[0.03] text-on-surface-variant border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                )}
              >
                {done ? <CheckCircle2 className="size-3.5" /> : <s.icon className="size-3.5" />}
                <span className="hidden sm:inline">{s.id}.</span>
                <span>{s.label}</span>
              </button>
            );
          })}
          </div>
        </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main Wizard Area */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {!isEnterprise ? (
              <div className="glass-panel p-8 sm:p-12 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center gap-6 min-h-[400px]">
                <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <Crown className="size-10" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Enterprise Feature</h2>
                <p className="text-on-surface-variant max-w-md">
                  Custom voice cloning is exclusive to our Enterprise plan. Upgrade your plan to create custom AI voices with incredible accuracy.
                </p>
                <Link href="/billing" className="mt-4 h-12 px-8 flex items-center justify-center bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold shadow-lg transition-all">
                  Upgrade to Enterprise
                </Link>
              </div>
            ) : (
             <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-panel p-5 sm:p-8 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] border-white/5 bg-white/[0.02] flex flex-col gap-8 lg:gap-10"
                  >
                     {/* Input mode toggle */}
                     <div className="flex p-1 rounded-full bg-white/5 border border-white/10 w-full sm:w-fit">
                        <button
                           type="button"
                           onClick={() => setInputMode("upload")}
                           className={cn(
                             "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 h-10 rounded-full text-xs sm:text-sm font-bold transition-all",
                             inputMode === "upload"
                               ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                               : "text-on-surface-variant hover:text-white"
                           )}
                        >
                           <Upload className="size-4" />
                           Upload Files
                        </button>
                        <button
                           type="button"
                           onClick={() => setInputMode("record")}
                           className={cn(
                             "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 h-10 rounded-full text-xs sm:text-sm font-bold transition-all",
                             inputMode === "record"
                               ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                               : "text-on-surface-variant hover:text-white"
                           )}
                        >
                           <Mic className="size-4" />
                           Record Voice
                        </button>
                     </div>

                     {inputMode === "upload" ? (
                       <label
                          htmlFor="cloning-upload-input"
                          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-6 sm:p-10 lg:p-16 group hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                       >
                           <input
                             id="cloning-upload-input"
                             type="file"
                             accept="audio/*,.wav,.mp3,.m4a"
                             multiple
                             className="hidden"
                             onChange={(e) => {
                               const files = Array.from(e.target.files || []);
                               setSamples(files);
                               handleUpload(files);
                             }}
                          />
                          <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                             <Upload className="size-10" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">Upload Audio Samples</h3>
                          <p className="text-sm sm:text-base text-on-surface-variant text-center max-w-sm mb-8 px-2">
                             Drag and drop your audio files here, or click to browse.
                             WAV, MP3, or M4A (Max 50MB).
                          </p>
                          <span className="h-12 px-8 inline-flex items-center bg-white/5 group-hover:bg-white/10 text-white rounded-full font-bold border border-white/10">
                             {loading ? "Uploading..." : "Select Files"}
                          </span>
                          {samples.length > 0 && (
                            <p className="mt-6 text-sm font-bold text-primary">
                              {samples.length} file{samples.length === 1 ? "" : "s"} selected
                            </p>
                          )}
                       </label>
                     ) : (
                       <VoiceRecorder onUse={(files) => handleUpload(files)} />
                     )}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { title: "High Quality Mic", desc: "Use a dedicated mic, avoid laptop built-ins.", icon: Mic },
                          { title: "No Noise", desc: "Record in a quiet room without echo.", icon: Volume2 },
                          { title: "Natural Speaking", desc: "Speak naturally, avoid extreme emotions.", icon: Zap },
                          { title: "Sufficient Length", desc: "Provide 3-5 minutes of continuous audio.", icon: Clock },
                        ].map((tip) => (
                          <div key={tip.title} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                             <tip.icon className="size-6 text-primary shrink-0" />
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">{tip.title}</span>
                                <p className="text-xs text-on-surface-variant mt-1">{tip.desc}</p>
                             </div>
                          </div>
                        ))}
                     </div>

                     <div className="flex justify-end pt-6 border-t border-white/5">
                        <Button
                          type="button"
                          onClick={() => {
                            if (!cloneId) {
                              if (samples.length > 0) handleUpload(samples);
                              else toast.error("Please upload or record audio samples first.");
                            } else {
                              setStep(2);
                            }
                          }}
                          disabled={loading}
                          className="h-12 px-10 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold"
                        >
                           {loading ? "Uploading..." : cloneId ? "Continue to Configure" : samples.length ? "Upload & Continue" : "Continue to Configure"}
                        </Button>
                     </div>
                  </motion.div>
                )}

                {step === 2 && (
                   <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-panel p-5 sm:p-8 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] border-white/5 bg-white/[0.02] flex flex-col gap-8 lg:gap-10"
                  >
                     <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-3">
                           <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Voice Name</label>
                           <Input 
                             placeholder="Enter a unique name for your voice" 
                             className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20" 
                             value={name}
                             onChange={(e) => setName(e.target.value)}
                           />
                        </div>

                        <div className="flex flex-col gap-3">
                           <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Voice Gender</label>
                           <p className="text-xs text-neutral-500 ml-1">Select the gender of the voice you're cloning. This helps us match the closest available voice.</p>
                           <div className="grid grid-cols-2 gap-3">
                              {[
                                { value: "female", Icon: User, label: "Female", desc: "Female voice characteristics" },
                                { value: "male", Icon: User, label: "Male", desc: "Male voice characteristics" },
                              ].map(({ value, Icon, label, desc }) => (
                                <label
                                  key={value}
                                  className={cn(
                                    "relative p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all",
                                    gender === value
                                      ? "border-primary/50 bg-primary/10"
                                      : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name="gender"
                                    className="sr-only"
                                    checked={gender === value}
                                    onChange={() => setGender(value)}
                                  />
                                  <div className="flex flex-col gap-3">
                                    <div className={cn(
                                      "size-9 rounded-xl flex items-center justify-center border transition-colors",
                                      gender === value
                                        ? "bg-primary/20 border-primary/40 text-primary"
                                        : "bg-white/5 border-white/10 text-on-surface-variant"
                                    )}>
                                      <Icon className="size-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <span className={cn("text-sm font-bold", gender === value ? "text-primary" : "text-white")}>{label}</span>
                                      <span className="text-[11px] text-on-surface-variant leading-tight">{desc}</span>
                                    </div>
                                    {gender === value && (
                                      <div className="absolute top-3 right-3 size-4 rounded-full bg-primary flex items-center justify-center">
                                        <CheckCircle2 className="size-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </label>
                              ))}
                           </div>
                        </div>

                        <div className="flex flex-col gap-3">
                           <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Visibility</label>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { value: "private",  Icon: Shield,  label: "Private",  desc: "Only you can use this voice" },
                                { value: "unlisted", Icon: Link2,   label: "Link Only", desc: "Anyone with the link" },
                                { value: "public",   Icon: Globe,   label: "Public",   desc: "Share with the community" },
                              ].map(({ value, Icon, label, desc }) => (
                                <label
                                  key={value}
                                  className={cn(
                                    "relative p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all",
                                    visibility === value
                                      ? "border-primary/50 bg-primary/10"
                                      : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name="visibility"
                                    className="sr-only"
                                    checked={visibility === value}
                                    onChange={() => setVisibility(value)}
                                  />
                                  <div className="flex flex-col gap-3">
                                    <div className={cn(
                                      "size-9 rounded-xl flex items-center justify-center border transition-colors",
                                      visibility === value
                                        ? "bg-primary/20 border-primary/40 text-primary"
                                        : "bg-white/5 border-white/10 text-on-surface-variant"
                                    )}>
                                      <Icon className="size-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <span className={cn("text-sm font-bold", visibility === value ? "text-primary" : "text-white")}>{label}</span>
                                      <span className="text-[11px] text-on-surface-variant leading-tight">{desc}</span>
                                    </div>
                                    {/* Selected indicator */}
                                    {visibility === value && (
                                      <div className="absolute top-3 right-3 size-4 rounded-full bg-primary flex items-center justify-center">
                                        <CheckCircle2 className="size-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </label>
                              ))}
                           </div>
                        </div>

                        <div className="flex flex-col gap-3">
                           <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Description (Optional)</label>
                           <textarea 
                             className="h-32 w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                             placeholder="Describe the characteristics of this voice..."
                             value={description}
                             onChange={(e) => setDescription(e.target.value)}
                           />
                        </div>
                     </div>

                     <div className="flex justify-between pt-6 border-t border-white/5">
                        <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-12 px-8 rounded-full font-bold" disabled={loading}>
                           Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleConfigure}
                          disabled={loading}
                          className="h-12 px-10 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        >
                           {loading ? "Configuring..." : "Start Training"}
                        </Button>
                     </div>
                  </motion.div>
                )}

                {step === 3 && (
                   <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-6 sm:p-12 lg:p-16 rounded-[1.5rem] sm:rounded-[2.5rem] lg:rounded-[4rem] border-white/5 bg-white/[0.02] flex flex-col items-center text-center gap-8 lg:gap-10"
                  >
                     <div className="relative">
                        <div className="size-32 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                           <Zap className="size-16 text-primary fill-current" />
                        </div>
                        <div className="absolute inset-0 size-32 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                     </div>
                     <div className="flex flex-col gap-4">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">Training in Progress</h2>
                        <p className="text-on-surface-variant text-sm sm:text-base lg:text-lg max-w-md px-2">
                           Our AI is processing your audio samples. This typically takes 2-5 minutes depending on the sample length.
                        </p>
                     </div>
                     <div className="w-full max-w-md bg-white/5 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                        />
                     </div>

                     {/* Share link — shown when visibility is unlisted */}
                     {shareToken && visibility === "unlisted" && (
                       <div className="w-full max-w-md flex flex-col gap-2">
                         <p className="text-xs text-on-surface-variant text-center font-bold uppercase tracking-widest">Share Link</p>
                         <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                           <Link2 className="size-4 text-primary shrink-0" />
                           <span className="flex-1 text-xs text-white truncate select-all">
                             {typeof window !== "undefined" ? `${window.location.origin}/cloning/shared/${shareToken}` : `/cloning/shared/${shareToken}`}
                           </span>
                           <button
                             type="button"
                             onClick={() => {
                               const url = `${window.location.origin}/cloning/shared/${shareToken}`;
                               navigator.clipboard.writeText(url).then(() => toast.success("Link copied!"));
                             }}
                             className="size-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors shrink-0"
                             aria-label="Copy share link"
                           >
                             <Copy className="size-3.5" />
                           </button>
                         </div>
                       </div>
                     )}
                     <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                        <span className="animate-pulse">{progress < 100 ? "Processing Neural Weights..." : "Completing..."}</span>
                        <span>{progress}%</span>
                     </div>
                     <Button type="button" variant="outline" onClick={() => {
                        setStep(1);
                        setCloneId(null);
                        setSamples([]);
                        setName("");
                        setDescription("");
                        setVisibility("private");
                        setShareToken(null);
                        setProgress(0);
                     }} className="mt-4 h-12 px-10 rounded-full border-white/10 hover:bg-white/5 font-bold">
                        Clone Another Voice
                     </Button>
                  </motion.div>
                )}
             </AnimatePresence>
            )}
          </div>

          {/* Right Column: Library */}
          <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-white">My Cloned Voices</h3>
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold text-primary hover:bg-primary/10" asChild>
                      <a href="/cloning/library">View all</a>
                   </Button>
                   <Button variant="ghost" size="icon" className="size-10 rounded-full hover:bg-white/5" onClick={fetchClones}>
                      <RefreshCcw className="size-4 text-on-surface-variant" />
                   </Button>
                </div>
             </div>
             <div className="flex flex-col gap-3">
                {!clonedVoices.length && (
                  <p className="text-xs text-neutral-600 text-center py-10 glass-panel rounded-2xl border-white/5">
                    No cloned voices yet.<br />Upload samples to get started.
                  </p>
                )}
                {clonedVoices.map((v, i) => (
                  <motion.div
                    key={v.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border-white/5 bg-white/[0.02] flex items-center justify-between gap-3 group hover:bg-white/[0.05] transition-all"
                  >
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "size-12 rounded-2xl flex items-center justify-center",
                          v.status === "ready" ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-400"
                        )}>
                           <Mic className="size-6" />
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="text-sm font-bold text-white truncate">{v.name || "Unnamed"}</span>
                           <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={cn(
                                "size-1.5 rounded-full shrink-0",
                                v.status === "ready" ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-orange-400 animate-pulse"
                              )} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                {v.status === "ready" ? "Ready" : "Training"}
                              </span>
                              {v.visibility === "public" ? (
                                <Globe className="size-3 text-primary" />
                              ) : v.visibility === "unlisted" ? (
                                <Link2 className="size-3 text-on-surface-variant" />
                              ) : (
                                <Shield className="size-3 text-on-surface-variant" />
                              )}
                           </div>
                        </div>
                     </div>
                     {v.status === "training" ? (
                       <span className="text-xs font-bold text-primary">{v.progress}%</span>
                     ) : v.status === "ready" ? (
                       <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         {/* Preview */}
                         {v.voiceSlug && (
                           <button
                             type="button"
                             onClick={() => handleSidebarPreview(v)}
                             disabled={sidebarPreviewLoadingId === v.id}
                             className={cn(
                               "size-8 rounded-full flex items-center justify-center border transition-all",
                               sidebarPlayingId === v.id
                                 ? "bg-primary/20 border-primary/40 text-primary"
                                 : "bg-white/5 border-white/10 text-on-surface-variant hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                             )}
                             aria-label={sidebarPlayingId === v.id ? "Stop" : "Preview"}
                           >
                             {sidebarPreviewLoadingId === v.id ? (
                               <Loader2 className="size-3 animate-spin" />
                             ) : sidebarPlayingId === v.id ? (
                               <Square className="size-3 fill-current" />
                             ) : (
                               <Play className="size-3 fill-current" />
                             )}
                           </button>
                         )}
                         {/* Use */}
                         <Link
                           href={`/studio${v.voiceSlug ? `?voice=${v.voiceSlug}` : ""}`}
                           className="h-8 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-xs font-bold flex items-center transition-all"
                         >
                           Use
                         </Link>
                       </div>
                     ) : (
                       <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{v.status}</span>
                     )}
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
