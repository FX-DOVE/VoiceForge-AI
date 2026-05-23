const { User } = require("../models");
const { sendError } = require("../utils/apiResponse");
const { verifyAccessToken } = require("../utils/tokens");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token =
      header.startsWith("Bearer ") ? header.slice(7) : (req.cookies?.token || req.cookies?.accessToken);

    if (!token) {
      return sendError(res, "Authentication required. Please sign in.", 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return sendError(res, "Your account was not found. Contact support.", 403);
    }
    
    if (user.status === "banned") {
      return sendError(res, `Your account has been banned. Reason: ${user.banReason || "Violation of terms"}. Contact support for assistance.`, 403);
    }
    
    if (user.status === "suspended") {
      return sendError(res, "Your account has been suspended. Contact support for assistance.", 403);
    }
    
    if (user.status === "restricted") {
      // Store restriction info on req for later checks
      req.userRestrictions = user.restrictions || [];
      req.restrictionReason = user.restrictionReason;
    }

    req.user = user;
    next();
  } catch {
    return sendError(res, "Your session has expired. Please sign in again.", 401);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "You do not have permission to perform this action.", 403);
    }
    next();
  };
}

function requireFeature(feature) {
  return (req, res, next) => {
    if (req.user?.status === "restricted" && req.userRestrictions?.includes(feature)) {
      return sendError(res, `This feature is restricted on your account. Reason: ${req.restrictionReason || "Account restrictions apply"}. Contact support.`, 403);
    }
    next();
  };
}

function requirePlan(...plans) {
  return (req, res, next) => {
    if (!req.user || !plans.includes(req.user.plan)) {
      return sendError(res, "This feature requires a higher tier plan. Please upgrade to access.", 403);
    }
    next();
  };
}

module.exports = { authenticate, requireRole, requireFeature, requirePlan };
