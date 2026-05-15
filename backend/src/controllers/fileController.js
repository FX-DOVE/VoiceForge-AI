const { uploadFromPath } = require("../integrations/storage");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const upload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file was uploaded.",
      errors: {},
    });
  }

  const result = await uploadFromPath(req.file.path, {
    folder: "files",
    mimeType: req.file.mimetype,
  });

  sendSuccess(
    res,
    {
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        url: result.url,
        downloadUrl: result.downloadUrl,
        storageKey: result.storageKey,
      },
    },
    "File uploaded successfully.",
    201
  );
});

module.exports = { upload };
