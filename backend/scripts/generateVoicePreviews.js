#!/usr/bin/env node
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const { generateAllPreviews } = require("../src/utils/generateVoicePreviews");

async function main() {
  const force = process.argv.includes("--force");
  await connectDB();
  const result = await generateAllPreviews({ force, concurrency: 2, source: "xai" });
  console.log("Preview generation complete:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error("Preview generation failed:", err);
  process.exit(1);
});
