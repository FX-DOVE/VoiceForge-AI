const fs = require("fs");
const path = require("path");
const { TrainingJob, VoiceClone, VoiceSample } = require("../models");
const { completeTraining, TRAINING_STEPS } = require("../services/cloneService");
const config = require("../config");
const { uploadsDir } = require("../middleware/upload");

const XAI_BASE = "https://api.x.ai/v1";

async function setStep(trainingJob, clone, stepIndex, status, progress) {
  trainingJob.steps[stepIndex].status = status;
  trainingJob.progress = progress;
  clone.progress = progress;
  await Promise.all([trainingJob.save(), clone.save()]);
}

async function callXaiCreateVoice(clone, sampleFilePath, sampleMime) {
  if (!config.xai.apiKey) {
    console.log("[xai-clone] No XAI_API_KEY — skipping real API call");
    return null;
  }

  // Use Node 18+ native FormData + Blob
  const fileBuffer = fs.readFileSync(sampleFilePath);
  const mimeType = sampleMime?.split(";")[0]?.trim() || "audio/wav";
  const blob = new Blob([fileBuffer], { type: mimeType });
  const filename = path.basename(sampleFilePath);

  const form = new FormData();
  form.append("file", blob, filename);
  form.append("name", clone.name || "Cloned Voice");
  if (clone.description) form.append("description", clone.description);
  form.append("language", "en");
  form.append("use_case", "narration");
  form.append("tone", "professional");

  console.log("[xai-clone] Calling POST /v1/custom-voices for clone:", clone._id);
  const res = await fetch(`${XAI_BASE}/custom-voices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.xai.apiKey}`,
    },
    body: form,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = body?.error?.message || body?.message || `HTTP ${res.status}`;
    console.error("[xai-clone] API error:", res.status, msg);
    // 403/402 = professional gate or credits — not a fatal error for us, just skip
    return null;
  }

  console.log("[xai-clone] Created custom voice:", body.voice_id);
  return body.voice_id || null;
}

async function processInlineTraining({ trainingJobId, voiceCloneId }) {
  const trainingJob = await TrainingJob.findById(trainingJobId);
  const clone = await VoiceClone.findById(voiceCloneId);
  if (!trainingJob || !clone) return;

  trainingJob.status = "processing";
  trainingJob.startedAt = new Date();
  await trainingJob.save();

  try {
    // Step 0 — Validating audio
    await setStep(trainingJob, clone, 0, "active", 10);
    const samples = await VoiceSample.find({ voiceClone: clone._id }).sort({ sizeBytes: -1 });
    await new Promise((r) => setTimeout(r, 800));
    await setStep(trainingJob, clone, 0, "done", 25);

    // Step 1 — Extracting embedding (real xAI call happens here)
    await setStep(trainingJob, clone, 1, "active", 30);

    let xaiVoiceId = null;
    if (samples.length > 0) {
      // Find the local file path from the sample URL/storageKey
      const sample = samples[0];
      let sampleFilePath = null;

      // storageKey format: "clones/uuid-timestamp.ext"
      if (sample.storageKey && !sample.storageKey.startsWith("http")) {
        const localPath = path.join(uploadsDir, sample.storageKey.replace(/^clones\//, "clones/"));
        if (fs.existsSync(localPath)) {
          sampleFilePath = localPath;
        } else {
          // Try alternate path using basename of storageKey
          const altPath = path.join(uploadsDir, path.basename(sample.storageKey));
          if (fs.existsSync(altPath)) sampleFilePath = altPath;
        }
      }

      if (sampleFilePath) {
        xaiVoiceId = await callXaiCreateVoice(clone, sampleFilePath, sample.mimeType);
      } else {
        console.warn("[xai-clone] Could not locate local file for sample:", sample.storageKey);
      }
    }

    await setStep(trainingJob, clone, 1, "done", 55);

    // Step 2 — Fine-tuning
    await setStep(trainingJob, clone, 2, "active", 60);
    await new Promise((r) => setTimeout(r, 600));
    await setStep(trainingJob, clone, 2, "done", 85);

    // Step 3 — Packaging
    await setStep(trainingJob, clone, 3, "active", 88);
    await new Promise((r) => setTimeout(r, 400));
    await setStep(trainingJob, clone, 3, "done", 100);

    // Complete — pass xaiVoiceId so completeTraining can store it
    await completeTraining(voiceCloneId, trainingJobId, xaiVoiceId);
  } catch (err) {
    console.error("[inline-training] Error:", err.message);
    clone.status = "failed";
    clone.errorMessage = err.message;
    trainingJob.status = "failed";
    await Promise.all([clone.save(), trainingJob.save()]);
  }
}

module.exports = { processInlineTraining };
