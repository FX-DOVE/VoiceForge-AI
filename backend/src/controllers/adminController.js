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

const getBillingSettings = asyncHandler(async (req, res) => {
  const data = await adminService.getBillingSettings();
  sendSuccess(res, data);
});

const updateBillingSettings = asyncHandler(async (req, res) => {
  const data = await adminService.updateBillingSettings(req.user._id, req.body);
  sendSuccess(res, data, "Billing settings updated successfully.");
});

const listBillingProfiles = asyncHandler(async (req, res) => {
  const data = await adminService.listBillingProfiles();
  sendSuccess(res, { profiles: data });
});

const updateBillingProfile = asyncHandler(async (req, res) => {
  const { provider, model, ...updates } = req.body;
  const data = await adminService.updateBillingProfile(req.user._id, { provider, model, updates });
  sendSuccess(res, data, "Billing profile updated.");
});

const banUser = asyncHandler(async (req, res) => {
  const data = await adminService.banUser(req.params.id, req.user._id, req.body);
  sendSuccess(res, data, "User banned successfully.");
});

const restrictUser = asyncHandler(async (req, res) => {
  const data = await adminService.restrictUser(req.params.id, req.user._id, req.body);
  sendSuccess(res, data, "User restricted successfully.");
});

const unbanUser = asyncHandler(async (req, res) => {
  const data = await adminService.unbanUser(req.params.id, req.user._id);
  sendSuccess(res, data, "User unbanned successfully.");
});

const unrestrictUser = asyncHandler(async (req, res) => {
  const data = await adminService.unrestrictUser(req.params.id, req.user._id);
  sendSuccess(res, data, "User restrictions removed successfully.");
});

const deleteUser = asyncHandler(async (req, res) => {
  const data = await adminService.deleteUser(req.params.id, req.user._id, req.body);
  sendSuccess(res, data, "User deleted successfully.");
});

const addCredits = asyncHandler(async (req, res) => {
  const data = await adminService.addCredits(req.params.id, req.user._id, req.body);
  sendSuccess(res, data, "Credits added successfully.");
});

const ttsAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getTtsAnalytics(req.query.period || "24h");
  sendSuccess(res, data);
});

