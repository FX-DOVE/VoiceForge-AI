require("dotenv").config();
const mongoose = require("mongoose");
const { User, WelcomeGrant } = require("../src/models");
const config = require("../src/config");

async function fixWelcomeCredits() {
  console.log("Connecting to database...");
  await mongoose.connect(config.mongodbUri);
  console.log("Connected.");

  console.log("Finding users with 0 credits...");
  
  const users = await User.find({ totalCredits: 0 });
  let fixed = 0;

  for (const user of users) {
    user.totalCredits += 2380;
    user.creditsRemaining += 2380;
    await user.save();

    await WelcomeGrant.updateOne(
      { email: user.email },
      { 
        $setOnInsert: { 
          ipAddress: "retroactive-fix", 
          user: user._id, 
          creditsGranted: 2380 
        } 
      },
      { upsert: true }
    );
    fixed++;
    console.log(`Granted 2380 credits to ${user.email}`);
  }

  console.log(`Fix complete. Granted credits to ${fixed} users.`);
  process.exit(0);
}

fixWelcomeCredits().catch(console.error);
