require("dotenv").config();
const app = require("./app");
const config = require("./config");
const { connectDB } = require("./config/db");
const { seedDefaultVoices } = require("./utils/seedVoices");

async function start() {
  await connectDB();
  await seedDefaultVoices();

  const server = app.listen(config.port, () => {
    console.log(`VoiceForge API running on http://localhost:${config.port}`);
    console.log(`Health: http://localhost:${config.port}/api/health`);
  });

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
