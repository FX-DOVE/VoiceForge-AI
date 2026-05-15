require("dotenv").config();
const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const config = require("../config");
const { getRedisConnection } = require("../config/redis");
const { QUEUE_NAME } = require("./trainingQueue");
const { TrainingJob, VoiceClone } = require("../models");
const { completeTraining, TRAINING_STEPS } = require("../services/cloneService");

async function processTrainingJob(job) {
  const { trainingJobId, voiceCloneId } = job.data;
  const trainingJob = await TrainingJob.findById(trainingJobId);
  const clone = await VoiceClone.findById(voiceCloneId);

  if (!trainingJob || !clone) return;

  trainingJob.status = "processing";
  trainingJob.startedAt = new Date();
  await trainingJob.save();

  for (let i = 0; i < TRAINING_STEPS.length; i++) {
    const step = TRAINING_STEPS[i];
    trainingJob.steps[i].status = "active";
    trainingJob.progress = Math.round(((i + 0.5) / TRAINING_STEPS.length) * 100);
    clone.progress = trainingJob.progress;
    await Promise.all([trainingJob.save(), clone.save()]);

    await new Promise((r) => setTimeout(r, 2000));

    trainingJob.steps[i].status = "done";
    trainingJob.progress = Math.round(((i + 1) / TRAINING_STEPS.length) * 100);
    clone.progress = trainingJob.progress;
    await Promise.all([trainingJob.save(), clone.save()]);
  }

  await completeTraining(voiceCloneId, trainingJobId);
}

async function start() {
  await mongoose.connect(config.mongodbUri);
  console.log("Training worker connected to MongoDB");

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => processTrainingJob(job),
    { connection: getRedisConnection() }
  );

  worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
  worker.on("failed", (job, err) => console.error(`Job ${job?.id} failed:`, err.message));

  console.log("Training worker listening");
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
