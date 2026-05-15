"use client";

import { useState } from "react";
import { studioVoices } from "@/lib/mock-data";
import Image from "next/image";
import { Play, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VoicesPage() {
  const [search, setSearch] = useState("");

  const filteredVoices = studioVoices.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-1 flex-col bg-background">
      <main className="flex-1 container-custom py-8 lg:py-12 space-y-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
             <h1 className="text-3xl font-bold tracking-tight">Voice Library</h1>
             <p className="text-neutral-400 mt-1">Explore our collection of studio-quality AI voices.</p>
           </div>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search voices or styles..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVoices.map((v) => (
            <Link
              href={`/voices/${v.id}`}
              key={v.id || v.name}
              className="glass-card group relative p-6 flex flex-col gap-6 hover:bg-white/[0.05] transition-all"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/5">
                <Image
                  src={v.img}
                  alt={v.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                {v.type === "community" && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest border border-purple-500/30 backdrop-blur-md">
                    Community
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold truncate">{v.name}</h3>
                  <div className="flex flex-wrap gap-x-1.5 gap-y-1 mt-2">
                    {v.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">{tag}</span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="size-12 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-600 transition-all transform active:scale-95 shadow-lg"
                  aria-label={`Play sample of ${v.name}`}
                >
                  <Play className="size-5 fill-current" />
                </button>
              </div>
              <span className="w-full mt-2 inline-flex items-center justify-center text-xs text-neutral-400 group-hover:text-blue-500 transition-colors font-bold">
                View voice <ArrowRight className="ml-2 size-3" />
              </span>
            </Link>
          ))}
        </div>
        
        {filteredVoices.length === 0 && (
          <div className="py-20 text-center">
             <p className="text-neutral-500">No voices found matching "{search}"</p>
          </div>
        )}
      </main>
    </div>
  );
}
