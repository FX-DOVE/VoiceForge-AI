const { Voice } = require("../models");

const DEFAULT_VOICES = [
  // ─── FREE VOICES (Microsoft Edge TTS) ────────────────────────────────────
  {
    slug: "antoni",
    name: "Antoni",
    tier: "free",
    tags: ["Deep", "Professional"],
    gender: "Male",
    accent: "American",
    age: "Adult",
    languages: ["English", "Spanish", "French"],
    description:
      "A confident, broadcast-ready male voice. Best for corporate narration, eLearning, and product walkthroughs.",
    rating: 4.9,
    usageLabel: "152k generations",
    creator: "VoiceForge Studio",
    type: "stock",
    xaiVoiceId: "Onyx",
    previewSample: "Welcome to VoiceForge. Professional, broadcast-ready narration — built for impact.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
  },
  {
    slug: "bella",
    name: "Bella",
    tier: "free",
    tags: ["Conversational", "Soft"],
    gender: "Female",
    accent: "American",
    age: "Young Adult",
    languages: ["English", "Spanish", "Italian"],
    description:
      "A friendly, natural-sounding female voice perfect for casual content, explainers, and social media.",
    rating: 4.8,
    usageLabel: "112k generations",
    creator: "VoiceForge Studio",
    type: "stock",
    xaiVoiceId: "Shimmer",
    previewSample: "Hi! I'm Bella. Whether it's a quick explainer or a full podcast episode, I'll make it sound effortless.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3yNFip8ipSMpdIPkUH62nYg3INJqnyq-TYzXmHVpq2mOblZtDXHU7mUH1kXIcEzeU5pRbk3z-co0NZdouUqZgenIC9CzOzcm5vLxPv0lyWdcorypmqjNiZ3qvEICSkYGilD3I1zDIz1izW8Zm7PoIN3ureDYiW40G2tgkmnpZJ-c9TnPGMtnE9rBFdlUpNQ6Afj9F73PyJ4EwL_Oe6BCfIO4ADZkfAvfNYgv2mangcbceP0efVAGn8Xg8Zw4QpXbT9mXIlNaWaFQ",
  },
  {
    slug: "rachel",
    name: "Rachel",
    tier: "free",
    tags: ["Energetic", "Clear"],
    gender: "Female",
    accent: "American",
    age: "Adult",
    languages: ["English"],
    description:
      "An upbeat, articulate female voice with sharp clarity — ideal for ads, promos, and high-energy content.",
    rating: 4.9,
    usageLabel: "189k generations",
    creator: "VoiceForge Studio",
    type: "stock",
    xaiVoiceId: "Alloy",
    previewSample: "Ready to take your content to the next level? Let's go — crisp, clear, and full of energy.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2tgjHbZwPadn9cw8gkAsLy3BUQBYyoxAwGgVkLfOyM6HiZjVInAwRHZ1aW_apmv2jonV32Kt8XI9EP_naAtJe1iDk6A52iZXSjIl74mKvtM5bE3JvRw-3eomYwDnOaX0BKJRV8tVDFyzjtxOYVMLzTEQwVedzcpD_GEraL1Ox2JLl2XK43bwHtKAixzquKTfrV3kd_0LWxm1NRbjHKQCnRksMEV-1EyqOpag-yGBjGHJgwuPMkiQrwlqxgRbyI15wJl86LQg2tMA",
  },
  {
    slug: "luna",
    name: "Luna",
    tier: "free",
    tags: ["Soft", "Conversational"],
    gender: "Female",
    accent: "American",
    age: "Young Adult",
    languages: ["English", "Spanish"],
    description:
      "A warm, approachable conversational female voice for podcasts, social media, and chat experiences.",
    rating: 4.7,
    usageLabel: "76k generations",
    creator: "VoiceForge Studio",
    type: "stock",
    xaiVoiceId: "Nova",
    previewSample: "Hey there! I'm here to make your content feel warm, personal, and totally natural.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWVcK77PB_yx276Gr_o2lGtn-Ns9h25u_SCSCykDUSFgjsCeEr5WQZg_t61JYQMVcmt9-xB0RCj-wkyujn-ZCpUkCD8S_JDVGvjE-5Nb6fnFliYPAw_66Yr0ySx0NkkAgMB1GrHxGpItdutBQ7lJPO6QkYTjanVUrFfKwIggk3jDzMx9IL_oZShjPkzTIXLlpvuJTUqirG0QGDGyHL4Emy39Z3Ts2hvC--S4QiAJd8iKrPHNXr6baWoEt2fGiGALuktxM8n6d_GRk",
  },

  // ─── PRO VOICES (xAI Grok TTS) ───────────────────────────────────────────
  {
    slug: "sarah",
    name: "Sarah",
    tier: "pro",
    tags: ["Clear", "Narration"],
    gender: "Female",
    accent: "American",
    age: "Adult",
    languages: ["English", "German"],
    description:
      "A neutral, articulate female narrator perfect for audiobooks, explainer videos, and onboarding flows.",
    rating: 4.8,
    usageLabel: "98k generations",
    creator: "VoiceForge Studio",
    type: "stock",
    xaiVoiceId: "Aria",
    previewSample: "Clear, precise, and always on point. Let me bring your words to life with clarity and confidence.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWVcK77PB_yx276Gr_o2lGtn-Ns9h25u_SCSCykDUSFgjsCeEr5WQZg_t61JYQMVcmt9-xB0RCj-wkyujn-ZCpUkCD8S_JDVGvjE-5Nb6fnFliYPAw_66Yr0ySx0NkkAgMB1GrHxGpItdutBQ7lJPO6QkYTjanVUrFfKwIggk3jDzMx9IL_oZShjPkzTIXLlpvuJTUqirG0QGDGyHL4Emy39Z3Ts2hvC--S4QiAJd8iKrPHNXr6baWoEt2fGiGALuktxM8n6d_GRk",
  },
  {
    slug: "marcus",
    name: "Marcus",
    tier: "pro",
    tags: ["British", "Cinematic"],
    gender: "Male",
    accent: "British",
    age: "Adult",
    languages: ["English"],
    description:
      "A rich, theatrical British baritone for trailers, audiobooks, and dramatic narration.",
    rating: 4.9,
    usageLabel: "204k generations",
    creator: "VoiceForge Studio",
    type: "stock",
    xaiVoiceId: "Echo",
    previewSample: "From the ancient chronicles to modern tales — every great story deserves a voice worthy of it.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
  },
  {
    slug: "james",
    name: "James",
    tier: "pro",
    tags: ["Authoritative", "News"],
    gender: "Male",
    accent: "American",
    age: "Adult",
    languages: ["English"],
    description:
      "A commanding, news-anchor-quality voice built for documentaries, corporate videos, and authoritative narration.",
    rating: 4.8,
    usageLabel: "67k generations",
    creator: "VoiceForge Studio",
    type: "stock",
    xaiVoiceId: "Onyx",
    previewSample: "This is James. Authoritative, precise, and built for content that demands to be heard.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvtHzWYW9YJzgO_ZRR1_fwvCYGCE5I40t2H_nT91mQWjl56adu0N2kKqLKgfU22nQqPBKuyL7MynP0811hmBL_xZoZcRzkWWHjhOihdPB4D1vsB7r7HQ1uebjx6KJpiFk8b233ysRamZ8A1_4j6OZSVzwJxGQ3HSOIoI-9LbJy59tXbu1ZnPsIov4A9Wr-sOI1wxo-VQgvxkEfwpwYOfkopYZZKxqnm60BoQtEUSzdBX8TCAtr3a3Yh-rhnnUB3QygZepRyo6kmV4",
  },
  {
    slug: "sophia",
    name: "Sophia",
    tier: "pro",
    tags: ["Elegant", "Broadcast"],
    gender: "Female",
    accent: "American",
    age: "Adult",
    languages: ["English", "French", "Spanish"],
    description:
      "A polished, broadcast-quality female voice with a natural warmth — ideal for premium content and brand storytelling.",
    rating: 4.9,
    usageLabel: "143k generations",
    creator: "VoiceForge Studio",
    type: "stock",
    xaiVoiceId: "Nova",
    previewSample: "Sophisticated, clear, and unforgettable. Let me give your brand the voice it deserves.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3yNFip8ipSMpdIPkUH62nYg3INJqnyq-TYzXmHVpq2mOblZtDXHU7mUH1kXIcEzeU5pRbk3z-co0NZdouUqZgenIC9CzOzcm5vLxPv0lyWdcorypmqjNiZ3qvEICSkYGilD3I1zDIz1izW8Zm7PoIN3ureDYiW40G2tgkmnpZJ-c9TnPGMtnE9rBFdlUpNQ6Afj9F73PyJ4EwL_Oe6BCfIO4ADZkfAvfNYgv2mangcbceP0efVAGn8Xg8Zw4QpXbT9mXIlNaWaFQ",
  },
];

async function seedDefaultVoices() {
  for (const voice of DEFAULT_VOICES) {
    await Voice.findOneAndUpdate(
      { slug: voice.slug },
      { $set: { ...voice, previewUrl: "" } },
      { upsert: true }
    );
  }
  console.log(`Upserted ${DEFAULT_VOICES.length} default voices`);
}

module.exports = { seedDefaultVoices, DEFAULT_VOICES };
