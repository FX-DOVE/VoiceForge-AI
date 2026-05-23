const { Voice } = require("../models");

// xAI TTS has exactly 5 voices: eve, ara, rex, sal, leo
// Free voices use Edge TTS neural voices.

const DEFAULT_VOICES = [
  // PRO — xAI TTS (the only 5 voices xAI TTS supports)
  { slug:"ara", name:"Ara", gender:"Female", accent:"Multilingual", age:"Adult", languages:["English","Spanish","French","German","Chinese","Japanese","Portuguese","Russian","Italian","Hindi","Arabic","Korean"], tags:["Multilingual","Female","Warm"],   tier:"pro",  type:"stock", xaiVoiceId:"ara", edgeVoiceId:"en-US-JennyMultilingualNeural",  description:"Warm multilingual female voice powered by xAI. Speaks 12+ languages.", rating:4.9, usageLabel:"312k generations", creator:"VoiceForge Studio", isPublic:true, isActive:true, isCoreVoice:true, source:"xai" },
  { slug:"eve", name:"Eve", gender:"Female", accent:"Multilingual", age:"Adult", languages:["English","Spanish","French","German","Chinese","Japanese","Portuguese","Russian","Italian","Hindi","Arabic","Korean"], tags:["Multilingual","Female","Clear"],  tier:"pro",  type:"stock", xaiVoiceId:"eve", edgeVoiceId:"en-US-AvaMultilingualNeural",    description:"Clear articulate multilingual female voice powered by xAI.",            rating:4.9, usageLabel:"287k generations", creator:"VoiceForge Studio", isPublic:true, isActive:true, isCoreVoice:true, source:"xai" },
  { slug:"leo", name:"Leo", gender:"Male",   accent:"Multilingual", age:"Adult", languages:["English","Spanish","French","German","Chinese","Japanese","Portuguese","Russian","Italian","Hindi","Arabic","Korean"], tags:["Multilingual","Male","Deep"],     tier:"pro",  type:"stock", xaiVoiceId:"leo", edgeVoiceId:"en-US-AndrewMultilingualNeural", description:"Deep resonant multilingual male voice powered by xAI.",                 rating:4.8, usageLabel:"198k generations", creator:"VoiceForge Studio", isPublic:true, isActive:true, isCoreVoice:true, source:"xai" },
  { slug:"rex", name:"Rex", gender:"Male",   accent:"Multilingual", age:"Adult", languages:["English","Spanish","French","German","Chinese","Japanese","Portuguese","Russian","Italian","Hindi","Arabic","Korean"], tags:["Multilingual","Male","Powerful"], tier:"pro",  type:"stock", xaiVoiceId:"rex", edgeVoiceId:"en-US-BrianMultilingualNeural",  description:"Powerful authoritative multilingual male voice powered by xAI.",        rating:4.8, usageLabel:"176k generations", creator:"VoiceForge Studio", isPublic:true, isActive:true, isCoreVoice:true, source:"xai" },
  { slug:"sal", name:"Sal", gender:"Male",   accent:"Multilingual", age:"Adult", languages:["English","Spanish","French","German","Chinese","Japanese","Portuguese","Russian","Italian","Hindi","Arabic","Korean"], tags:["Multilingual","Male","Smooth"],   tier:"pro",  type:"stock", xaiVoiceId:"sal", edgeVoiceId:"en-US-SteffanNeural",            description:"Smooth conversational multilingual male voice powered by xAI.",         rating:4.7, usageLabel:"143k generations", creator:"VoiceForge Studio", isPublic:true, isActive:true, isCoreVoice:true, source:"xai" },

  // FREE — Edge TTS voices
  { slug:"Antoni", name:"Antoni", gender:"Male",   accent:"American", age:"Adult",       languages:["English"], tags:["Deep","Professional"],  tier:"free", type:"stock", xaiVoiceId:"", edgeVoiceId:"en-US-ChristopherNeural", description:"Confident broadcast-ready male for corporate narration.", rating:4.9, usageLabel:"152k generations", creator:"VoiceForge Studio", isPublic:true, isActive:true },
  { slug:"bella",  name:"Bella",  gender:"Female", accent:"American", age:"Young Adult", languages:["English"], tags:["Conversational","Soft"], tier:"free", type:"stock", xaiVoiceId:"", edgeVoiceId:"en-US-MichelleNeural",    description:"Friendly natural female for casual content.",             rating:4.8, usageLabel:"112k generations", creator:"VoiceForge Studio", isPublic:true, isActive:true },
  { slug:"rachel", name:"Rachel", gender:"Female", accent:"American", age:"Adult",       languages:["English"], tags:["Energetic","Clear"],     tier:"free", type:"stock", xaiVoiceId:"", edgeVoiceId:"en-US-AnaNeural",         description:"Upbeat articulate female for ads and promos.",            rating:4.9, usageLabel:"189k generations", creator:"VoiceForge Studio", isPublic:true, isActive:true },
  { slug:"luna",   name:"Luna",   gender:"Female", accent:"American", age:"Young Adult", languages:["English"], tags:["Soft","Warm"],           tier:"free", type:"stock", xaiVoiceId:"", edgeVoiceId:"en-US-AriaNeural",        description:"Warm approachable female for podcasts.",                  rating:4.7, usageLabel:"76k generations",  creator:"VoiceForge Studio", isPublic:true, isActive:true },
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
