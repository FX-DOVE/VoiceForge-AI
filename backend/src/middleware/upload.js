const path = require("path");
const fs = require("fs");
const multer = require("multer");
const config = require("../config");

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_AUDIO = ["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/webm", "audio/ogg", "video/webm"];
const ALLOWED_EXT = [".wav", ".mp3", ".m4a", ".webm", ".ogg"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext || !ALLOWED_EXT.includes(ext)) {
      const mimeBase = file.mimetype.split(";")[0].trim().toLowerCase();
      if (mimeBase.includes("webm")) ext = ".webm";
      else if (mimeBase.includes("ogg")) ext = ".ogg";
      else if (mimeBase.includes("mp4") || mimeBase.includes("m4a")) ext = ".m4a";
      else if (mimeBase.includes("mpeg") || mimeBase.includes("mp3")) ext = ".mp3";
      else ext = ".wav";
    }
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function audioFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeBase = file.mimetype.split(";")[0].trim().toLowerCase();
  if (ALLOWED_AUDIO.includes(mimeBase) || ALLOWED_EXT.includes(ext)) {
    return cb(null, true);
  }
  const err = new Error("Only WAV, MP3, M4A, WebM, and OGG audio files are allowed.");
  err.statusCode = 400;
  cb(err);
}

const uploadAudio = multer({
  storage,
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
  fileFilter: audioFilter,
});

const uploadGeneral = multer({
  storage,
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
});

module.exports = { uploadAudio, uploadGeneral, uploadsDir };
