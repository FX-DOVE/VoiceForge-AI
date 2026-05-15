const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
const { uploadsDir } = require("../middleware/upload");

let cloudinary = null;

function isCloudinaryConfigured() {
  return Boolean(
    config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret
  );
}

function getCloudinary() {
  if (!cloudinary && isCloudinaryConfigured()) {
    const { v2 } = require("cloudinary");
    cloudinary = v2;
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
  }
  return cloudinary;
}

async function uploadBuffer(buffer, { folder, filename, mimeType }) {
  const key = `${folder}/${uuidv4()}-${filename}`;

  if (config.storageProvider === "cloudinary" && isCloudinaryConfigured()) {
    const cld = getCloudinary();
    const result = await new Promise((resolve, reject) => {
      const stream = cld.uploader.upload_stream(
        {
          folder: config.cloudinary.folder,
          resource_type: "auto",
          public_id: key.replace(/\//g, "_"),
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      stream.end(buffer);
    });
    return {
      storageKey: result.public_id,
      url: result.secure_url,
      downloadUrl: result.secure_url,
    };
  }

  const localFolder = path.join(uploadsDir, folder);
  if (!fs.existsSync(localFolder)) fs.mkdirSync(localFolder, { recursive: true });

  const localPath = path.join(localFolder, path.basename(key));
  fs.writeFileSync(localPath, buffer);

  const relative = `/uploads/${folder}/${path.basename(key)}`;
  return {
    storageKey: key,
    url: relative,
    downloadUrl: relative,
    localPath,
  };
}

async function uploadFromPath(filePath, options) {
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  return uploadBuffer(buffer, { ...options, filename, mimeType: options.mimeType || "application/octet-stream" });
}

module.exports = { uploadBuffer, uploadFromPath, isCloudinaryConfigured };
