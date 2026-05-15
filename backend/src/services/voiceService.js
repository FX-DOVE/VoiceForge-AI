const { Voice } = require("../models");

function formatVoice(v) {
  return {
    id: v.slug,
    _id: v._id.toString(),
    slug: v.slug,
    name: v.name,
    tags: v.tags,
    gender: v.gender,
    accent: v.accent,
    age: v.age,
    languages: v.languages,
    description: v.description,
    rating: v.rating,
    usage: v.usageLabel,
    creator: v.creator,
    type: v.type,
    img: v.img,
    previewUrl: v.previewUrl,
    xaiVoiceId: v.xaiVoiceId,
  };
}

async function listVoices(filters = {}) {
  const query = { isActive: true };
  if (filters.type) query.type = filters.type;
  if (filters.gender) query.gender = new RegExp(filters.gender, "i");
  if (filters.language) query.languages = filters.language;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  const voices = await Voice.find(query).sort({ type: 1, name: 1 });
  return voices.map(formatVoice);
}

async function createVoice(userId, data) {
  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
  const voice = await Voice.create({
    ...data,
    slug,
    owner: userId,
    type: data.type || "cloned",
  });
  return formatVoice(voice);
}

module.exports = { listVoices, createVoice, formatVoice };
