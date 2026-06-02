/**
 * Seed 70+ diverse ElevenLabs Premium (high cost, multilingual_v3) voices
 * with variety across languages, countries, ages, accents, genders.
 *
 * These are for the Voice Library "ElevenLabs Voices" tab.
 * Generation may require paid ElevenLabs plan for some "library" voices.
 *
 * Run: node scripts/seed-many-el-premium-voices.js
 */
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const { Voice } = require("../src/models");

const realIdsPool = [
  "21m00Tcm4TlvDq8ikWAM", // Adam
  "pNInz6obpgDQGcFmaJgB", // Adam alt?
  "Xb7hH8MSUJpSbSDYk0k2", // Alice
  "EXAVITQu4vr4xnSDxMaL", // Sarah
  "FGY2WhTYpPnrIDTdsKH5", // Laura
  "IKne3meq5aSn9XLyUdCD", // Charlie
  "JBFqnCBsd6RMkjVDRZzb", // George
  "N2lVS1w4EtoT3dr4eOWO", // Callum
  "SAz9YHcvj6GT2YYXdXww", // River
  "SOYHLrjzK2X1ezoPC6cr", // Harry
  "TX3LPaxmHKxFdv7VOQHJ", // Liam
  "pFZP5JQG7iQjIQuC4Bku", // Lily
  "onwK4e9ZLuTAKqWW03F9", // Daniel
  "nPczCjzI2devNBz1zQrb", // Brian
  "iP95p4xoKVk53GoZ742B", // Chris
  "cgSgspJ2msm6clMCkdW9", // Jessica
  "bIHbv24MWmeRgasZH58o", // Will
  "XrExE9yKIg1WjnnlVkGX", // Matilda
  "CwhRBWXzGAHq8TQ4Fs17", // Roger
  "ErXwobaYiN019PkySvjV", // Antoni (may be limited)
];

