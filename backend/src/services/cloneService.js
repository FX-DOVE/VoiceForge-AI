const { VoiceClone, VoiceSample, TrainingJob, Voice, Notification } = require("../models");
const { uploadFromPath } = require("../integrations/storage");
const { enqueueTrainingJob } = require("../jobs/trainingQueue");

const TRAINING_STEPS = [
  { key: "validate", label: "Validating audio samples" },
  { key: "extract", label: "Extracting voice embedding" },
  { key: "finetune", label: "Fine-tuning voice model" },
  { key: "package", label: "Packaging voice profile" },
];

async function createDraftClone(userId) {
  return VoiceClone.create({ user: userId, status: "uploading" });
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

async function configureClone(userId, { cloneId, name, description, visibility }) {
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
  clone.visibility = visibility || "private";
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

async function completeTraining(voiceCloneId, trainingJobId) {
  const clone = await VoiceClone.findById(voiceCloneId);
  const job = await TrainingJob.findById(trainingJobId);
  if (!clone || !job) return;

  const slug = `clone-${clone._id.toString().slice(-8)}`;
  const voice = await Voice.create({
    slug,
    name: clone.name,
    description: clone.description,
    type: "cloned",
    owner: clone.user,
    isPublic: clone.visibility === "public",
    xaiVoiceId: clone.name,
    tags: ["Cloned"],
    creator: "You",
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

module.exports = {
  uploadSamples,
  configureClone,
  startTraining,
  getCloneStatus,
  completeTraining,
  TRAINING_STEPS,
};
