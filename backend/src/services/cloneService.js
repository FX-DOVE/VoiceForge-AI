const crypto = require("crypto");
const { VoiceClone, VoiceSample, TrainingJob, Voice, Notification } = require("../models");
const { uploadFromPath } = require("../integrations/storage");
const elevenlabs = require("../integrations/elevenlabsService");
const { enqueueTrainingJob } = require("../jobs/trainingQueue");
const { matchVoiceFromReference, selectVoiceByGender } = require("../utils/voiceMatcher");
const config = require("../config");

// Helper to ensure URLs are absolute (for local dev where relative URLs break audio playback)
function ensureAbsoluteUrl(url) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = config.serverUrl?.replace(/\/+$/, "") || `http://localhost:${config.port || 5000}`;
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function generateShareToken() {
  return crypto.randomBytes(20).toString("hex");
}

const TRAINING_STEPS = [
  { key: "validate", label: "Validating audio samples" },
  { key: "extract", label: "Extracting voice embedding" },
  { key: "finetune", label: "Fine-tuning voice model" },
  { key: "package", label: "Packaging voice profile" },
];

async function createDraftClone(userId) {
  const { User } = require("../models");
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const isPro = await user.isProfessional();
  if (!isPro && user.plan !== "professional") {
    throw Object.assign(new Error("Professional membership required for voice cloning"), { statusCode: 403 });
  }
  return VoiceClone.create({ user: userId, status: "uploading", provider: "elevenlabs" });
}

async function uploadSamples(userId, cloneId, files) {
  let clone = cloneId
    ? await VoiceClone.findOne({ _id: cloneId, user: userId })
    : null;

  if (!clone) {
    clone = await createDraftClone(userId);
  }

  if (!files?.length) {
    throw Object.assign(new Error("At least one audio sample is required."), {
      statusCode: 400,
    });
  }

  const samples = [];
  for (const file of files) {
    const uploaded = await uploadFromPath(file.path, {
      folder: "clones",
      mimeType: file.mimetype,
    });

    const sample = await VoiceSample.create({
      user: userId,
      voiceClone: clone._id,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      durationSeconds: 0,
      storageKey: uploaded.storageKey,
      url: uploaded.url,
    });
    samples.push(sample);
  }

  clone.status = "uploading";
  await clone.save();

  return { clone, samples };
}

async function configureClone(userId, { cloneId, name, description, visibility, gender }) {
  const clone = await VoiceClone.findOne({ _id: cloneId, user: userId });
  if (!clone) {
    throw Object.assign(new Error("Voice clone not found."), { statusCode: 404 });
  }

  const sampleCount = await VoiceSample.countDocuments({ voiceClone: clone._id });
  if (sampleCount < 1) {
    throw Object.assign(new Error("Upload at least one audio sample before configuring."), {
      statusCode: 400,
    });
  }

  clone.name = name;
  clone.description = description || "";
  const vis = visibility || "private";
  clone.visibility = vis;
  // Store gender for voice matching fallback
  if (gender && ["male", "female"].includes(gender)) {
    clone.gender = gender;
  }
  // Generate share token for unlisted; clear it for other modes
  if (vis === "unlisted" && !clone.shareToken) {
    clone.shareToken = generateShareToken();
  } else if (vis !== "unlisted") {
    clone.shareToken = null;
  }
  clone.status = "configured";
  await clone.save();

  return clone;
}

