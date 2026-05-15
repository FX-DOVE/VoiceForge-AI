import Link from "next/link";
import { ArrowLeft, Home, Search, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="w-full max-w-xl relative z-10 flex flex-col items-center text-center gap-8">
        <div className="size-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <AudioLines className="size-10 text-primary" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            Error 404
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight leading-none">
            Page Not Found
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant max-w-md leading-relaxed">
            The page you're looking for has gone silent. It may have been moved,
            renamed, or never existed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            asChild
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold"
          >
            <Link href="/dashboard">
              <Home className="mr-2 size-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-8 rounded-full border-white/10 hover:bg-white/5 font-bold"
          >
            <Link href="/help">
              <Search className="mr-2 size-4" />
              Visit Help Center
            </Link>
          </Button>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-white transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
