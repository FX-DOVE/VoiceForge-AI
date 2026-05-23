const nodemailer = require("nodemailer");
const config = require("../config");
const templates = require("./emailTemplates");

// Create reusable transporter
let transporter = null;
let connectionAttempted = false;

function getTransporter() {
  if (transporter) return transporter;

  const smtpConfig = config.smtp;
  if (!smtpConfig.user || !smtpConfig.pass) {
    console.warn("[email] SMTP credentials not configured");
    console.warn("[email] Set SMTP_USER and SMTP_PASS in your .env file");
    return null;
  }

  // Try port 465 (SSL) first, fallback to 587 (TLS) if configured
  const port = smtpConfig.port || 465;
  const secure = smtpConfig.secure !== false; // default true for port 465

  console.log(`[email] Configuring SMTP: ${smtpConfig.host}:${port} (secure: ${secure})`);

  transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: port,
    secure: secure, // true for 465, false for 587
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
    tls: {
      rejectUnauthorized: false,
      // Required for some email providers
      ciphers: 'SSLv3'
    },
    // Connection timeout
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  // Log errors for debugging
  transporter.on('error', (err) => {
    console.error('[email] Transporter error:', err.message);
  });

  return transporter;
}

// Alternative transporter for port 587 (STARTTLS)
function getAlternativeTransporter() {
  const smtpConfig = config.smtp;
  
  console.log(`[email] Trying alternative SMTP: ${smtpConfig.host}:587 (STARTTLS)`);
  
  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });
}

// Verify transporter connection with fallback
async function verifyConnection() {
  let transport = getTransporter();
  if (!transport) return false;
  
  try {
    await transport.verify();
    console.log("[email] SMTP connection verified");
    return true;
  } catch (err) {
    console.error("[email] SMTP verification failed on port 465:", err.message);
    
    // Try alternative port 587
    try {
      transport = getAlternativeTransporter();
      await transport.verify();
      console.log("[email] SMTP connection verified on port 587 (STARTTLS)");
      // Replace the main transporter
      transporter = transport;
      return true;
    } catch (altErr) {
      console.error("[email] SMTP verification failed on port 587:", altErr.message);
      console.error("[email] Please check your SMTP credentials in .env file");
      console.error("[email] Common issues:");
      console.error("  1. Wrong username/password");
      console.error("  2. For Namecheap: use full email as username (e.g., support@voiceforgeai.site)");
      console.error("  3. Account not activated in Namecheap panel");
      return false;
    }
  }
}

// Send email wrapper with fallback
async function sendEmail({ to, subject, html, text }) {
  let transport = getTransporter();

  if (!transport) {
    console.log(`[email][mocked] To: ${to} | Subject: ${subject}`);
    console.log(`[email] Email content preview: ${subject}`);
    return { mocked: true, to, subject };
  }

  try {
    const info = await transport.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    console.log(`[email] Sent to ${to}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[email] Failed to send to ${to}:`, err.message);
    
    // If authentication failed, try alternative port
    if (err.code === 'EAUTH' && config.smtp.port !== 587) {
      console.log('[email] Retrying with port 587 (STARTTLS)...');
      try {
        transport = getAlternativeTransporter();
        const info = await transport.sendMail({
          from: config.smtp.from,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ""),
        });
        console.log(`[email] Sent to ${to} via port 587: ${info.messageId}`);
        // Update main transporter for future sends
        transporter = transport;
        return { sent: true, messageId: info.messageId };
      } catch (altErr) {
        console.error(`[email] Also failed on port 587:`, altErr.message);
      }
    }
    
    throw err;
  }
}

