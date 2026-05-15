const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user.toPublicJSON() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl } = req.body;
  if (name !== undefined) req.user.name = name;
  if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
  await req.user.save();
  sendSuccess(res, { user: req.user.toPublicJSON() }, "Profile updated successfully.");
});

module.exports = { getProfile, updateProfile };
