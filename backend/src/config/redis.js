const Redis = require("ioredis");
const config = require("./index");

let connection = null;
let redisAvailable = null; // null = untested, true/false after first check

function getRedisConnection() {
  if (!connection) {
    connection = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      // Stop retrying after Redis is confirmed unavailable
      retryStrategy(times) {
        if (redisAvailable === false) return null; // stop retrying
        if (times > 3) {
          redisAvailable = false;
          console.warn("[redis] Not available — queuing disabled, training will run inline.");
          return null; // stop retrying
        }
        return Math.min(times * 200, 1000);
      },
      reconnectOnError() {
        return false; // don't reconnect on errors
      },
    });

    // Suppress unhandled error events — we handle unavailability via retryStrategy
    connection.on("error", () => {});
    connection.on("ready", () => {
      redisAvailable = true;
      console.log("[redis] Connected.");
    });
    connection.on("end", () => {
      redisAvailable = false;
    });
  }
  return connection;
}

module.exports = { getRedisConnection };
