"use client";

import Link from "next/link";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { Button } from "@/components/ui/button";
import { useCloningStore } from "@/stores/cloning-store";

export default function CloningUploadPage() {
  const setSampleFiles = useCloningStore((s) => s.setSampleFiles);

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Upload samples</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Provide clean recordings so the model can learn timbre, pacing, and
            tone.
          </p>
          <div className="mt-6">
            <UploadDropzone onFiles={setSampleFiles} />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button asChild>
            <Link href="/cloning/configure">Continue to Configure</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
