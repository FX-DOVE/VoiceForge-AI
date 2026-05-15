const { Voice } = require("../models");

const DEFAULT_VOICES = [
  {
    slug: "antoni",
    name: "Antoni",
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
    xaiVoiceId: "Eve",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
  },
  {
    slug: "sarah",
    name: "Sarah",
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
    xaiVoiceId: "Eve",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWVcK77PB_yx276Gr_o2lGtn-Ns9h25u_SCSCykDUSFgjsCeEr5WQZg_t61JYQMVcmt9-xB0RCj-wkyujn-ZCpUkCD8S_JDVGvjE-5Nb6fnFliYPAw_66Yr0ySx0NkkAgMB1GrHxGpItdutBQ7lJPO6QkYTjanVUrFfKwIggk3jDzMx9IL_oZShjPkzTIXLlpvuJTUqirG0QGDGyHL4Emy39Z3Ts2hvC--S4QiAJd8iKrPHNXr6baWoEt2fGiGALuktxM8n6d_GRk",
  },
  {
    slug: "marcus",
    name: "Marcus",
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
    xaiVoiceId: "Eve",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
  },
  {
    slug: "luna",
    name: "Luna",
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
    xaiVoiceId: "Eve",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWVcK77PB_yx276Gr_o2lGtn-Ns9h25u_SCSCykDUSFgjsCeEr5WQZg_t61JYQMVcmt9-xB0RCj-wkyujn-ZCpUkCD8S_JDVGvjE-5Nb6fnFliYPAw_66Yr0ySx0NkkAgMB1GrHxGpItdutBQ7lJPO6QkYTjanVUrFfKwIggk3jDzMx9IL_oZShjPkzTIXLlpvuJTUqirG0QGDGyHL4Emy39Z3Ts2hvC--S4QiAJd8iKrPHNXr6baWoEt2fGiGALuktxM8n6d_GRk",
  },
];

async function seedDefaultVoices() {
  const count = await Voice.countDocuments();
  if (count > 0) return;

  await Voice.insertMany(DEFAULT_VOICES);
  console.log(`Seeded ${DEFAULT_VOICES.length} default voices`);
}

module.exports = { seedDefaultVoices, DEFAULT_VOICES };
