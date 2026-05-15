const mongoose = require("mongoose");
const config = require("./index");

async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongodbUri);
  console.log("MongoDB connected");
}

module.exports = { connectDB };
