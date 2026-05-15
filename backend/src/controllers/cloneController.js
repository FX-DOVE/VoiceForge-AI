const cloneService = require("../services/cloneService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const upload = asyncHandler(async (req, res) => {
  const cloneId = req.body.cloneId || null;
  const { clone, samples } = await cloneService.uploadSamples(
    req.user._id,
    cloneId,
    req.files
  );
  sendSuccess(
    res,
    {
      cloneId: clone._id.toString(),
      status: clone.status,
      samples: samples.map((s) => ({
        id: s._id.toString(),
        originalName: s.originalName,
        url: s.url,
      })),
    },
    "Samples uploaded successfully.",
    201
  );
});

const configure = asyncHandler(async (req, res) => {
  const clone = await cloneService.configureClone(req.user._id, req.body);
  sendSuccess(
    res,
    { cloneId: clone._id.toString(), status: clone.status, name: clone.name },
    "Voice clone configured successfully."
  );
});

const start = asyncHandler(async (req, res) => {
  const { clone, job } = await cloneService.startTraining(
    req.user._id,
    req.body.cloneId
  );
  sendSuccess(
    res,
    {
      cloneId: clone._id.toString(),
      jobId: job._id.toString(),
      status: clone.status,
    },
    "Training started successfully."
  );
});

const status = asyncHandler(async (req, res) => {
  const data = await cloneService.getCloneStatus(req.user._id, req.params.id);
  sendSuccess(res, data);
});

const list = asyncHandler(async (req, res) => {
  const clones = await cloneService.listClones(req.user._id);
  sendSuccess(res, { clones });
});

module.exports = { upload, configure, start, status, list };
