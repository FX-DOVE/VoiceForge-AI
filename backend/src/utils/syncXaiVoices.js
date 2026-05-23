const { Voice } = require("../models");
const { fetchXaiVoices } = require("../integrations/xaiTts");
const config = require("../config");

const CORE_VOICE_IDS = new Set(["ara", "eve", "leo", "rex", "sal"]);

const LANGUAGE_COUNTRY_MAP = {
  en: { language: "English", country: "United States" },
  es: { language: "Spanish", country: "Spain" },
  fr: { language: "French", country: "France" },
  de: { language: "German", country: "Germany" },
  it: { language: "Italian", country: "Italy" },
  pt: { language: "Portuguese", country: "Brazil" },
  ru: { language: "Russian", country: "Russia" },
  zh: { language: "Chinese", country: "China" },
  ja: { language: "Japanese", country: "Japan" },
  ko: { language: "Korean", country: "South Korea" },
  ar: { language: "Arabic", country: "Saudi Arabia" },
  hi: { language: "Hindi", country: "India" },
  nl: { language: "Dutch", country: "Netherlands" },
  sv: { language: "Swedish", country: "Sweden" },
  pl: { language: "Polish", country: "Poland" },
  tr: { language: "Turkish", country: "Turkey" },
  th: { language: "Thai", country: "Thailand" },
  vi: { language: "Vietnamese", country: "Vietnam" },
  id: { language: "Indonesian", country: "Indonesia" },
  ms: { language: "Malay", country: "Malaysia" },
  uk: { language: "Ukrainian", country: "Ukraine" },
  cs: { language: "Czech", country: "Czech Republic" },
  ro: { language: "Romanian", country: "Romania" },
  el: { language: "Greek", country: "Greece" },
  he: { language: "Hebrew", country: "Israel" },
  da: { language: "Danish", country: "Denmark" },
  fi: { language: "Finnish", country: "Finland" },
  no: { language: "Norwegian", country: "Norway" },
  hu: { language: "Hungarian", country: "Hungary" },
  bg: { language: "Bulgarian", country: "Bulgaria" },
  hr: { language: "Croatian", country: "Croatia" },
  sk: { language: "Slovak", country: "Slovakia" },
  sl: { language: "Slovenian", country: "Slovenia" },
  sr: { language: "Serbian", country: "Serbia" },
  ca: { language: "Catalan", country: "Spain" },
  multilingual: { language: "Multilingual", country: "" },
};

function resolveLanguageInfo(xaiVoice) {
  const lang = (xaiVoice.language || "").toLowerCase();
  const mapped = LANGUAGE_COUNTRY_MAP[lang] || null;
  if (mapped) return mapped;

  // Try prefix match (e.g., "en-US" -> "en")
  const prefix = lang.split("-")[0];
  if (LANGUAGE_COUNTRY_MAP[prefix]) return LANGUAGE_COUNTRY_MAP[prefix];

  // Fallback: capitalize the language field
  return {
    language: xaiVoice.language || "Unknown",
    country: xaiVoice.country || "",
  };
}

function buildSlug(voiceId) {
  return `xai-${voiceId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function inferGender(xaiVoice) {
  if (xaiVoice.gender) return capitalize(xaiVoice.gender);
  return "";
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function syncXaiVoices() {
  console.log("[xAI Sync] Fetching voice catalog from xAI...");
  const xaiVoices = await fetchXaiVoices(true);

  if (!xaiVoices || xaiVoices.length === 0) {
    console.warn("[xAI Sync] No voices returned from xAI API. Skipping sync.");
    return { imported: 0, deactivated: 0 };
  }

  console.log(`[xAI Sync] Received ${xaiVoices.length} voices from xAI`);

  const importedIds = new Set();
  let upserted = 0;

  for (const xv of xaiVoices) {
    const voiceId = xv.voice_id || xv.id || xv.name;
    if (!voiceId) continue;

    const isCore = CORE_VOICE_IDS.has(voiceId.toLowerCase());
    // Core voices keep their original slug (ara, eve, etc.)
    const slug = isCore ? voiceId.toLowerCase() : buildSlug(voiceId);
    const langInfo = resolveLanguageInfo(xv);
    const gender = inferGender(xv);

    const languages = [];
    if (langInfo.language) languages.push(langInfo.language);
    if (xv.languages && Array.isArray(xv.languages)) {
      for (const l of xv.languages) {
        if (!languages.includes(l)) languages.push(l);
      }
    }
    // Core voices support multilingual
    if (isCore && !languages.includes("Multilingual")) {
      languages.unshift("Multilingual");
    }

    const tags = [];
    if (gender) tags.push(gender);
    if (langInfo.language && langInfo.language !== "Unknown") tags.push(langInfo.language);
    if (isCore) tags.push("Core");

    const updateData = {
      name: xv.name || capitalize(voiceId),
      xaiVoiceId: voiceId,
      gender,
      age: xv.age || "",
      country: xv.country || langInfo.country || "",
      style: xv.style || xv.category || "",
      languages,
      tags,
      tier: "pro",
      type: "stock",
      source: "xai",
      isPublic: true,
      isActive: true,
      isCoreVoice: isCore,
      creator: "xAI",
      description: xv.description || `${xv.name || voiceId} — ${langInfo.language} voice powered by xAI.`,
    };

    await Voice.findOneAndUpdate(
      { slug },
      { $set: updateData, $setOnInsert: { slug, previewUrl: "", rating: isCore ? 4.9 : 4.5 } },
      { upsert: true }
    );

    importedIds.add(slug);
    upserted++;
  }

  // Mark voices from xAI source that are no longer returned as inactive
  const deactivated = await Voice.updateMany(
    { source: "xai", slug: { $nin: [...importedIds] }, isActive: true },
    { $set: { isActive: false } }
  );

  console.log(`[xAI Sync] Upserted ${upserted} xAI voices, deactivated ${deactivated.modifiedCount}`);
  return { imported: upserted, deactivated: deactivated.modifiedCount };
}

module.exports = { syncXaiVoices, CORE_VOICE_IDS };
