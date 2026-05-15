"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bolt, Play, Settings2, Trash2, History, Info, Mic } from "lucide-react";
import { studioVoices } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function StudioPage() {
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(1);
  const [stability, setStability] = useState(75);
  const [selectedVoice, setSelectedVoice] = useState(studioVoices[0].name);
  const maxChars = 5000;
  const count = text.length;

  const speedLabel = useMemo(() => `${speed.toFixed(1)}x`, [speed]);
  const stabilityLabel = useMemo(() => `${stability}%`, [stability]);

  return (
    <>
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        <header className="hidden lg:flex h-20 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="size-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
               <Mic className="size-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Voice Studio</h2>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" className="rounded-full text-on-surface-variant hover:text-white" onClick={() => setText("")}>
               <Trash2 className="size-4 mr-2" />
               Clear
             </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 max-w-container-max mx-auto w-full">

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Script Input */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            <div className="flex items-center justify-between">
               <div>
                 <h1 className="text-3xl font-bold tracking-tight">Generate Audio</h1>
                 <p className="text-neutral-400 mt-1">Transform your script into high-fidelity speech.</p>
               </div>
               <Button variant="outline" size="sm" className="hidden sm:flex border-white/5 bg-white/5 rounded-full" onClick={() => setText("")}>
                 <Trash2 className="size-4 mr-2" />
                 Clear Script
               </Button>
            </div>

            <div className="glass-panel overflow-hidden border-white/10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                   <Settings2 className="size-4 text-blue-500" />
                   <span>Text Input</span>
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  {count.toLocaleString()} / {maxChars.toLocaleString()}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                className="w-full min-h-[400px] bg-transparent p-6 text-lg leading-relaxed text-neutral-200 outline-none placeholder:text-neutral-600 resize-none"
                placeholder="Paste your script here... For better results, use punctuation and paragraph breaks."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass-panel p-6 border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">Generation Speed</label>
                    <span className="text-xs font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{speedLabel}</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <p className="text-[11px] text-neutral-500">Faster speeds may slightly impact naturalness.</p>
               </div>
               
               <div className="glass-panel p-6 border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">Stability</label>
                    <span className="text-xs font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{stabilityLabel}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={stability}
                    onChange={(e) => setStability(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <p className="text-[11px] text-neutral-500">Higher values produce more consistent but less expressive speech.</p>
               </div>
            </div>
          </div>

          {/* Right Column: Voice Selection & Action (Sticky on Desktop) */}
          <div className="w-full lg:w-[400px] lg:sticky lg:top-[100px] space-y-6">
            <div className="glass-panel flex flex-col border-white/10 h-full max-h-[700px]">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h3 className="font-bold">Select Voice</h3>
                <History className="size-4 text-neutral-500 cursor-pointer hover:text-white transition-colors" />
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {studioVoices.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVoice(v.name)}
                    className={`group w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                      selectedVoice === v.name 
                      ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                      : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-white/10">
                        <Image src={v.img} alt={v.name} fill className="object-cover" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold">{v.name}</h4>
                        <div className="flex gap-1 mt-1">
                          {v.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedVoice === v.name ? (
                      <div className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    ) : (
                      <Play className="size-4 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.01] space-y-4">
                <Button 
                  className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xl shadow-blue-900/20 group"
                  onClick={() => toast.success("Audio generation started!")}
                  disabled={!text}
                >
                  <Bolt className="size-5 mr-2 fill-current" />
                  Generate Audio
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                   <Info className="size-3" />
                   <span>Estimated cost: 12 credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </>
  );
}

