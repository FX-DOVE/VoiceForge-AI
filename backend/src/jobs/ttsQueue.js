const { Queue } = require("bullmq");
const { getRedisConnection } = require("../config/redis");

const QUEUE_NAME = "tts-generation";

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
      console.warn("[tts-queue] Redis unavailable, TTS will run inline:", err.message);
      queue = null;
    }
  }
  return queue;
}

async function enqueueTtsJob(data) {
  // If Redis is not ready, run inline immediately
  if (!isRedisReady()) {
    console.log("[tts-queue] Redis not ready — running TTS inline");
    return { id: `inline-${Date.now()}`, inline: true, data };
  }

  const q = getQueue();
  if (!q) {
    return { id: `inline-${Date.now()}`, inline: true, data };
  }

  try {
    return await q.add("generate-tts", data, {
      attempts: 2,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: 200,
      removeOnFail: 100,
    });
  } catch (err) {
    console.warn("[tts-queue] Failed to enqueue, falling back to inline:", err.message);
    return { id: `inline-${Date.now()}`, inline: true, data };
  }
}

module.exports = { getQueue, enqueueTtsJob, QUEUE_NAME };
