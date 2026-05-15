"use client";

import { useCallback, useState } from "react";
import { Upload, FileAudio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
export function UploadDropzone({
  onFiles,
  className,
  accept = "audio/*,.wav,.mp3,.m4a",
}) {
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState([]);

  const addFiles = useCallback(
    (list) => {
      const next = Array.from(list || []);
      setFiles((prev) => {
        const merged = [...prev, ...next].slice(0, 8);
        onFiles?.(merged);
        return merged;
      });
    },
    [onFiles]
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload voice samples"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("vf-clone-input")?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          drag
            ? "border-action bg-action/10"
            : "border-outline-variant bg-surface-container-low/40 hover:border-action/50"
        )}
        onClick={() => document.getElementById("vf-clone-input")?.click()}
      >
        <Upload className="size-10 text-primary" aria-hidden />
        <div>
          <p className="text-base font-semibold text-on-surface">
            Drag & drop audio samples
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            WAV, MP3, or M4A — at least 1 minute total
          </p>
        </div>
        <input
          id="vf-clone-input"
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container/40 p-3"
          >
            {files.map((f, i) => (
              <motion.li
                key={`${f.name}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-sm text-on-surface"
              >
                <FileAudio className="size-4 text-primary" aria-hidden />
                <span className="truncate">{f.name}</span>
                <span className="ml-auto text-xs text-on-surface-variant">
                  {(f.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant">
        <span className="rounded-full border border-white/10 px-2 py-0.5">
          Max 8 files
        </span>
        <span className="rounded-full border border-white/10 px-2 py-0.5">
          Clear audio preferred
        </span>
      </div>
    </div>
  );
}