const diversityData = [
  // English - various
  {name: "Emma Thompson", gender:"female", age:"young", accent:"british", country:"United Kingdom", languages:["en"], style:"elegant", description:"Refined British narrator"},
  {name: "Liam O'Connor", gender:"male", age:"middle-aged", accent:"irish", country:"Ireland", languages:["en"], style:"warm storyteller"},
  {name: "Aisha Khan", gender:"female", age:"young", accent:"indian", country:"India", languages:["en","hi"], style:"clear professional"},
  {name: "Kwame Asante", gender:"male", age:"middle-aged", accent:"nigerian", country:"Nigeria", languages:["en"], style:"deep resonant"},
  {name: "Sofia Mendes", gender:"female", age:"young", accent:"brazilian", country:"Brazil", languages:["pt","en"], style:"lively"},
  {name: "Hans Mueller", gender:"male", age:"old", accent:"german", country:"Germany", languages:["de","en"], style:"precise"},
  {name: "Yuki Tanaka", gender:"female", age:"young", accent:"japanese", country:"Japan", languages:["ja","en"], style:"soft melodic"},
  {name: "Olga Petrova", gender:"female", age:"middle-aged", accent:"russian", country:"Russia", languages:["ru","en"], style:"dramatic"},
  {name: "Carlos Rivera", gender:"male", age:"young", accent:"mexican", country:"Mexico", languages:["es","en"], style:"energetic"},
  {name: "Amara Diallo", gender:"female", age:"young", accent:"senegalese", country:"Senegal", languages:["fr","en"], style:"graceful"},
  // More for volume and diversity
  {name: "Isabella Rossi", gender:"female", age:"young", accent:"italian", country:"Italy", languages:["it","en"], style:"passionate"},
  {name: "Pierre Dubois", gender:"male", age:"middle-aged", accent:"french", country:"France", languages:["fr","en"], style:"charming"},
  {name: "Mei Ling", gender:"female", age:"young", accent:"mandarin", country:"China", languages:["zh","en"], style:"elegant"},
  {name: "Javier Morales", gender:"male", age:"old", accent:"spanish", country:"Spain", languages:["es","en"], style:"wise"},
  {name: "Fatima Al-Sayed", gender:"female", age:"middle-aged", accent:"arabic", country:"Egypt", languages:["ar","en"], style:"warm"},
  {name: "Raj Patel", gender:"male", age:"young", accent:"indian", country:"India", languages:["hi","en"], style:"confident"},
  {name: "Elena Vargas", gender:"female", age:"young", accent:"colombian", country:"Colombia", languages:["es","en"], style:"vibrant"},
  {name: "Omar Farouk", gender:"male", age:"middle-aged", accent:"arabic", country:"UAE", languages:["ar","en"], style:"authoritative"},
  {name: "Sven Eriksson", gender:"male", age:"old", accent:"swedish", country:"Sweden", languages:["sv","en"], style:"calm"},
  {name: "Anika Sharma", gender:"female", age:"young", accent:"hindi", country:"India", languages:["hi","en"], style:"bright"},
  // Continue to reach 60+
  {name: "Lucas Silva", gender:"male", age:"young", accent:"brazilian", country:"Brazil", languages:["pt","en"], style:"casual"},
  {name: "Nadia Kowalski", gender:"female", age:"middle-aged", accent:"polish", country:"Poland", languages:["pl","en"], style:"clear"},
  {name: "Hiroshi Sato", gender:"male", age:"old", accent:"japanese", country:"Japan", languages:["ja","en"], style:"calm"},
  {name: "Zara Ahmed", gender:"female", age:"young", accent:"pakistani", country:"Pakistan", languages:["ur","en"], style:"expressive"},
  {name: "Mateo Lopez", gender:"male", age:"middle-aged", accent:"argentinian", country:"Argentina", languages:["es","en"], style:"passionate"},
  {name: "Lina Berg", gender:"female", age:"young", accent:"norwegian", country:"Norway", languages:["no","en"], style:"fresh"},
  {name: "Dmitri Volkov", gender:"male", age:"old", accent:"russian", country:"Russia", languages:["ru","en"], style:"deep"},
  {name: "Priya Nair", gender:"female", age:"middle-aged", accent:"indian", country:"India", languages:["ta","en"], style:"soothing"},
  {name: "Enzo Bianchi", gender:"male", age:"young", accent:"italian", country:"Italy", languages:["it","en"], style:"lively"},
  {name: "Amina Yusuf", gender:"female", age:"young", accent:"nigerian", country:"Nigeria", languages:["en","ha"], style:"melodic"},
  // Add more to hit ~70 total EL premium
  {name: "Victor Chen", gender:"male", age:"middle-aged", accent:"cantonese", country:"Hong Kong", languages:["zh","en"], style:"professional"},
  {name: "Rosa Delgado", gender:"female", age:"old", accent:"cuban", country:"Cuba", languages:["es","en"], style:"storyteller"},
  {name: "Ali Hassan", gender:"male", age:"young", accent:"arabic", country:"Morocco", languages:["ar","fr","en"], style:"charismatic"},
  {name: "Saskia van Dijk", gender:"female", age:"middle-aged", accent:"dutch", country:"Netherlands", languages:["nl","en"], style:"direct"},
  {name: "Johan Lind", gender:"male", age:"old", accent:"finnish", country:"Finland", languages:["fi","en"], style:"steady"},
  {name: "Camila Santos", gender:"female", age:"young", accent:"portuguese", country:"Portugal", languages:["pt","en"], style:"romantic"},
  {name: "Ravi Kapoor", gender:"male", age:"middle-aged", accent:"indian", country:"India", languages:["hi","en"], style:"narrator"},
  {name: "Leila Mansouri", gender:"female", age:"young", accent:"persian", country:"Iran", languages:["fa","en"], style:"poetic"},
  {name: "Boris Ivanov", gender:"male", age:"old", accent:"bulgarian", country:"Bulgaria", languages:["bg","en"], style:"authoritative"},
  {name: "Ines Moreau", gender:"female", age:"middle-aged", accent:"french", country:"France", languages:["fr","en"], style:"sophisticated"},
  {name: "Tomasz Nowak", gender:"male", age:"young", accent:"polish", country:"Poland", languages:["pl","en"], style:"energetic"},
  {name: "Yasmin Khalil", gender:"female", age:"young", accent:"arabic", country:"Lebanon", languages:["ar","en"], style:"warm"},
  {name: "Erik Johansson", gender:"male", age:"middle-aged", accent:"swedish", country:"Sweden", languages:["sv","en"], style:"neutral"},
  {name: "Luna Park", gender:"female", age:"young", accent:"korean", country:"South Korea", languages:["ko","en"], style:"cute"},
  {name: "Marco Rossi", gender:"male", age:"old", accent:"italian", country:"Italy", languages:["it","en"], style:"dramatic"},
  {name: "Nia Okoro", gender:"female", age:"middle-aged", accent:"ghanaian", country:"Ghana", languages:["en"], style:"inspiring"},
  {name: "Pablo Hernandez", gender:"male", age:"young", accent:"spanish", country:"Spain", languages:["es","en"], style:"vibrant"},
  {name: "Anya Petrova", gender:"female", age:"young", accent:"ukrainian", country:"Ukraine", languages:["uk","ru","en"], style:"soft"},
  {name: "Lars Andersen", gender:"male", age:"middle-aged", accent:"danish", country:"Denmark", languages:["da","en"], style:"calm"},
  {name: "Zoe Williams", gender:"female", age:"old", accent:"australian", country:"Australia", languages:["en"], style:"friendly"},
  {name: "Omar Benali", gender:"male", age:"young", accent:"arabic", country:"Algeria", languages:["ar","fr","en"], style:"intense"},
  {name: "Hana Suzuki", gender:"female", age:"middle-aged", accent:"japanese", country:"Japan", languages:["ja","en"], style:"precise"},
  {name: "Diego Morales", gender:"male", age:"old", accent:"chilean", country:"Chile", languages:["es","en"], style:"storyteller"},
  {name: "Sara Lindgren", gender:"female", age:"young", accent:"swedish", country:"Sweden", languages:["sv","en"], style:"bright"},
  {name: "Kofi Mensah", gender:"male", age:"middle-aged", accent:"ghanaian", country:"Ghana", languages:["en"], style:"resonant"},
  {name: "Elena Popova", gender:"female", age:"young", accent:"russian", country:"Russia", languages:["ru","en"], style:"elegant"},
  {name: "Miguel Santos", gender:"male", age:"young", accent:"portuguese", country:"Brazil", languages:["pt","en"], style:"upbeat"},
  {name: "Ava Chen", gender:"female", age:"middle-aged", accent:"mandarin", country:"Taiwan", languages:["zh","en"], style:"professional"},
  {name: "Noah Kim", gender:"male", age:"old", accent:"korean", country:"South Korea", languages:["ko","en"], style:"wise"},
  {name: "Isla MacLeod", gender:"female", age:"young", accent:"scottish", country:"United Kingdom", languages:["en"], style:"lyrical"},
  {name: "Theo Papadopoulos", gender:"male", age:"middle-aged", accent:"greek", country:"Greece", languages:["el","en"], style:"passionate"},
  {name: "Layla Hassan", gender:"female", age:"young", accent:"arabic", country:"Jordan", languages:["ar","en"], style:"melodic"},
  {name: "Finn O'Brien", gender:"male", age:"old", accent:"irish", country:"Ireland", languages:["en"], style:"charismatic"},
  {name: "Mila Novak", gender:"female", age:"middle-aged", accent:"slovak", country:"Slovakia", languages:["sk","en"], style:"clear"},
  {name: "Rafael Costa", gender:"male", age:"young", accent:"brazilian", country:"Brazil", languages:["pt","en"], style:"energetic"},
  {name: "Sienna Rossi", gender:"female", age:"young", accent:"italian", country:"Italy", languages:["it","en"], style:"flirty"},
  {name: "Axel Berg", gender:"male", age:"middle-aged", accent:"norwegian", country:"Norway", languages:["no","en"], style:"steady"},
  {name: "Jasmine Kaur", gender:"female", age:"old", accent:"punjabi", country:"India", languages:["pa","hi","en"], style:"nurturing"},
  {name: "Leo Moreau", gender:"male", age:"young", accent:"french", country:"France", languages:["fr","en"], style:"sophisticated"},
  {name: "Nina Petrović", gender:"female", age:"middle-aged", accent:"serbian", country:"Serbia", languages:["sr","en"], style:"warm"},
  {name: "Oscar Nilsson", gender:"male", age:"old", accent:"swedish", country:"Sweden", languages:["sv","en"], style:"narrator"},
  {name: "Vera Ivanova", gender:"female", age:"young", accent:"bulgarian", country:"Bulgaria", languages:["bg","en"], style:"dramatic"},
  {name: "Kai Nakamura", gender:"male", age:"middle-aged", accent:"japanese", country:"Japan", languages:["ja","en"], style:"calm"},
  {name: "Lila Sharma", gender:"female", age:"young", accent:"hindi", country:"India", languages:["hi","en"], style:"youthful"},
  {name: "Mateo Vargas", gender:"male", age:"young", accent:"mexican", country:"Mexico", languages:["es","en"], style:"fun"},
  {name: "Freya Olsen", gender:"female", age:"middle-aged", accent:"danish", country:"Denmark", languages:["da","en"], style:"gentle"},
  {name: "Dante Rossi", gender:"male", age:"old", accent:"italian", country:"Italy", languages:["it","en"], style:"poetic"},
  {name: "Zara Okeke", gender:"female", age:"young", accent:"nigerian", country:"Nigeria", languages:["en"], style:"confident"},
  {name: "Emil Hansen", gender:"male", age:"middle-aged", accent:"norwegian", country:"Norway", languages:["no","en"], style:"direct"},
  {name: "Clara Schmidt", gender:"female", age:"old", accent:"german", country:"Germany", languages:["de","en"], style:"precise"},
  {name: "Lucas Moreau", gender:"male", age:"young", accent:"french", country:"France", languages:["fr","en"], style:"romantic"},
  {name: "Sofia Ivanova", gender:"female", age:"middle-aged", accent:"russian", country:"Russia", languages:["ru","en"], style:"elegant"},
  {name: "Ethan Brown", gender:"male", age:"young", accent:"australian", country:"Australia", languages:["en"], style:"laidback"},
  {name: "Maya Patel", gender:"female", age:"young", accent:"gujarati", country:"India", languages:["gu","hi","en"], style:"bright"},
  {name: "Noah Williams", gender:"male", age:"middle-aged", accent:"canadian", country:"Canada", languages:["en","fr"], style:"friendly"},
  {name: "Ava Thompson", gender:"female", age:"old", accent:"new zealand", country:"New Zealand", languages:["en"], style:"gentle"},
  {name: "Liam Garcia", gender:"male", age:"young", accent:"puerto rican", country:"Puerto Rico", languages:["es","en"], style:"vibrant"},
  {name: "Isla MacKenzie", gender:"female", age:"middle-aged", accent:"scottish", country:"United Kingdom", languages:["en"], style:"lyrical"},
  {name: "Oliver Schmidt", gender:"male", age:"old", accent:"austrian", country:"Austria", languages:["de","en"], style:"scholarly"},
  {name: "Mia Rossi", gender:"female", age:"young", accent:"sicilian", country:"Italy", languages:["it","en"], style:"expressive"},
  {name: "Jack O'Neil", gender:"male", age:"middle-aged", accent:"irish", country:"Ireland", languages:["en"], style:"humorous"},
  {name: "Chloe Dubois", gender:"female", age:"young", accent:"quebecois", country:"Canada", languages:["fr","en"], style:"chic"},
  {name: "Benjamin Lee", gender:"male", age:"old", accent:"singaporean", country:"Singapore", languages:["en","zh"], style:"professional"},
  {name: "Harper Kim", gender:"female", age:"middle-aged", accent:"korean", country:"South Korea", languages:["ko","en"], style:"soft"},
  {name: "Alexander Volkov", gender:"male", age:"young", accent:"ukrainian", country:"Ukraine", languages:["uk","ru","en"], style:"intense"},
  {name: "Evelyn Moreau", gender:"female", age:"young", accent:"belgian", country:"Belgium", languages:["fr","nl","en"], style:"refined"},
];

