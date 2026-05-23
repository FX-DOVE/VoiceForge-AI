const config = require("../config");

// xAI TTS native endpoint — https://docs.x.ai/developers/model-capabilities/audio/text-to-speech
const XAI_TTS_URL = "https://api.x.ai/v1/tts";

// The 5 voices available on the xAI TTS API
const XAI_VOICES = ["eve", "ara", "rex", "sal", "leo"];

/**
 * Parse xAI usage from response headers
 * xAI may return usage data in response headers
 */
function parseXaiUsageHeaders(headers) {
  const usage = {
    costInUsdTicks: 0,
    costUsd: 0,
    charactersProcessed: 0,
    modelUsed: "",
    requestId: "",
  };

  // Check for xAI-specific headers
  const costTicksHeader = headers.get("x-usage-cost-ticks") || headers.get("x-cost-ticks") || headers.get("xai-cost-ticks");
  if (costTicksHeader) {
    usage.costInUsdTicks = parseInt(costTicksHeader, 10) || 0;
    usage.costUsd = usage.costInUsdTicks / 10000000000; // Convert ticks to USD
  }

  const charsHeader = headers.get("x-characters-processed") || headers.get("x-usage-characters") || headers.get("xai-characters");
  if (charsHeader) {
    usage.charactersProcessed = parseInt(charsHeader, 10) || 0;
  }

  const requestIdHeader = headers.get("x-request-id") || headers.get("xai-request-id") || headers.get("x-xai-request-id");
  if (requestIdHeader) {
    usage.requestId = requestIdHeader;
  }

  const modelHeader = headers.get("x-model-used") || headers.get("xai-model") || headers.get("x-xai-model");
  if (modelHeader) {
    usage.modelUsed = modelHeader;
  }

  return usage;
}

/**
 * Estimate cost based on character count
 * xAI TTS pricing: ~$4.20 per 1M characters
 */
function estimateTtsCost(characters) {
  const COST_PER_CHAR = 0.0000042; // $4.20 / 1,000,000
  return characters * COST_PER_CHAR;
}

async function synthesizeSpeech({ text, voiceId, language }) {
  if (!config.xai.apiKey) {
    throw Object.assign(new Error("Text-to-speech is not configured. Contact support."), {
      statusCode: 503,
    });
  }

  const voice = (voiceId || config.xai.defaultVoiceId || "ara").toLowerCase();
  const charCount = text?.length || 0;

  const payload = {
    text,
    voice_id: voice,
    language: language || "auto",
  };

  const response = await fetch(XAI_TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.xai.apiKey}`,
      "Content-Type": "application/json",
      Accept: "audio/*, application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";

  // Parse usage from headers (capturing even on error for usage tracking)
  const usageFromHeaders = parseXaiUsageHeaders(response.headers);

  if (!response.ok) {
    let message = "Voice generation failed. Please try again.";
    let rawDetail = "";
    let isCreditOrAuth = false;
    try {
      const errBody = await response.json();
      console.error("[xAI TTS] API error:", response.status, JSON.stringify(errBody));
      rawDetail = errBody.error?.message || errBody.message || JSON.stringify(errBody);
      if (response.status === 402 || response.status === 429) {
        message = "An error occurred. Please try again later.";
        isCreditOrAuth = true;
      } else if (response.status === 401 || response.status === 403) {
        message = "An error occurred. Please try again later.";
        isCreditOrAuth = true;
      } else {
        message = "An error occurred. Please try again later.";
      }
    } catch {
      rawDetail = await response.text().catch(() => "");
      console.error("[xAI TTS] Non-JSON error:", response.status, rawDetail);
    }
    throw Object.assign(new Error(message), {
      statusCode: response.status,
      isCreditOrAuth,
      xaiDetail: rawDetail,
      usage: usageFromHeaders, // Include usage data even on error
    });
  }

  if (contentType.includes("application/json")) {
    const data = await response.json();
    // Parse usage from JSON body if available
    if (data.usage) {
      usageFromHeaders.costInUsdTicks = data.usage.cost_in_usd_ticks || usageFromHeaders.costInUsdTicks;
      usageFromHeaders.costUsd = data.usage.cost_usd || (usageFromHeaders.costInUsdTicks / 10000000000);
      usageFromHeaders.charactersProcessed = data.usage.characters || data.usage.characters_processed || usageFromHeaders.charactersProcessed;
      usageFromHeaders.modelUsed = data.usage.model || usageFromHeaders.modelUsed;
    }
    return { type: "json", data, usage: usageFromHeaders };
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  // If no usage data from headers, estimate based on character count
  if (!usageFromHeaders.costUsd && !usageFromHeaders.costInUsdTicks) {
    usageFromHeaders.costUsd = estimateTtsCost(charCount);
    usageFromHeaders.charactersProcessed = charCount;
    usageFromHeaders.modelUsed = "tts-1";
  }

  return { type: "audio", buffer, contentType, usage: usageFromHeaders };
}

let _cachedVoices = null;
let _cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function fetchXaiVoices(forceRefresh = false) {
  if (!forceRefresh && _cachedVoices && Date.now() - _cacheTime < CACHE_TTL) {
    return _cachedVoices;
  }
  if (!config.xai.apiKey) return [];

  const response = await fetch("https://api.x.ai/v1/tts/voices", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.xai.apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    console.error("[xAI Voices] Failed to fetch voices:", response.status);
    return _cachedVoices || [];
  }

  const data = await response.json();
  const voices = Array.isArray(data) ? data : data.voices || data.data || [];
  _cachedVoices = voices;
  _cacheTime = Date.now();
  return voices;
}

module.exports = { synthesizeSpeech, fetchXaiVoices, XAI_VOICES, parseXaiUsageHeaders, estimateTtsCost };
