const { User } = require("../models");
const { sendError } = require("../utils/apiResponse");
const { verifyAccessToken } = require("../utils/tokens");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;

    if (!token) {
      return sendError(res, "Authentication required. Please sign in.", 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);

    if (!user || user.status === "suspended") {
      return sendError(res, "Your account is not available. Contact support.", 403);
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

module.exports = { authenticate, requireRole };
