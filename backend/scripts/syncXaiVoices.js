#!/usr/bin/env node
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const { syncXaiVoices } = require("../src/utils/syncXaiVoices");

async function main() {
  await connectDB();
  const result = await syncXaiVoices();
  console.log("Sync complete:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
