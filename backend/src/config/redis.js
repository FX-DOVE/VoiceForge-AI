const Redis = require("ioredis");
const config = require("./index");

let connection = null;

function getRedisConnection() {
  if (!connection) {
    connection = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return connection;
}

module.exports = { getRedisConnection };
