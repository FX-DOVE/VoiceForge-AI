const mongoose = require("mongoose");
const config = require("../src/config");
const { Voice } = require("../src/models");

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  const elVoices = await Voice.find({ 
    provider: 'elevenlabs', 
    elevenlabsVoiceId: { $exists: true, $ne: '' }, 
    isActive: true, 
    isPublic: true 
  }).select('name provider elevenlabsVoiceId tier isPublic').lean();
  console.log('Real public active EL voices in DB:', elVoices.length);
  if (elVoices.length > 0) {
    console.log('First few:');
    elVoices.slice(0,3).forEach(v => console.log(' -', v.name, 'id:', v.elevenlabsVoiceId?.substring(0,8), 'public:', v.isPublic));
  } else {
    console.log('No voices found with the strict criteria!');
    const anyEl = await Voice.find({ provider: 'elevenlabs' }).select('name elevenlabsVoiceId isActive isPublic').limit(5).lean();
    console.log('Any with provider=elevenlabs (sample):', anyEl);
  }
  await mongoose.disconnect();
})();