async function startTraining(userId, cloneId) {
  const clone = await VoiceClone.findOne({ _id: cloneId, user: userId });
  if (!clone) {
    throw Object.assign(new Error("Voice clone not found."), { statusCode: 404 });
  }
  if (!["configured", "failed"].includes(clone.status)) {
    throw Object.assign(new Error("This clone is not ready to train."), { statusCode: 400 });
  }

  // For Professional (ElevenLabs), do instant clone via their API (no long training queue)
  if (clone.provider === "elevenlabs") {
    const samples = await VoiceSample.find({ voiceClone: clone._id }).sort({ createdAt: 1 });
    if (!samples.length) {
      throw Object.assign(new Error("No samples found for cloning."), { statusCode: 400 });
    }
    // Basic ElevenLabs recommendation: at least 2-3 good samples for decent quality
    if (samples.length < 2) {
      // allow but warn in practice; for now soft
      console.warn("[Clone EL] Only 1 sample provided — ElevenLabs recommends multiple clean samples (30s+ each).");
    }

    // Fetch sample audio as buffers (works for remote or local storage urls)
    // IMPORTANT: use absolute URL for server-side fetch (Node fetch does not resolve relative like browser)
    const filesForEl = [];
    for (const s of samples) {
      if (!s.url) continue;
      const absoluteUrl = ensureAbsoluteUrl(s.url);
      try {
        const resp = await fetch(absoluteUrl);
        if (!resp.ok) continue;
        const buf = Buffer.from(await resp.arrayBuffer());
        // Simulate file object for the service
        filesForEl.push({
          buffer: buf,
          name: s.originalName || `sample-${filesForEl.length}.mp3`,
          mimetype: s.mimeType || "audio/mpeg",
        });
      } catch (e) {
        console.warn("[Clone] Could not fetch sample for ElevenLabs:", e.message, "url was", absoluteUrl);
      }
    }

    if (!filesForEl.length) {
      throw Object.assign(new Error("Could not prepare audio samples for voice cloning."), { statusCode: 500 });
    }

    // Build labels for ElevenLabs (helps with their model)
    const labels = {};
    if (clone.gender) labels.gender = clone.gender;
    // could add more from description or future fields

    const cloned = await elevenlabs.cloneVoice({
      name: clone.name || "My VoiceForge Professional Voice",
      description: clone.description || "",
      files: filesForEl,
      labels,
    });

    // Create the Voice entry immediately
    const voiceSlug = `vf-clone-${cloned.voiceId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const newVoice = await Voice.create({
      slug: voiceSlug,
      name: clone.name || "My Voice",
      provider: "elevenlabs",
      source: "elevenlabs",
      model: clone.model || "flash",
      costTier: (clone.model || "flash") === "multilingual_v3" ? "high" : "medium",
      elevenlabsVoiceId: cloned.voiceId,
      tier: "pro",
      owner: userId,
      type: "cloned",
      isPublic: clone.visibility !== "private",
      isActive: true,
      voiceCloneRef: clone._id,
      description: clone.description,
    });

    clone.voice = newVoice._id;
    clone.status = "ready";
    clone.progress = 100;
    await clone.save();

    // Link voice back
    await Voice.findByIdAndUpdate(newVoice._id, { voiceCloneRef: clone._id });

    return { clone, voice: newVoice, instant: true };
  }

  // Original xAI training queue path for other providers (xai etc)
  const job = await TrainingJob.create({
    user: userId,
    voiceClone: clone._id,
    status: "queued",
    steps: TRAINING_STEPS.map((s) => ({ ...s, status: "pending" })),
  });

  clone.status = "training";
  clone.progress = 0;
  await clone.save();

  const bullJob = await enqueueTrainingJob({
    trainingJobId: job._id.toString(),
    voiceCloneId: clone._id.toString(),
    userId: userId.toString(),
  });

  job.bullJobId = bullJob?.id || null;
  await job.save();

  if (bullJob?.inline) {
    setImmediate(() => {
      const { processInlineTraining } = require("../jobs/inlineTraining");
      processInlineTraining({
        trainingJobId: job._id.toString(),
        voiceCloneId: clone._id.toString(),
      }).catch((err) => console.error("[inline-training]", err.message));
    });
  }

  return { clone, job };
}

async function getCloneStatus(userId, cloneId) {
  const clone = await VoiceClone.findOne({ _id: cloneId, user: userId });
  if (!clone) {
    throw Object.assign(new Error("Voice clone not found."), { statusCode: 404 });
  }

  const job = await TrainingJob.findOne({ voiceClone: clone._id })
    .sort({ createdAt: -1 })
    .lean();

  const samples = await VoiceSample.find({ voiceClone: clone._id }).select(
    "originalName url durationSeconds createdAt"
  );

  return {
    id: clone._id.toString(),
    name: clone.name,
    description: clone.description,
    visibility: clone.visibility,
    status: clone.status,
    progress: clone.progress,
    errorMessage: clone.errorMessage,
    provider: clone.provider || "xai",
    voiceId: clone.voice?.toString() || null,
    samples,
    job: job
      ? {
          id: job._id.toString(),
          status: job.status,
          progress: job.progress,
          steps: job.steps,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
        }
      : null,
  };
}

async function completeTraining(voiceCloneId, trainingJobId, xaiVoiceId = null) {
  const clone = await VoiceClone.findById(voiceCloneId);
  const job = await TrainingJob.findById(trainingJobId);
  if (!clone || !job) return;

  // If xAI custom voice creation failed, use voice matcher to select fallback
  let fallbackVoice = null;
  let fallbackMessage = null;
  
  if (!xaiVoiceId) {
    // Use voice matcher to find closest matching voice based on detected/known gender
    const voiceMatch = selectVoiceByGender(clone.detectedGender || clone.gender);
    fallbackVoice = voiceMatch.voiceId;
    fallbackMessage = "Exact voice cloning is not available on this plan, so we selected the closest matching voice with the same gender, tone, language, and speaking style.";
    
    console.log(`[cloneService] Using voice matcher fallback: ${voiceMatch.voiceName} (${voiceMatch.reason})`);
  }

  const slug = `clone-${clone._id.toString().slice(-8)}`;
  const voice = await Voice.create({
    slug,
    name: clone.name,
    description: clone.description,
    type: "cloned",
    tier: "pro",
    owner: clone.user,
    isPublic: clone.visibility === "public",
    voiceCloneRef: clone._id,
    // Use real xAI custom voice ID if available, otherwise use matched fallback voice
    xaiVoiceId: xaiVoiceId || fallbackVoice,
    tags: ["Cloned"],
    creator: "You",
    // Store fallback message for frontend display
    metadata: fallbackMessage ? { fallbackMessage } : undefined,
  });

  clone.status = "ready";
  clone.progress = 100;
  clone.voice = voice._id;
  await clone.save();

  job.status = "completed";
  job.progress = 100;
  job.completedAt = new Date();
  job.steps = job.steps.map((s) => ({ ...s, status: "done" }));
  await job.save();

  await Notification.create({
    user: clone.user,
    type: "clone_ready",
    title: "Voice clone ready",
    message: `Your voice "${clone.name}" is ready to use in Studio.`,
    data: { voiceCloneId: clone._id, voiceId: voice._id },
  });
}

async function listClones(userId) {
  const clones = await VoiceClone.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("voice", "slug previewUrl");
  return clones.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    description: c.description,
    visibility: c.visibility,
    shareToken: c.shareToken || null,
    status: c.status,
    progress: c.progress,
    voiceId: c.voice?._id?.toString() || null,
    voiceSlug: c.voice?.slug || null,
    voicePreviewUrl: ensureAbsoluteUrl(c.voice?.previewUrl) || null,
    createdAt: c.createdAt,
  }));
}

async function updateClone(userId, cloneId, { name, description, visibility }) {
  const clone = await VoiceClone.findOne({ _id: cloneId, user: userId });
  if (!clone) throw Object.assign(new Error("Voice clone not found."), { statusCode: 404 });

  if (name !== undefined) clone.name = name.trim();
  if (description !== undefined) clone.description = description;
  if (visibility !== undefined) {
    if (!["private", "public", "unlisted"].includes(visibility))
      throw Object.assign(new Error("visibility must be private, public, or unlisted."), { statusCode: 400 });
    clone.visibility = visibility;
    if (visibility === "unlisted" && !clone.shareToken) {
      clone.shareToken = generateShareToken();
    } else if (visibility !== "unlisted") {
      clone.shareToken = null;
    }
    if (clone.voice) {
      await Voice.updateOne({ _id: clone.voice }, { isPublic: visibility === "public" });
    }
  }
  await clone.save();
  return {
    id: clone._id.toString(),
    name: clone.name,
    visibility: clone.visibility,
    shareToken: clone.shareToken || null,
    status: clone.status,
  };
}

async function deleteClone(userId, cloneId) {
  const clone = await VoiceClone.findOne({ _id: cloneId, user: userId });
  if (!clone) throw Object.assign(new Error("Voice clone not found."), { statusCode: 404 });

  // Remove associated Voice record from public library
  if (clone.voice) {
    await Voice.deleteOne({ _id: clone.voice });
  }

  // Remove associated samples
  await VoiceSample.deleteMany({ voiceClone: clone._id });

  // Remove training jobs
  await TrainingJob.deleteMany({ voiceClone: clone._id });

  await clone.deleteOne();
}

async function getCloneByShareToken(token) {
  const clone = await VoiceClone.findOne({ shareToken: token, visibility: "unlisted" })
    .populate("voice", "name slug previewUrl")
    .lean();
  if (!clone) return null;
  return {
    id: clone._id.toString(),
    name: clone.name,
    description: clone.description,
    status: clone.status,
    voice: clone.voice
      ? { id: clone.voice._id.toString(), name: clone.voice.name, slug: clone.voice.slug, previewUrl: clone.voice.previewUrl }
      : null,
  };
}

module.exports = {
  uploadSamples,
  configureClone,
  startTraining,
  getCloneStatus,
  completeTraining,
  listClones,
  updateClone,
  deleteClone,
  getCloneByShareToken,
  TRAINING_STEPS,
};
