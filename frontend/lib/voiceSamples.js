/**
 * Curated xAI TTS voice samples for the landing page.
 *
 * Audio files are pre-generated and stored as static assets in:
 *   /public/audio/voices/<id>.mp3
 *
 * To regenerate audio run:
 *   node scripts/generate-xai-voice-samples.js
 *
 * No xAI API calls are made during playback — credits are never deducted.
 */

export const DEMO_TEXT =
  "Welcome to our AI voice platform. Create natural sounding speech in seconds.";

/**
 * audioPath values are relative backend paths served at /uploads/previews/.
 * The landing page resolves them via getMediaUrl() from @/lib/api/config.
 *
 * To regenerate audio (once xAI TTS is enabled on your account):
 *   node scripts/generate-voice-previews.js --force
 */
export const voiceSamples = [
  {
    id: "ara",
    displayName: "Ara",
    xaiVoiceId: "ara",
    description: "Clear, Professional",
    category: "Professional Female",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3yNFip8ipSMpdIPkUH62nYg3INJqnyq-TYzXmHVpq2mOblZtDXHU7mUH1kXIcEzeU5pRbk3z-co0NZdouUqZgenIC9CzOzcm5vLxPv0lyWdcorypmqjNiZ3qvEICSkYGilD3I1zDIz1izW8Zm7PoIN3ureDYiW40G2tgkmnpZJ-c9TnPGMtnE9rBFdlUpNQ6Afj9F73PyJ4EwL_Oe6BCfIO4ADZkfAvfNYgv2mangcbceP0efVAGn8Xg8Zw4QpXbT9mXIlNaWaFQ",
    audioPath: "/uploads/voice-previews/ara.mp3",
  },
  {
    id: "leo",
    displayName: "Leo",
    xaiVoiceId: "leo",
    description: "Professional, Deep",
    category: "Professional Male",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvtHzWYW9YJzgO_ZRR1_fwvCYGCE5I40t2H_nT91mQWjl56adu0N2kKqLKgfU22nQqPBKuyL7MynP0811hmBL_xZoZcRzkWWHjhOihdPB4D1vsB7r7HQ1uebjx6KJpiFk8b233ysRamZ8A1_4j6OZSVzwJxGQ3HSOIoI-9LbJy59tXbu1ZnPsIov4A9Wr-sOI1wxo-VQgvxkEfwpwYOfkopYZZKxqnm60BoQtEUSzdBX8TCAtr3a3Yh-rhnnUB3QygZepRyo6kmV4",
    audioPath: "/uploads/voice-previews/leo.mp3",
  },
  {
    id: "eve",
    displayName: "Eve",
    xaiVoiceId: "eve",
    description: "Warm, Conversational",
    category: "Warm Female",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2tgjHbZwPadn9cw8gkAsLy3BUQBYyoxAwGgVkLfOyM6HiZjVInAwRHZ1aW_apmv2jonV32Kt8XI9EP_naAtJe1iDk6A52iZXSjIl74mKvtM5bE3JvRw-3eomYwDnOaX0BKJRV8tVDFyzjtxOYVMLzTEQwVedzcpD_GEraL1Ox2JLl2XK43bwHtKAixzquKTfrV3kd_0LWxm1NRbjHKQCnRksMEV-1EyqOpag-yGBjGHJgwuPMkiQrwlqxgRbyI15wJl86LQg2tMA",
    audioPath: "/uploads/voice-previews/eve.mp3",
  },
  {
    id: "sal",
    displayName: "Sal",
    xaiVoiceId: "sal",
    description: "Friendly, Soft",
    category: "Calm Female",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3yNFip8ipSMpdIPkUH62nYg3INJqnyq-TYzXmHVpq2mOblZtDXHU7mUH1kXIcEzeU5pRbk3z-co0NZdouUqZgenIC9CzOzcm5vLxPv0lyWdcorypmqjNiZ3qvEICSkYGilD3I1zDIz1izW8Zm7PoIN3ureDYiW40G2tgkmnpZJ-c9TnPGMtnE9rBFdlUpNQ6Afj9F73PyJ4EwL_Oe6BCfIO4ADZkfAvfNYgv2mangcbceP0efVAGn8Xg8Zw4QpXbT9mXIlNaWaFQ",
    audioPath: "/uploads/voice-previews/sal.mp3",
  },
  {
    id: "rex",
    displayName: "Rex",
    xaiVoiceId: "rex",
    description: "Rich, Narrative",
    category: "Narrator Male",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvtHzWYW9YJzgO_ZRR1_fwvCYGCE5I40t2H_nT91mQWjl56adu0N2kKqLKgfU22nQqPBKuyL7MynP0811hmBL_xZoZcRzkWWHjhOihdPB4D1vsB7r7HQ1uebjx6KJpiFk8b233ysRamZ8A1_4j6OZSVzwJxGQ3HSOIoI-9LbJy59tXbu1ZnPsIov4A9Wr-sOI1wxo-VQgvxkEfwpwYOfkopYZZKxqnm60BoQtEUSzdBX8TCAtr3a3Yh-rhnnUB3QygZepRyo6kmV4",
    audioPath: "/uploads/voice-previews/rex.mp3",
  },
];
