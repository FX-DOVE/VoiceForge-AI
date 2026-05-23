/**
 * Voice Matching Utility
 * 
 * When true voice cloning is unavailable, this utility selects the closest
 * matching xAI voice based on reference audio characteristics.
 * 
 * Priority: Gender → Language → Accent → Tone → Age → Pace → Emotion
 */

// xAI TTS available voices with their characteristics
const XAI_VOICE_PROFILES = {
  ara: {
    id: "ara",
    name: "Ara",
    gender: "female",
    age: "adult",
    tone: ["warm", "medium", "bright"],
    style: ["conversational", "professional"],
    accent: "multilingual",
    language: ["english", "spanish", "french", "german", "chinese", "japanese", "portuguese", "russian", "italian", "hindi", "arabic", "korean"],
    pace: "normal",
    emotion: ["friendly", "neutral", "confident"],
    description: "Warm multilingual female voice",
  },
  eve: {
    id: "eve",
    name: "Eve",
    gender: "female",
    age: "adult",
    tone: ["clear", "medium", "bright"],
    style: ["professional", "storytelling"],
    accent: "multilingual",
    language: ["english", "spanish", "french", "german", "chinese", "japanese", "portuguese", "russian", "italian", "hindi", "arabic", "korean"],
    pace: "normal",
    emotion: ["neutral", "confident", "serious"],
    description: "Clear articulate multilingual female voice",
  },
  leo: {
    id: "leo",
    name: "Leo",
    gender: "male",
    age: "adult",
    tone: ["deep", "authoritative", "warm"],
    style: ["professional", "narrative", "promotional"],
    accent: "multilingual",
    language: ["english", "spanish", "french", "german", "chinese", "japanese", "portuguese", "russian", "italian", "hindi", "arabic", "korean"],
    pace: "normal",
    emotion: ["confident", "serious", "neutral"],
    description: "Deep resonant multilingual male voice",
  },
  rex: {
    id: "rex",
    name: "Rex",
    gender: "male",
    age: "adult",
    tone: ["deep", "powerful", "authoritative"],
    style: ["promotional", "professional", "emotional"],
    accent: "multilingual",
    language: ["english", "spanish", "french", "german", "chinese", "japanese", "portuguese", "russian", "italian", "hindi", "arabic", "korean"],
    pace: "normal",
    emotion: ["confident", "excited", "serious"],
    description: "Powerful authoritative multilingual male voice",
  },
  sal: {
    id: "sal",
    name: "Sal",
    gender: "male",
    age: "adult",
    tone: ["medium", "soft", "warm"],
    style: ["conversational", "calm"],
    accent: "multilingual",
    language: ["english", "spanish", "french", "german", "chinese", "japanese", "portuguese", "russian", "italian", "hindi", "arabic", "korean"],
    pace: "normal",
    emotion: ["friendly", "calm", "neutral"],
    description: "Smooth conversational multilingual male voice",
  },
};

/**
 * Analyze reference audio characteristics (placeholder for actual analysis)
 * In production, this would use audio analysis to detect:
 * - Gender (pitch analysis)
 * - Age (formant analysis)
 * - Tone (spectral analysis)
 * - Pace (speaking rate detection)
 * - Emotion (prosody analysis)
 */
function analyzeReferenceAudio(audioBufferOrPath) {
  // Placeholder - in production, integrate with audio analysis service
  // Return default characteristics if analysis unavailable
  return {
    gender: null, // "male" | "female" | null
    age: null,    // "child" | "young_adult" | "adult" | "older_adult" | null
    tone: [],     // ["deep", "warm", "bright", ...]
    style: [],    // ["conversational", "professional", ...]
    accent: null, // "american" | "british" | "multilingual" | null
    language: [], // ["english", "spanish", ...]
    pace: null,   // "slow" | "normal" | "fast" | null
    emotion: [],  // ["neutral", "friendly", "serious", ...]
  };
}

/**
 * Calculate match score between reference and voice profile
 * Higher score = better match
 */
