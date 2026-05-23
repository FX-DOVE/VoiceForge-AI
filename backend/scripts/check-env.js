// Check current SMTP configuration
require("dotenv").config();

console.log("\n=== Current SMTP Configuration ===\n");
console.log("SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");
console.log("SMTP_PORT:", process.env.SMTP_PORT || "NOT SET");
console.log("SMTP_SECURE:", process.env.SMTP_SECURE || "NOT SET");
console.log("SMTP_USER:", process.env.SMTP_USER || "NOT SET");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "*** SET ***" : "NOT SET");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "NOT SET");

console.log("\n=== Diagnosis ===\n");

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.log("❌ PROBLEM: SMTP_USER or SMTP_PASS is missing!");
  console.log("   → Add them to your backend/.env file\n");
}

if (process.env.SMTP_USER && !process.env.SMTP_USER.includes("@")) {
  console.log("❌ PROBLEM: SMTP_USER should be a full email address (e.g., support@voiceforgeai.site)");
  console.log("   → Current value:", process.env.SMTP_USER);
  console.log("   → Should be: support@voiceforgeai.site\n");
}

if (process.env.SMTP_PORT === "465") {
  console.log("⚠️  WARNING: Using port 465 (SSL)");
  console.log("   → Try port 587 with SMTP_SECURE=false if authentication fails\n");
}

if (process.env.SMTP_PASS && process.env.SMTP_PASS.length < 8) {
  console.log("⚠️  WARNING: Password looks too short (", process.env.SMTP_PASS.length, "chars)");
  console.log("   → Make sure you're using the correct password from Namecheap\n");
}

console.log("=== Recommended .env Settings ===\n");
console.log("SMTP_HOST=mail.privateemail.com");
console.log("SMTP_PORT=587");
console.log("SMTP_SECURE=false");
console.log("SMTP_USER=support@voiceforgeai.site");
console.log("SMTP_PASS=your-actual-password");
console.log("EMAIL_FROM=VoiceForge AI <support@voiceforgeai.site>");
console.log("");
