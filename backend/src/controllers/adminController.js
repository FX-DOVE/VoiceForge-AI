const adminService = require("../services/adminService");
const { sendSuccess } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const dashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboard();
  sendSuccess(res, data);
});

const users = asyncHandler(async (req, res) => {
  const data = await adminService.listUsers({
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 20,
    search: req.query.search || "",
    plan: req.query.plan,
    status: req.query.status,
  });
  sendSuccess(res, data);
});

const systemHealth = asyncHandler(async (req, res) => {
  const data = await adminService.getSystemHealth();
  sendSuccess(res, data);
});

const billing = asyncHandler(async (req, res) => {
  const data = await adminService.getBilling();
  sendSuccess(res, data);
});

const updateUser = asyncHandler(async (req, res) => {
  const data = await adminService.updateUser(req.params.id, req.body);
  sendSuccess(res, data);
});

const settings = asyncHandler(async (req, res) => {
  const data = await adminService.getSettings();
  sendSuccess(res, data);
});

module.exports = { dashboard, users, systemHealth, billing, updateUser, settings };
