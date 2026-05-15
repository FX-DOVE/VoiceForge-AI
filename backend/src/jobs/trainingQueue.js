const { Queue } = require("bullmq");
const { getRedisConnection } = require("../config/redis");

const QUEUE_NAME = "voice-training";

let queue = null;

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
  const q = getQueue();
  if (!q) {
    return { id: `inline-${Date.now()}`, inline: true, data };
  }
  return q.add("train-voice", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}

module.exports = { getQueue, enqueueTrainingJob, QUEUE_NAME };
