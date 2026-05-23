require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../src/config");
const { seedDefaultVoices } = require("../src/utils/seedVoices");

async function main() {
  await mongoose.connect(config.mongodbUri);
  console.log("Connected to MongoDB. Seeding voices...");
  await seedDefaultVoices();
  console.log("Done.");
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
