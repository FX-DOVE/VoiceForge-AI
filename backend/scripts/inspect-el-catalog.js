require("dotenv").config();
const elevenlabs = require("../src/integrations/elevenlabsService");

(async () => {
  try {
    const voices = await elevenlabs.listVoices();
    console.log("Total voices returned by /v1/voices:", voices.length);

    const languages = new Set();
    const accents = new Set();
    const categories = new Set();
    const genders = new Set();
    const countries = new Set();

    voices.forEach(v => {
      const labels = v.labels || {};
      if (labels.language) languages.add(labels.language);
      if (labels.accent) accents.add(labels.accent);
      if (labels.category || v.category) categories.add(labels.category || v.category);
      if (labels.gender) genders.add(labels.gender);
      if (labels.country) countries.add(labels.country);
    });

    console.log("\nLanguages:", Array.from(languages).sort().join(", "));
    console.log("Accents (sample):", Array.from(accents).sort().slice(0, 15).join(", "));
    console.log("Genders:", Array.from(genders).sort().join(", "));
    console.log("Countries:", Array.from(countries).sort().join(", ") || "none explicit");

    console.log("\nCategories:", Array.from(categories).join(", "));

    console.log("\nSample voices (first 8):");
    voices.slice(0, 8).forEach(v => {
      const l = v.labels || {};
      console.log(`- ${v.name} (id:${v.voice_id?.slice(0,8)}) lang:${l.language || ''} accent:${l.accent || ''} gender:${l.gender || ''}`);
    });

    // Check response shape for pagination
    console.log("\nNote: If total is low (~20-30), it is typical for /voices on free/paid without specific library search. Full public library search may require different endpoint or web scraping (not API).");

  } catch(e) {
    console.error("Error listing:", e.message);
  }
})();
