const ttsService = require("../services/ttsService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const generate = asyncHandler(async (req, res) => {
  const generation = await ttsService.generateTts(req.user._id, req.body);
  sendSuccess(res, { generation }, "Audio generated successfully.", 201);
});

const getById = asyncHandler(async (req, res) => {
  const generation = await ttsService.getGeneration(req.user._id, req.params.id);
  sendSuccess(res, { generation });
});

const history = asyncHandler(async (req, res) => {
  const data = await ttsService.getHistory(req.user._id, {
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 20,
    search: req.query.search || "",
  });
  sendSuccess(res, data);
});

module.exports = { generate, getById, history };
