const mongoose = require("mongoose");
const { sendSuccess } = require("../utils/apiResponse");

function health(req, res) {
  sendSuccess(res, {
    status: "ok",
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
}

module.exports = { health };