// Password Reset Email
async function sendPasswordResetEmail({ to, resetUrl, name = "" }) {
  const subject = "Reset your VoiceForge AI password";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #fff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          VoiceForge AI
        </h1>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;">
        <h2 style="font-size: 20px; margin: 0 0 16px 0;">Password Reset Request</h2>
        <p style="color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
          ${name ? `Hi ${name},` : "Hi there,"}<br><br>
          We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>${config.passwordResetExpiresMinutes} minutes</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0 0;">
          If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
        © ${new Date().getFullYear()} VoiceForge AI. All rights reserved.
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

// Welcome Email
async function sendWelcomeEmail({ to, name = "" }) {
  const subject = "Welcome to VoiceForge AI!";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #fff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Welcome to VoiceForge AI
        </h1>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;">
        <h2 style="font-size: 20px; margin: 0 0 16px 0;">${name ? `Hi ${name}!` : "Hi there!"}</h2>
        <p style="color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
          Welcome to VoiceForge AI — your AI-powered voice generation platform. We're excited to have you on board!
        </p>
        <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 16px; margin: 0 0 12px 0; color: #3b82f6;">Your Welcome Gift</h3>
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            You've received <strong style="color: #fff;">${config.welcomeCredits.toLocaleString()} credits</strong> to get started. Generate high-quality AI voices and create amazing content.
          </p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${config.clientUrl}/studio" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            Start Creating
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0 0;">
          Need help? Reply to this email or contact our support team anytime.
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
        © ${new Date().getFullYear()} VoiceForge AI. All rights reserved.<br>
        <a href="${config.clientUrl}" style="color: #3b82f6; text-decoration: none;">${config.clientUrl}</a>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

// Verification Email
async function sendVerificationEmail({ to, verificationUrl, name = "" }) {
  const subject = "Verify your VoiceForge AI email";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #fff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          VoiceForge AI
        </h1>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;">
        <h2 style="font-size: 20px; margin: 0 0 16px 0;">Verify Your Email</h2>
        <p style="color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
          ${name ? `Hi ${name},` : "Hi there,"}<br><br>
          Thanks for signing up! Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            Verify Email
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0 0;">
          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
        © ${new Date().getFullYear()} VoiceForge AI. All rights reserved.
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

// Low Balance Alert (Admin)
async function sendLowBalanceAlert({ adminEmail, balance, threshold }) {
  const subject = "⚠️ VoiceForge AI: Low xAI Balance Alert";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #fff;">
      <div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 16px; padding: 32px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 40px; height: 40px; background: rgba(245,158,11,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">⚠️</div>
          <h2 style="font-size: 20px; margin: 0; color: #f59e0b;">Low Balance Alert</h2>
        </div>
        <p style="color: #9ca3af; line-height: 1.6; margin: 0 0 20px 0;">
          Your xAI API balance is running low. Please add funds to avoid service interruption.
        </p>
        <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6b7280;">Current Balance:</span>
            <span style="color: #f59e0b; font-weight: 600;">$${balance.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #6b7280;">Alert Threshold:</span>
            <span style="color: #fff; font-weight: 600;">$${threshold.toFixed(2)}</span>
          </div>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${config.serverUrl}/admin/grok" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            Manage Balance
          </a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
        © ${new Date().getFullYear()} VoiceForge AI. All rights reserved.
      </div>
    </div>
  `;

  return sendEmail({ to: adminEmail, subject, html });
}

// Voice Clone Ready Notification
async function sendVoiceCloneReadyEmail({ to, voiceName, voiceSlug, name = "" }) {
  const subject = `Your cloned voice "${voiceName}" is ready!`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #fff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          VoiceForge AI
        </h1>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; padding: 16px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; font-size: 32px;">🎉</div>
        </div>
        <h2 style="font-size: 20px; margin: 0 0 16px 0; text-align: center;">Your Voice is Ready!</h2>
        <p style="color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
          ${name ? `Hi ${name},` : "Hi there,"}<br><br>
          Great news! Your cloned voice <strong style="color: #fff;">"${voiceName}"</strong> has been successfully trained and is ready to use.
        </p>
        <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 14px; margin: 0 0 8px 0; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px;">Voice Details</h3>
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            <strong style="color: #fff;">Name:</strong> ${voiceName}<br>
            <strong style="color: #fff;">Status:</strong> <span style="color: #10b981;">✓ Ready</span>
          </p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${config.clientUrl}/studio${voiceSlug ? `?voice=${voiceSlug}` : ""}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            Use Your Voice
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0 0; text-align: center;">
          Head to the Voice Studio to start generating audio with your cloned voice.
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
        © ${new Date().getFullYear()} VoiceForge AI. All rights reserved.
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

// New template-based email functions
async function sendCreditLimitReminder({ to, name, usagePercent, charactersUsed, charactersLimit, plan }) {
  const html = templates.creditLimitReminderTemplate({ name, usagePercent, charactersUsed, charactersLimit, plan });
  return sendEmail({ to, subject: usagePercent >= 100 ? 'Credits Exhausted - VoiceForge AI' : 'Low Credits Alert - VoiceForge AI', html });
}

async function sendMarketingPromotional({ to, name, campaignTitle, features }) {
  const html = templates.marketingPromotionalTemplate({ name, campaignTitle, features });
  return sendEmail({ to, subject: campaignTitle || 'New from VoiceForge AI', html });
}

async function sendOrderSuccessful({ to, name, orderId, plan, amount, billingCycle, paymentMethod }) {
  const html = templates.orderSuccessfulTemplate({ name, orderId, plan, amount, billingCycle, paymentMethod });
  return sendEmail({ to, subject: 'Order Confirmed - VoiceForge AI', html });
}

async function sendPurchaseError({ to, name, amount, plan, last4, retryDate }) {
  const html = templates.purchaseErrorTemplate({ name, amount, plan, last4, retryDate });
  return sendEmail({ to, subject: 'Action Required: Payment Failed', html });
}

async function sendSignupVerification({ to, name, code, expiresIn }) {
  const html = templates.signupVerificationTemplate({ name, code, expiresIn });
  return sendEmail({ to, subject: 'Verify Your Account - VoiceForge AI', html });
}

// Update existing functions to use templates
async function sendPasswordResetEmail({ to, resetUrl, name = "" }) {
  const html = templates.passwordResetTemplate({ name, resetUrl, expiresIn: config.passwordResetExpiresMinutes });
  return sendEmail({ to, subject: "Reset your VoiceForge AI password", html });
}

async function sendWelcomeEmail({ to, name = "" }) {
  const subject = "Welcome to VoiceForge AI!";
  const html = templates.baseEmailTemplate(`
    <div class="text-center mb-3">
      <div class="icon-circle icon-circle-success" style="margin-bottom: 24px;">
        <span style="font-size: 32px;">🎉</span>
      </div>
      <h1 class="h1 text-success" style="margin-bottom: 8px;">Welcome to VoiceForge AI!</h1>
    </div>
    
    <div class="glass-card">
      <p class="text-md text-muted mb-3">
        ${name ? `Hi ${name}!` : "Hi there!"}<br><br>
        Welcome to VoiceForge AI — your AI-powered voice generation platform. We're excited to have you on board!
      </p>
      
      <div class="info-box info-box-success">
        <h3 class="h3 text-success mb-2">🎁 Your Welcome Gift</h3>
        <p class="text-md text-muted">
          You've received <strong style="color: white;">${config.welcomeCredits.toLocaleString()} credits</strong> to get started. 
          Generate high-quality AI voices and create amazing content.
        </p>
      </div>
      
      <div class="text-center mt-3">
        <a href="${config.clientUrl}/studio" class="btn">Start Creating →</a>
      </div>
      
      <p class="text-sm text-muted mt-3 text-center">
        Need help? Reply to this email or <a href="${config.clientUrl}/support" style="color: #adc6ff;">contact support</a> anytime.
      </p>
    </div>
  `, subject);
  
  return sendEmail({ to, subject, html });
}

async function sendVerificationEmail({ to, verificationUrl, name = "" }) {
  const subject = "Verify your VoiceForge AI email";
  const html = templates.baseEmailTemplate(`
    <div class="text-center mb-3">
      <div class="icon-circle" style="margin-bottom: 24px;">
        <span style="font-size: 32px;">✉️</span>
      </div>
      <h1 class="h1 text-primary" style="margin-bottom: 8px;">Verify Your Email</h1>
    </div>
    
    <div class="glass-card">
      <p class="text-md text-muted mb-3">
        ${name ? `Hi ${name},` : "Hi there,"}<br><br>
        Thanks for signing up! Please verify your email address by clicking the button below:
      </p>
      
      <div class="text-center mb-3">
        <a href="${verificationUrl}" class="btn">Verify Email →</a>
      </div>
      
      <div class="info-box">
        <p class="text-sm text-muted">
          This link will expire in <strong style="color: #ffb786;">24 hours</strong>. 
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `, subject);
  
  return sendEmail({ to, subject, html });
}

async function sendLowBalanceAlert({ adminEmail, balance, threshold }) {
  const subject = "⚠️ VoiceForge AI: Low xAI Balance Alert";
  const html = templates.baseEmailTemplate(`
    <div class="glass-card" style="border-top: 4px solid #f59e0b;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <span style="font-size: 32px;">⚠️</span>
        <h1 class="h2 text-tertiary">Low Balance Alert</h1>
      </div>
      
      <p class="text-md text-muted mb-3">
        Your xAI API balance is running low. Please add funds to avoid service interruption.
      </p>
      
      <div class="info-box">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span class="text-sm text-muted">Current Balance:</span>
          <span class="text-md text-tertiary font-bold">$${balance.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span class="text-sm text-muted">Alert Threshold:</span>
          <span class="text-md text-primary font-bold">$${threshold.toFixed(2)}</span>
        </div>
      </div>
      
      <a href="${config.serverUrl}/admin/grok" class="btn btn-warning" style="display: block; text-align: center; margin-top: 24px;">
        Manage Balance →
      </a>
    </div>
  `, subject);
  
  return sendEmail({ to: adminEmail, subject, html });
}

async function sendVoiceCloneReadyEmail({ to, voiceName, voiceSlug, name = "" }) {
  const html = templates.voiceCloneReadyTemplate({ name, voiceName, voiceSlug });
  return sendEmail({ to, subject: `Your cloned voice "${voiceName}" is ready!`, html });
}

module.exports = {
  verifyConnection,
  sendEmail,
  templates, // Export templates for preview
  // Legacy functions
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendLowBalanceAlert,
  sendVoiceCloneReadyEmail,
  // New template functions
  sendCreditLimitReminder,
  sendMarketingPromotional,
  sendOrderSuccessful,
  sendPurchaseError,
  sendSignupVerification,
};