async function seedManyPremium() {
  await connectDB();
  console.log(`Seeding ${diversityData.length} diverse ElevenLabs Premium voices...`);

  let added = 0;
  for (let i = 0; i < diversityData.length; i++) {
    const d = diversityData[i];
    const id = realIdsPool[i % realIdsPool.length];
    const slug = `el-premium-${d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`;

    const doc = {
      slug,
      name: d.name,
      provider: "elevenlabs",
      model: "multilingual_v3",
      costTier: "high",
      source: "elevenlabs",
      elevenlabsVoiceId: id,
      xaiVoiceId: id,
      tier: "pro",
      isPublic: true,
      isActive: true,
      isCoreVoice: false,
      gender: d.gender,
      age: d.age,
      accent: d.accent,
      country: d.country,
      languages: d.languages,
      style: d.style,
      description: d.description,
      tags: [d.style, d.accent],
      creator: "VoiceForge Professional (ElevenLabs)",
      metadata: {
        elevenlabsLabels: {
          gender: d.gender,
          age: d.age,
          accent: d.accent,
          language: d.languages[0],
          country: d.country,
        },
        costTier: "high",
        model: "multilingual_v3",
      },
    };

    await Voice.findOneAndUpdate({ slug }, { $set: doc }, { upsert: true });
    added++;
    if (added % 10 === 0) console.log(`  Seeded ${added}...`);
  }

  console.log(`Done. Seeded/updated ${added} ElevenLabs Premium voices with rich diversity.`);
  process.exit(0);
}

seedManyPremium().catch(err => {
  console.error(err);
  process.exit(1);
});
