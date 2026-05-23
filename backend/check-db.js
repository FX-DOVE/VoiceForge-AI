const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

async function run() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/voiceforge";
  await mongoose.connect(mongoUri);
  
  const { AudioGeneration, User } = require("./src/models");
  
  const userIds = await AudioGeneration.distinct("user");
  console.log("Distinct user IDs in AudioGeneration:", userIds);
  for (const id of userIds) {
    const user = await User.findById(id);
    console.log(`User ID: ${id}, Email: ${user ? user.email : 'Deleted/Not found'}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
