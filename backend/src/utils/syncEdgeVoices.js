const { MsEdgeTTS } = require("msedge-tts");
const { Voice } = require("../models");

const PLACEHOLDER_IMGS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDvtHzWYW9YJzgO_ZRR1_fwvCYGCE5I40t2H_nT91mQWjl56adu0N2kKqLKgfU22nQqPBKuyL7MynP0811hmBL_xZoZcRzkWWHjhOihdPB4D1vsB7r7HQ1uebjx6KJpiFk8b233ysRamZ8A1_4j6OZSVzwJxGQ3HSOIoI-9LbJy59tXbu1ZnPsIov4A9Wr-sOI1wxo-VQgvxkEfwpwYOfkopYZZKxqnm60BoQtEUSzdBX8TCAtr3a3Yh-rhnnUB3QygZepRyo6kmV4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB3yNFip8ipSMpdIPkUH62nYg3INJqnyq-TYzXmHVpq2mOblZtDXHU7mUH1kXIcEzeU5pRbk3z-co0NZdouUqZgenIC9CzOzcm5vLxPv0lyWdcorypmqjNiZ3qvEICSkYGilD3I1zDIz1izW8Zm7PoIN3ureDYiW40G2tgkmnpZJ-c9TnPGMtnE9rBFdlUpNQ6Afj9F73PyJ4EwL_Oe6BCfIO4ADZkfAvfNYgv2mangcbceP0efVAGn8Xg8Zw4QpXbT9mXIlNaWaFQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA2tgjHbZwPadn9cw8gkAsLy3BUQBYyoxAwGgVkLfOyM6HiZjVInAwRHZ1aW_apmv2jonV32Kt8XI9EP_naAtJe1iDk6A52iZXSjIl74mKvtM5bE3JvRw-3eomYwDnOaX0BKJRV8tVDFyzjtxOYVMLzTEQwVedzcpD_GEraL1Ox2JLl2XK43bwHtKAixzquKTfrV3kd_0LWxm1NRbjHKQCnRksMEV-1EyqOpag-yGBjGHJgwuPMkiQrwlqxgRbyI15wJl86LQg2tMA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
];

function pickImg(i) {
  return PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length];
}

function toSlug(shortName) {
  return "edge-" + shortName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const PREVIEW_BY_PERSONALITY = {
  "Friendly":      "Hey there! It's great to be here with you. I'm always happy to lend my voice to your content.",
  "Positive":      "Every great project starts with the right voice. Let me help bring your message to life.",
  "Warm":          "Welcome. Whether it's a story, an explainer, or a brand message — I'm here for you.",
  "Confident":     "Clear. Precise. Powerful. This is what professional narration sounds like.",
  "Cheerful":      "Ready to make your content shine? Let's do this — upbeat, clear, and full of energy!",
  "Expressive":    "Words come alive when they're spoken with feeling. Let me show you what I mean.",
  "Caring":        "Your audience deserves to feel heard. Let me speak to them with warmth and sincerity.",
  "Approachable":  "Hi! I'm here to make your content feel natural and easy to listen to. Let's get started.",
  "Casual":        "Hey, what's up! I'm the voice you want when you need something that feels real and relaxed.",
  "Rational":      "Accurate, measured, and clear. I deliver information with precision and calm authority.",
  "Passion":       "When you need a voice with drive and energy, look no further. Let's make something incredible.",
  "Lively":        "Full of life and ready to go! Your content will never sound dull with me on the mic.",
  "Cute":          "Hi! I'm super excited to be your voice today. Let's make something really fun together!",
  "Reliable":      "You can count on me for consistent, professional delivery every single time.",
  "Authority":     "This is the voice of authority. Trusted, composed, and built for content that demands respect.",
};

function getPreviewSample(personalities, gender, name) {
  for (const p of personalities) {
    if (PREVIEW_BY_PERSONALITY[p]) return PREVIEW_BY_PERSONALITY[p];
  }
  return gender === "Male"
    ? `Hi, I'm ${name}. Let me bring your script to life with clarity and confidence.`
    : `Hello! I'm ${name}. Ready to make your content sound polished and professional.`;
}

function localeName(locale) {
  const map = {
    "en-US": "United States", "en-GB": "United Kingdom", "en-AU": "Australia",
    "en-CA": "Canada", "en-IE": "Ireland", "en-IN": "India",
    "en-NZ": "New Zealand", "en-ZA": "South Africa", "en-HK": "Hong Kong",
    "en-PH": "Philippines", "en-SG": "Singapore", "en-KE": "Kenya",
    "en-NG": "Nigeria", "en-TZ": "Tanzania",
  };
  return map[locale] || locale;
}

async function syncEdgeVoices() {
  try {
    const tts = new MsEdgeTTS();
    const all = await tts.getVoices();

    const english = all.filter((v) => v.Locale?.startsWith("en-"));
    console.log(`[Edge Sync] Found ${english.length} English voices from Edge TTS`);

    let upserted = 0;
    for (let i = 0; i < english.length; i++) {
      const v = english[i];
      const voiceName = v.ShortName.replace(/Neural$/, "").replace(/.*-/, "");
      const slug = toSlug(v.ShortName);
      const personalities = v.VoiceTag?.VoicePersonalities || [];
      const categories = v.VoiceTag?.ContentCategories || ["General"];
      const previewSample = getPreviewSample(personalities, v.Gender, voiceName);

      await Voice.findOneAndUpdate(
        { slug },
        {
          $set: {
            slug,
            name: voiceName,
            tier: "free",
            provider: "free",
            source: "edge",
            previewUrl: "",
            previewSample,
            tags: [...personalities.slice(0, 2), v.Gender],
            gender: v.Gender,
            accent: localeName(v.Locale),
            age: "Adult",
            languages: [v.Locale],
            description: `${v.FriendlyName}. ${categories.join(", ")} voice — ${personalities.join(", ") || "natural"}.`,
            rating: 4.5,
            usageLabel: "",
            creator: "Microsoft Edge TTS",
            type: "stock",
            xaiVoiceId: v.ShortName,
            img: pickImg(i),
            isPublic: true,
            isActive: true,
            isCoreVoice: false,
            costTier: "low",
            model: "edge",
          },
        },
        { upsert: true }
      );
      upserted++;
    }

    console.log(`[Edge Sync] Upserted ${upserted} Edge TTS voices`);
  } catch (err) {
    console.error("[Edge Sync] Failed:", err.message);
  }
}

module.exports = { syncEdgeVoices };
