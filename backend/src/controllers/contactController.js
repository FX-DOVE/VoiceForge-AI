const { sendEmail } = require("../integrations/email");
const templates = require("../integrations/emailTemplates");

async function submitContact(req, res) {
  try {
    const { name, email, topic, message } = req.body || {};

    if (!name || !email || !message) {
      const err = new Error("Name, email address, and message are required.");
      err.statusCode = 400;
      throw err;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const err = new Error("Please provide a valid email address.");
      err.statusCode = 400;
      throw err;
    }

    const cleanTopic = topic || "General question";
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim();
    const cleanMessage = (message || "").trim();

    // Send notification to support team
    const subject = `New Contact: ${cleanTopic} — ${cleanName}`;
    const html = templates.contactSubmissionTemplate({
      name: cleanName,
      email: cleanEmail,
      topic: cleanTopic,
      message: cleanMessage,
    });

    const supportEmail = process.env.SUPPORT_EMAIL || "support@voiceforgeai.site";

    await sendEmail({
      to: supportEmail,
      subject,
      html,
    });

    // Send auto-confirmation to the user
    try {
      const userHtml = templates.contactConfirmationTemplate({
        name: cleanName,
        topic: cleanTopic,
      });
      await sendEmail({
        to: cleanEmail,
        subject: "Thanks for contacting VoiceForge AI",
        html: userHtml,
      });
    } catch (confirmErr) {
      console.warn("[contact] Failed to send user confirmation:", confirmErr.message);
      // Non-fatal — support email was already sent
    }

    return res.json({
      success: true,
      message: "Thank you for reaching out. Our team will get back to you within one business day.",
    });
  } catch (err) {
    console.error("[contact] submit error:", err.message);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: err.message || "Failed to submit contact form. Please try again or email us directly.",
    });
  }
}

module.exports = { submitContact };