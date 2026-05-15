const { Notification } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  sendSuccess(res, {
    notifications: notifications.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      data: n.data,
      createdAt: n.createdAt,
    })),
  });
});

const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, _id: req.params.id },
    { read: true }
  );
  sendSuccess(res, {}, "Notification marked as read.");
});

module.exports = { list, markRead };
