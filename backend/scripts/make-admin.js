/**
 * Usage: node scripts/make-admin.js <email>
 * Promotes a user to role=admin in MongoDB.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../src/config");

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/make-admin.js <email>");
  process.exit(1);
}

async function main() {
  await mongoose.connect(config.mongodbUri);
  const result = await mongoose.connection
    .collection("users")
    .findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: { role: "admin" } },
      { returnDocument: "after" }
    );

  if (!result) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`✓ ${result.email} is now role=admin`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
