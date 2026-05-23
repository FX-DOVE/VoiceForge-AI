require("dotenv").config();
const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const config = require("../config");
const { getRedisConnection } = require("../config/redis");
const { QUEUE_NAME: TRAINING_QUEUE } = require("./trainingQueue");
const { QUEUE_NAME: TTS_QUEUE } = require("./ttsQueue");
const { processInlineTraining } = require("./inlineTraining");
const { processTtsJob } = require("./ttsGeneration");

async function processTrainingJob(job) {
  const { trainingJobId, voiceCloneId } = job.data;
  await processInlineTraining({ trainingJobId, voiceCloneId });
}

async function processTtsGenerationJob(job) {
  await processTtsJob(job);
}

async function start() {
  await mongoose.connect(config.mongodbUri);
  console.log("Workers connected to MongoDB");

  // Training worker
  const trainingWorker = new Worker(
    TRAINING_QUEUE,
    async (job) => processTrainingJob(job),
    { connection: getRedisConnection() }
  );

  trainingWorker.on("completed", (job) => console.log(`[Training] Job ${job.id} completed`));
  trainingWorker.on("failed", (job, err) => console.error(`[Training] Job ${job?.id} failed:`, err.message));

  // TTS Generation worker
  const ttsWorker = new Worker(
    TTS_QUEUE,
    async (job) => processTtsGenerationJob(job),
    { connection: getRedisConnection() }
  );

  ttsWorker.on("completed", (job) => console.log(`[TTS] Job ${job.id} completed`));
  ttsWorker.on("failed", (job, err) => console.error(`[TTS] Job ${job?.id} failed:`, err.message));

  console.log(`Workers listening → ${TRAINING_QUEUE}, ${TTS_QUEUE}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
