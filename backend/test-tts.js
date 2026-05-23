const { synthesizeSpeech } = require("./src/integrations/xaiTts");
const path = require("path");
require("dotenv").config();

async function run() {
  try {
    const result = await synthesizeSpeech({
      text: "Testing Voice Forge AI voice generation",
      voiceId: "ara",
      language: "en",
    });
    console.log("Success! Audio buffer length:", result.buffer ? result.buffer.length : 0);
    console.log("Usage information:", result.usage);
  } catch (err) {
    console.error("Error calling xAI TTS:", err.message, "Code:", err.statusCode, "Detail:", err.xaiDetail);
  }
}

run().catch(console.error);