function calculateMatchScore(reference, voice) {
  let score = 0;
  let maxPossible = 0;

  // Gender match (highest priority - mandatory)
  maxPossible += 100;
  if (reference.gender && voice.gender) {
    if (reference.gender.toLowerCase() === voice.gender.toLowerCase()) {
      score += 100;
    } else {
      // Gender mismatch - heavily penalize
      score -= 1000;
    }
  }

  // Language match (high priority)
  maxPossible += 50;
  if (reference.language?.length > 0 && voice.language?.length > 0) {
    const refLangs = reference.language.map(l => l.toLowerCase());
    const voiceLangs = voice.language.map(l => l.toLowerCase());
    const matches = refLangs.filter(l => voiceLangs.includes(l)).length;
    if (matches > 0) {
      score += 50 * (matches / refLangs.length);
    }
  } else if (voice.language?.includes("english")) {
    // Default to English if no language specified
    score += 25;
  }

  // Accent match
  maxPossible += 30;
  if (reference.accent && voice.accent) {
    if (reference.accent.toLowerCase() === voice.accent.toLowerCase()) {
      score += 30;
    } else if (voice.accent === "multilingual") {
      // Multilingual voices are good fallbacks
      score += 15;
    }
  }

  // Tone match
  maxPossible += 40;
  if (reference.tone?.length > 0 && voice.tone?.length > 0) {
    const refTones = reference.tone.map(t => t.toLowerCase());
    const voiceTones = voice.tone.map(t => t.toLowerCase());
    const matches = refTones.filter(t => voiceTones.includes(t)).length;
    score += 40 * (matches / Math.max(refTones.length, 1));
  }

  // Age match
  maxPossible += 20;
  if (reference.age && voice.age) {
    const ageMatch = reference.age.toLowerCase() === voice.age.toLowerCase();
    const ageCompatible = 
      (reference.age === "young_adult" && voice.age === "adult") ||
      (reference.age === "adult" && voice.age === "young_adult") ||
      (reference.age === "adult" && voice.age === "older_adult") ||
      (reference.age === "older_adult" && voice.age === "adult");
    
    if (ageMatch) {
      score += 20;
    } else if (ageCompatible) {
      score += 10;
    }
  }

  // Pace match
  maxPossible += 10;
  if (reference.pace && voice.pace) {
    if (reference.pace.toLowerCase() === voice.pace.toLowerCase()) {
      score += 10;
    }
  }

  // Emotion match
  maxPossible += 20;
  if (reference.emotion?.length > 0 && voice.emotion?.length > 0) {
    const refEmotions = reference.emotion.map(e => e.toLowerCase());
    const voiceEmotions = voice.emotion.map(e => e.toLowerCase());
    const matches = refEmotions.filter(e => voiceEmotions.includes(e)).length;
    score += 20 * (matches / Math.max(refEmotions.length, 1));
  }

  // Style match (bonus)
  if (reference.style?.length > 0 && voice.style?.length > 0) {
    const refStyles = reference.style.map(s => s.toLowerCase());
    const voiceStyles = voice.style.map(s => s.toLowerCase());
    const matches = refStyles.filter(s => voiceStyles.includes(s)).length;
    score += 15 * (matches / Math.max(refStyles.length, 1));
  }

  return { score, maxPossible, percentage: maxPossible > 0 ? (score / maxPossible) * 100 : 0 };
}

/**
 * Find the best matching voice for given reference characteristics
 * @param {Object} referenceCharacteristics - Analyzed characteristics from reference audio
 * @returns {Object} Best matching voice with match details
 */
function findBestMatch(referenceCharacteristics) {
  const voices = Object.values(XAI_VOICE_PROFILES);
  
  const scoredVoices = voices.map(voice => {
    const match = calculateMatchScore(referenceCharacteristics, voice);
    return {
      voice,
      score: match.score,
      percentage: match.percentage,
    };
  });

  // Sort by score (descending)
  scoredVoices.sort((a, b) => b.score - a.score);

  // Return best match (or first voice if no good match)
  const bestMatch = scoredVoices[0];
  
  return {
    voiceId: bestMatch.voice.id,
    voiceName: bestMatch.voice.name,
    voiceDescription: bestMatch.voice.description,
    matchScore: bestMatch.percentage,
    matchDetails: {
      gender: referenceCharacteristics.gender,
      tone: bestMatch.voice.tone,
      style: bestMatch.voice.style,
    },
    fallbackMessage: "Exact voice cloning is not available on this plan, so we selected the closest matching voice with the same gender, tone, language, and speaking style.",
  };
}

/**
 * Quick gender-based voice selection (fastest fallback)
 * Use when no detailed analysis is available
 */
function selectVoiceByGender(gender) {
  const normalizedGender = gender?.toLowerCase();
  
  if (normalizedGender === "female") {
    return {
      voiceId: "ara",
      voiceName: "Ara",
      reason: "Female voice selected",
    };
  } else if (normalizedGender === "male") {
    return {
      voiceId: "leo",
      voiceName: "Leo",
      reason: "Male voice selected",
    };
  }
  
  // Default to Ara if gender unknown
  return {
    voiceId: "ara",
    voiceName: "Ara",
    reason: "Default voice (gender not detected)",
  };
}

/**
 * Main voice matching function
 * Analyzes reference audio and returns best matching voice
 */
async function matchVoiceFromReference(referenceAudio, options = {}) {
  const { 
    skipAnalysis = false,
    knownGender = null,
    knownLanguage = null,
    knownAccent = null,
  } = options;

  // If we have known characteristics, use them
  const referenceCharacteristics = skipAnalysis 
    ? {
        gender: knownGender,
        age: null,
        tone: [],
        style: [],
        accent: knownAccent,
        language: knownLanguage ? [knownLanguage] : [],
        pace: null,
        emotion: [],
      }
    : await analyzeReferenceAudio(referenceAudio);

  // Override with known values if provided
  if (knownGender) referenceCharacteristics.gender = knownGender;
  if (knownLanguage) referenceCharacteristics.language = [knownLanguage];
  if (knownAccent) referenceCharacteristics.accent = knownAccent;

  // Gender is required - if not detected, we can't proceed safely
  if (!referenceCharacteristics.gender) {
    return {
      voiceId: "ara",
      voiceName: "Ara",
      matchScore: 0,
      warning: "Could not detect gender from reference. Please provide gender information.",
      fallbackMessage: "Exact voice cloning is not available on this plan, so we selected a default voice.",
    };
  }

  const result = findBestMatch(referenceCharacteristics);
  
  return result;
}

module.exports = {
  matchVoiceFromReference,
  selectVoiceByGender,
  findBestMatch,
  calculateMatchScore,
  XAI_VOICE_PROFILES,
};
