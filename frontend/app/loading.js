import { AudioLines } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-50 animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="size-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <AudioLines className="size-10 text-primary animate-pulse" />
          </div>
          <div className="absolute inset-0 size-20 border-2 border-primary border-t-transparent rounded-[2rem] animate-spin" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
