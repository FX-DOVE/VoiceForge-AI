const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

async function run() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/voiceforge";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const { User, Voice } = require("./src/models");
  const { generateTts } = require("./src/services/ttsService");

  const user = await User.findOne({ email: "odohchisom51@gmail.com" });
  if (!user) {
    console.error("Admin user not found!");
    await mongoose.disconnect();
    return;
  }
  console.log("User ID:", user._id);

  const voice = await Voice.findOne({ name: "Eve", tier: "pro" });
  if (!voice) {
    console.error("Eve (pro) voice not found!");
    await mongoose.disconnect();
    return;
  }
  console.log("Voice ID:", voice._id);

  console.log("Generating Pro TTS...");
  try {
    const result = await generateTts(user._id, {
      text: "Generating pro voice text to speech content via xAI",
      voiceId: voice._id.toString(),
      language: "en",
    });
    console.log("Success! Audio URL:", result.audioUrl);
  } catch (err) {
    console.error("Error:", err.message);
  }

  const { GrokUsage } = require("./src/models");
  const usagesCount = await GrokUsage.countDocuments();
  console.log("Total GrokUsages count now:", usagesCount);

  await mongoose.disconnect();
}

run().catch(console.error);
