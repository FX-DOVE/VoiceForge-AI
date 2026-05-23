export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}

export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function expiryLabel(expiresAt) {
  if (!expiresAt) return "No expiry";
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (days <= 2) return `Deletes in ${days} day${days === 1 ? "" : "s"}`;
  return `Deletes in ${days} days`;
}

export function mapGenerationToListItem(gen) {
  const warning =
    gen.expiresAt &&
    new Date(gen.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
  const expired = gen.expiresAt && new Date(gen.expiresAt) < new Date();

  // Real backend statuses: queued | processing | completed | failed
  const rawStatus = gen.status || "completed";

  let displayStatus = "neutral";
  if (rawStatus === "queued") displayStatus = "queued";
  else if (rawStatus === "processing") displayStatus = "processing";
  else if (rawStatus === "failed") displayStatus = "failed";
  else if (expired) displayStatus = "expired";
  else if (warning) displayStatus = "warning";

  // Format processing time nicely
  let processingTime = null;
  if (gen.processingTimeMs && gen.processingTimeMs > 0) {
    const seconds = Math.round(gen.processingTimeMs / 1000);
    processingTime = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  return {
    id: gen.id,
    text: gen.text,
    voice: gen.voiceLabel || "Unknown voice",
    time: formatDate(gen.createdAt),
    duration: formatDuration(gen.durationSeconds),
    expiry: expiryLabel(gen.expiresAt),
    status: displayStatus,
    rawStatus,
    audioUrl: gen.playbackUrl || gen.audioUrl,
    downloadUrl: gen.downloadUrl,
    processingTime,           // e.g. "47s"
    processingTimeMs: gen.processingTimeMs || null,
  };
}
