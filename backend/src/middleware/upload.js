const path = require("path");
const fs = require("fs");
const multer = require("multer");
const config = require("../config");

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_AUDIO = ["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/m4a"];
const ALLOWED_EXT = [".wav", ".mp3", ".m4a"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function audioFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_AUDIO.includes(file.mimetype) || ALLOWED_EXT.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error("Only WAV, MP3, and M4A audio files are allowed."));
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
