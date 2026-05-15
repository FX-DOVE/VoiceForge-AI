const { Resend } = require("resend");
const config = require("../config");

let resendClient = null;

function getResend() {
  if (!config.resend.apiKey) return null;
  if (!resendClient) resendClient = new Resend(config.resend.apiKey);
  return resendClient;
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const client = getResend();
  if (!client) {
    console.log(`[email] Password reset for ${to}: ${resetUrl}`);
    return { mocked: true };
  }

  await client.emails.send({
    from: config.resend.from,
    to,
    subject: "Reset your VoiceForge AI password",
    html: `<p>Click the link below to reset your password. This link expires in ${config.passwordResetExpiresMinutes} minutes.</p><p><a href="${resetUrl}">Reset password</a></p>`,
  });

  return { sent: true };
}

module.exports = { sendPasswordResetEmail };