const testEmail = asyncHandler(async (req, res) => {
  const { verifyConnection, sendEmail } = require("../integrations/email");

  // First verify connection
  const connected = await verifyConnection();
  if (!connected) {
    return sendSuccess(res, { success: false, message: "SMTP not configured or connection failed" }, "Email test failed", 400);
  }

  // Send test email to admin
  await sendEmail({
    to: req.user.email,
    subject: "VoiceForge AI - Test Email",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a0f; color: #fff;">
        <h2 style="color: #3b82f6;">Email Test Successful! 🎉</h2>
        <p style="color: #9ca3af;">If you're seeing this, your Namecheap Private Email SMTP is configured correctly.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Sent at: ${new Date().toISOString()}<br>
          From: VoiceForge AI<br>
          To: ${req.user.email}
        </p>
      </div>
    `
  });

  sendSuccess(res, { success: true, message: "Test email sent to " + req.user.email }, "Email test successful");
});

// Email Preview Routes
const previewEmailTemplates = asyncHandler(async (req, res) => {
  const { templates } = require("../integrations/email");

  const templateList = [
    { id: "welcome", name: "Welcome Email", description: "Sent to new users after signup" },
    { id: "verification", name: "Email Verification", description: "Email verification with code" },
    { id: "password-reset", name: "Password Reset", description: "Password reset request" },
    { id: "credit-limit", name: "Credit Limit Reminder", description: "Low/exhausted credits alert" },
    { id: "order-success", name: "Order Successful", description: "Payment confirmation" },
    { id: "purchase-error", name: "Purchase Error", description: "Payment failed notification" },
    { id: "voice-clone-ready", name: "Voice Clone Ready", description: "Voice training complete" },
    { id: "marketing", name: "Marketing Promotional", description: "Newsletter/marketing email" },
    { id: "low-balance", name: "Low Balance Alert", description: "Admin alert for xAI balance" },
  ];

  sendSuccess(res, { templates: templateList });
});

const previewEmailTemplate = asyncHandler(async (req, res) => {
  const { templates } = require("../integrations/email");
  const { id } = req.params;

  let html = "";
  const sampleData = {
    name: "John Doe",
    email: "john@example.com",
    code: "842097",
    resetUrl: `${config.clientUrl}/reset-password?token=sample-token`,
    verificationUrl: `${config.clientUrl}/verify-email?token=sample-token`,
    voiceName: "My Professional Voice",
    voiceSlug: "my-professional-voice",
    plan: "Pro",
    amount: "49.99",
    orderId: "VF-94281",
    billingCycle: "yearly",
    paymentMethod: "•••• 4242",
    charactersUsed: 47500,
    charactersLimit: 50000,
    usagePercent: 95,
    balance: 5.50,
    threshold: 10.00,
    campaignTitle: "New xAI Voice Models",
    last4: "4242",
    retryDate: "24 hours",
    expiresIn: "60"
  };

  switch (id) {
    case "welcome":
      html = templates.baseEmailTemplate(`
        <div class="text-center mb-3">
          <div class="icon-circle icon-circle-success" style="margin-bottom: 24px;">
            <span style="font-size: 32px;">🎉</span>
          </div>
          <h1 class="h1 text-success" style="margin-bottom: 8px;">Welcome to VoiceForge AI!</h1>
        </div>
        <div class="glass-card">
          <p class="text-md text-muted mb-3">Hi ${sampleData.name}!<br><br>Welcome to VoiceForge AI — your AI-powered voice generation platform.</p>
          <div class="info-box info-box-success">
            <h3 class="h3 text-success mb-2">🎁 Your Welcome Gift</h3>
            <p class="text-md text-muted">You've received <strong style="color: white;">2,380 credits</strong> to get started.</p>
          </div>
          <div class="text-center mt-3"><a href="${config.clientUrl}/studio" class="btn">Start Creating →</a></div>
        </div>
      `, "Welcome to VoiceForge AI!");
      break;

    case "verification":
      html = templates.signupVerificationTemplate(sampleData);
      break;

    case "password-reset":
      html = templates.passwordResetTemplate(sampleData);
      break;

    case "credit-limit":
      html = templates.creditLimitReminderTemplate({ ...sampleData, usagePercent: 100, charactersUsed: 50000 });
      break;

    case "order-success":
      html = templates.orderSuccessfulTemplate(sampleData);
      break;

    case "purchase-error":
      html = templates.purchaseErrorTemplate(sampleData);
      break;

    case "voice-clone-ready":
      html = templates.voiceCloneReadyTemplate(sampleData);
      break;

    case "marketing":
      html = templates.marketingPromotionalTemplate(sampleData);
      break;

    case "low-balance":
      html = templates.baseEmailTemplate(`
        <div class="glass-card" style="border-top: 4px solid #f59e0b;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
            <span style="font-size: 32px;">⚠️</span>
            <h1 class="h2 text-tertiary">Low Balance Alert</h1>
          </div>
          <p class="text-md text-muted mb-3">Your xAI API balance is running low.</p>
          <div class="info-box">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span class="text-sm text-muted">Current Balance:</span>
              <span class="text-md text-tertiary font-bold">$${sampleData.balance.toFixed(2)}</span>
            </div>
          </div>
          <a href="${config.serverUrl}/admin/grok" class="btn btn-warning" style="display: block; text-align: center; margin-top: 24px;">Manage Balance →</a>
        </div>
      `, "⚠️ VoiceForge AI: Low xAI Balance Alert");
      break;

    default:
      return sendSuccess(res, { error: "Template not found" }, "Error", 404);
  }

  // Return HTML for preview
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

const resetAllCredits = asyncHandler(async (req, res) => {
  const data = await adminService.resetAllUserCredits(req.user._id);
  sendSuccess(res, data, data.message);
});

const sendGiftEmail = asyncHandler(async (req, res) => {
  const { subject, heading, body, imageUrl, gifUrl, buttonText, usdAmount, recipients, specificUserIds, expiryDays, campaignName } = req.body;

  if (!body || !usdAmount) {
    return sendSuccess(res, null, "Email body and USD amount are required", 400);
  }

  const data = await adminService.sendGiftEmail(req.user._id, {
    subject, heading, body, imageUrl, gifUrl, buttonText,
    usdAmount: parseFloat(usdAmount),
    recipients, specificUserIds, expiryDays: parseInt(expiryDays) || 7, campaignName,
  });
  sendSuccess(res, data, `Gift email sent to ${data.totalSent} users`);
});

const getGiftCampaigns = asyncHandler(async (req, res) => {
  const data = await adminService.getGiftCampaigns();
  sendSuccess(res, { campaigns: data });
});

const claimGiftCredits = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return sendSuccess(res, null, "Claim token is required", 400);
  }
  const data = await adminService.claimGiftCredits(req.user._id, token);
  sendSuccess(res, data, data.message);
});

module.exports = { dashboard, users, systemHealth, billing, updateUser, banUser, restrictUser, unbanUser, unrestrictUser, deleteUser, settings, getBillingSettings, updateBillingSettings, listBillingProfiles, updateBillingProfile, addCredits, ttsAnalytics, testEmail, previewEmailTemplates, previewEmailTemplate, resetAllCredits, sendGiftEmail, getGiftCampaigns, claimGiftCredits };
