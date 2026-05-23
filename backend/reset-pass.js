const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

async function run() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/voiceforge";
  await mongoose.connect(mongoUri);
  
  const { User } = require("./src/models");
  
  const user = await User.findOne({ email: "odohchisom51@gmail.com" });
  if (user) {
    user.password = "Password123!";
    await user.save();
    console.log("Admin user password reset successfully to: Password123!");
  } else {
    console.log("Admin user not found");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
