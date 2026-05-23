require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  mongodbUri:
    process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-in-production",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  xai: {
    apiKey: process.env.XAI_API_KEY || "",
    teamId: process.env.XAI_TEAM_ID || "",
    ttsModel: process.env.XAI_TTS_MODEL || "tts-1",
    defaultVoiceId: process.env.XAI_DEFAULT_VOICE_ID || "ara",
    defaultLanguage: process.env.XAI_DEFAULT_LANGUAGE || "auto",
  },
  voicePreviewText:
    process.env.VOICE_PREVIEW_TEXT ||
    "Welcome to our AI voice platform. Create natural sounding speech in seconds.",
  welcomeCredits: parseInt(process.env.DEFAULT_WELCOME_CREDITS, 10) || 2380,
  welcomeCreditUsd: parseFloat(process.env.DEFAULT_WELCOME_CREDIT_USD) || 0.01,
  serverUrl: process.env.SERVER_URL || (process.env.NODE_ENV === "production" ? "https://voiceforgeai.site" : `http://localhost:${parseInt(process.env.PORT, 10) || 5000}`),
  adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase().trim(),
  ttsProvider: process.env.TTS_PROVIDER || "auto",
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
  paystack: {
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
    secretKey: process.env.PAYSTACK_SECRET_KEY || "",
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || "",
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL || "",
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.EMAIL_FROM || "VoiceForge AI <noreply@voiceforge.ai>",
  },
  smtp: {
    host: process.env.SMTP_HOST || "mail.privateemail.com",
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    secure: process.env.SMTP_SECURE === "true" || true,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
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
