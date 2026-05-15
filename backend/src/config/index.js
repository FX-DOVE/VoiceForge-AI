require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/voiceforge",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-in-production",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  xai: {
    apiKey: process.env.XAI_API_KEY || "",
    ttsUrl: process.env.XAI_TTS_URL || "https://api.x.ai/v1/tts",
    defaultVoiceId: process.env.XAI_DEFAULT_VOICE_ID || "Eve",
    defaultLanguage: process.env.XAI_DEFAULT_LANGUAGE || "en",
    defaultCodec: process.env.XAI_DEFAULT_CODEC || "mp3",
    defaultSampleRate: parseInt(process.env.XAI_DEFAULT_SAMPLE_RATE, 10) || 44100,
    defaultBitRate: parseInt(process.env.XAI_DEFAULT_BIT_RATE, 10) || 128000,
  },
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    folder: process.env.CLOUDINARY_FOLDER || "voiceforge",
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.AWS_S3_BUCKET || "",
  },
  storageProvider: process.env.STORAGE_PROVIDER || "local",
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    proPriceId: process.env.STRIPE_PRO_PRICE_ID || "",
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.EMAIL_FROM || "VoiceForge AI <noreply@voiceforge.ai>",
  },
  passwordResetExpiresMinutes:
    parseInt(process.env.PASSWORD_RESET_EXPIRES_MINUTES, 10) || 60,
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB, 10) || 25,
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  planLimits: {
    free: { charactersLimit: 10000, concurrentJobs: 1 },
    pro: { charactersLimit: 100000, concurrentJobs: 5 },
    enterprise: { charactersLimit: 1000000, concurrentJobs: 20 },
  },
};

module.exports = config;
