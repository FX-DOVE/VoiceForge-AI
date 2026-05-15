"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const steps = [
  { href: "/cloning/upload", label: "Upload" },
  { href: "/cloning/configure", label: "Configure" },
  { href: "/cloning/train", label: "Train" },
];

export function CloningWizardHeader() {
  const pathname = usePathname();
  const index = Math.max(
    0,
    steps.findIndex((s) => s.href === pathname)
  );

  return (
    <div className="border-b border-outline-variant/40 bg-background/60 px-4 py-6 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Voice cloning
          </p>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Create a new voice
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {steps.map((s, i) => {
            const done = i < index;
            const active = i === index;
            return (
              <div key={s.href} className="flex items-center gap-2">
                <Link
                  href={s.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : done
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-white/10 text-on-surface-variant hover:border-white/20"
                  )}
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/5 text-xs font-bold">
                    {i + 1}
                  </span>
                  {s.label}
                </Link>
                {i < steps.length - 1 && (
                  <span className="hidden text-on-surface-variant sm:inline">
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <motion.div
          className="h-1 overflow-hidden rounded-full bg-white/10"
          initial={false}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-action to-primary"
            initial={false}
            animate={{ width: `${((index + 1) / steps.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </motion.div>
      </div>
    </div>
  );
}
