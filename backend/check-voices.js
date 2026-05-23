const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

async function run() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/voiceforge";
  await mongoose.connect(mongoUri);
  
  const { Voice } = require("./src/models");
  
  const voices = await Voice.find().lean();
  console.log(`Total voices in DB: ${voices.length}`);
  for (const v of voices) {
    console.log(`ID: ${v._id}, Name: ${v.name}, Slug: ${v.slug}, Type: ${v.type}, Tier: ${v.tier}, xaiVoiceId: ${v.xaiVoiceId}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
