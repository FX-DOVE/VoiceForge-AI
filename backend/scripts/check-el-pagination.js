require("dotenv").config();
const config = require("../src/config");

const key = config.elevenlabs?.apiKey || process.env.ELEVENLABS_API_KEY;
const base = "https://api.elevenlabs.io/v1";

(async () => {
  // Try with larger page and legacy
  let url = `${base}/voices?show_legacy=true&page_size=100`;
  const res = await fetch(url, { headers: { "xi-api-key": key } });
  const json = await res.json();

  console.log("Response top-level keys:", Object.keys(json));
  console.log("voices count:", json.voices ? json.voices.length : 0);
  console.log("has_more:", json.has_more);
  console.log("next_cursor or similar:", json.next_cursor || json.cursor || "none");

  if (json.voices && json.voices.length > 0) {
    const langs = new Set();
    const cats = new Set();
    json.voices.forEach(v => {
      if (v.labels && v.labels.language) langs.add(v.labels.language);
      if (v.category) cats.add(v.category);
      if (v.labels && v.labels.category) cats.add(v.labels.category);
    });
    console.log("Languages in this page:", Array.from(langs).sort().join(", "));
    console.log("Categories:", Array.from(cats).join(", "));

    // Show a couple non-en if any
    const nonEn = json.voices.filter(v => v.labels && v.labels.language && v.labels.language !== "en").slice(0,3);
    console.log("Sample non-English:", nonEn.map(v => `${v.name} (${v.labels.language})`));
  }

  // Also try the "shared" or library search if exists, but main is /voices
  console.log("\nNote: ElevenLabs public voice library is large; the /voices endpoint typically surfaces the 'premade' + accessible ones (often 20-50 depending on tier). Full search across all public voices for discovery is more of a web feature. For API TTS, you use specific voice_ids from this list or ones you cloned.");
})();
