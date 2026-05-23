const { Queue } = require("bullmq");
const { getRedisConnection } = require("../config/redis");

const QUEUE_NAME = "voice-training";

let queue = null;

function isRedisReady() {
  try {
    const conn = getRedisConnection();
    return conn.status === "ready";
  } catch {
    return false;
  }
}

function getQueue() {
  if (!queue) {
    try {
      queue = new Queue(QUEUE_NAME, { connection: getRedisConnection() });
    } catch (err) {
      console.warn("[queue] Redis unavailable, training will run inline:", err.message);
      queue = null;
    }
  }
  return queue;
}

async function enqueueTrainingJob(data) {
  // If Redis is not ready, run inline immediately
  if (!isRedisReady()) {
    console.log("[queue] Redis not ready — running training inline");
    return { id: `inline-${Date.now()}`, inline: true, data };
  }
  const q = getQueue();
  if (!q) {
    return { id: `inline-${Date.now()}`, inline: true, data };
  }
  try {
    return await q.add("train-voice", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  } catch (err) {
    console.warn("[queue] Failed to enqueue, falling back to inline:", err.message);
    return { id: `inline-${Date.now()}`, inline: true, data };
  }
}

module.exports = { getQueue, enqueueTrainingJob, QUEUE_NAME };
