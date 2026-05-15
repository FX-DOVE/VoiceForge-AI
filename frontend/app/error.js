"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="w-full max-w-xl relative z-10 flex flex-col items-center text-center gap-8">
        <div className="size-20 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="size-10 text-red-400" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            Unexpected Error
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
            Something went wrong
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant max-w-md leading-relaxed">
            An unexpected error occurred while rendering this page. Try again, or
            return to the dashboard.
          </p>

          {error?.digest && (
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/70 mt-2">
              Reference: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            type="button"
            onClick={() => reset()}
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold"
          >
            <RefreshCcw className="mr-2 size-4" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-8 rounded-full border-white/10 hover:bg-white/5 font-bold"
          >
            <Link href="/dashboard">
              <Home className="mr-2 size-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
