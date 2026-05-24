require("dotenv").config();
const app = require("./app");
const config = require("./config");
const { connectDB } = require("./config/db");
const { seedDefaultVoices } = require("./utils/seedVoices");
const { syncEdgeVoices } = require("./utils/syncEdgeVoices");
const { syncXaiVoices } = require("./utils/syncXaiVoices");
const { generateAllPreviews } = require("./utils/generateVoicePreviews");
const { User } = require("./models");
const { cleanupExpired } = require("./services/ttsService");
const { verifyConnection } = require("./integrations/email");

async function ensureAdminUser() {
  if (!config.adminEmail) return;
  const result = await User.updateOne(
    { email: config.adminEmail },
    { $set: { role: "admin" } }
  );
  if (result.matchedCount > 0) {
    console.log(`✓ Admin role ensured for: ${config.adminEmail}`);
  }
}

async function start() {
  await connectDB();
  await seedDefaultVoices();
  await ensureAdminUser();

  // Verify email SMTP connection
  const emailConnected = await verifyConnection();
  if (emailConnected) {
    console.log("✓ Email SMTP configured (Namecheap Private Email)");
  } else {
    console.warn("⚠ Email SMTP not configured - emails will be logged to console");
  }

  // Background sync: Edge TTS voices
  syncEdgeVoices();

  // Background sync: xAI voice catalog + previews
  (async () => {
    try {
      const result = await syncXaiVoices();
      if (result.imported > 0) {
        await generateAllPreviews({ force: false, concurrency: 2, source: "xai" });
      }
    } catch (err) {
      console.warn("[Startup] xAI voice sync/preview generation failed:", err.message);
    }
  })();

  // Listen on 0.0.0.0 so it works inside Docker and on VPS
  const server = app.listen(config.port, "0.0.0.0", () => {
    console.log(`VoiceForge API running on http://0.0.0.0:${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/api/health`);
  });

  // Cleanup expired generations every hour (files auto-deleted after 28 hrs)
  cleanupExpired().catch(() => {});
  setInterval(() => cleanupExpired().catch(() => {}), 60 * 60 * 1000);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${config.port} is already in use. Stop the other server (or run: netstat -ano | findstr :${config.port}) or set PORT in .env to another value.`
      );
      process.exit(1);
    }
    throw err;
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
