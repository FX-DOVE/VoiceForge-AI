"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { Button } from "@/components/ui/button";
import { useCloningStore } from "@/stores/cloning-store";
import { cloningApi } from "@/lib/api";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

export default function CloningUploadPage() {
  const router = useRouter();
  const { sampleFiles, setSampleFiles, cloneId, setCloneId } = useCloningStore();
  const [uploading, setUploading] = useState(false);

  async function handleContinue() {
    if (!sampleFiles?.length) {
      toast.error("Upload at least one audio sample.");
      return;
    }
    setUploading(true);
    try {
      const data = await cloningApi.upload(sampleFiles, cloneId);
      setCloneId(data.cloneId);
      toast.success("Samples uploaded successfully.");
      router.push("/cloning/configure");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

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
          <Button onClick={handleContinue} disabled={uploading}>
            {uploading ? "Uploading..." : "Continue to Configure"}
          </Button>
        </div>
      </div>
    </div>
  );
}
