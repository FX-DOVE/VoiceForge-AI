require("dotenv").config();
const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const config = require("../config");
const { getRedisConnection } = require("../config/redis");
const { QUEUE_NAME } = require("./trainingQueue");
const { processInlineTraining } = require("./inlineTraining");

async function processTrainingJob(job) {
  const { trainingJobId, voiceCloneId } = job.data;
  await processInlineTraining({ trainingJobId, voiceCloneId });
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
