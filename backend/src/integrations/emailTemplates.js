const config = require("../config");

// Base email wrapper with common styling
function baseEmailTemplate(content, title = "VoiceForge AI") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0b1326;
      color: #dae2fd;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #0b1326;
    }
    
    .header {
      padding: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .main {
      padding: 32px 24px;
    }
    
    .glass-card {
      background: rgba(23, 31, 51, 0.7);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
    }
    
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      text-decoration: none;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      transition: opacity 0.2s;
    }
    
    .btn:hover { opacity: 0.9; }
    
    .btn-secondary {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
    }
    
    .btn-warning {
      background: linear-gradient(135deg, #f59e0b, #ea580c);
    }
    
    .btn-error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    .text-primary { color: #adc6ff; }
    .text-secondary { color: #c0c1ff; }
    .text-tertiary { color: #ffb786; }
    .text-error { color: #ffb4ab; }
    .text-success { color: #6ee7b7; }
    .text-muted { color: #9ca3af; }
    
    .h1 { font-size: 32px; font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
    .h2 { font-size: 24px; font-weight: 600; line-height: 1.3; margin-bottom: 12px; }
    .h3 { font-size: 18px; font-weight: 600; line-height: 1.4; margin-bottom: 8px; }
    
    .text-lg { font-size: 18px; line-height: 1.6; }
    .text-md { font-size: 16px; line-height: 1.5; }
    .text-sm { font-size: 14px; line-height: 1.5; }
    .text-xs { font-size: 12px; line-height: 1.4; }
    
    .mb-1 { margin-bottom: 8px; }
    .mb-2 { margin-bottom: 16px; }
    .mb-3 { margin-bottom: 24px; }
    .mb-4 { margin-bottom: 32px; }
    
    .mt-1 { margin-top: 8px; }
    .mt-2 { margin-top: 16px; }
    .mt-3 { margin-top: 24px; }
    
    .p-3 { padding: 24px; }
    
    .text-center { text-align: center; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .gap-2 { gap: 16px; }
    .gap-3 { gap: 24px; }
    
    .icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(173, 198, 255, 0.1);
      border: 1px solid rgba(173, 198, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    
    .icon-circle-error {
      background: rgba(255, 180, 171, 0.1);
      border-color: rgba(255, 180, 171, 0.3);
    }
    
    .icon-circle-success {
      background: rgba(110, 231, 183, 0.1);
      border-color: rgba(110, 231, 183, 0.3);
    }
    
    .icon-circle-warning {
      background: rgba(255, 183, 134, 0.1);
      border-color: rgba(255, 183, 134, 0.3);
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .badge-error {
      background: rgba(147, 0, 10, 0.5);
      color: #ffdad6;
    }
    
    .badge-warning {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }
    
    .badge-success {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
    }
    
    .progress-bar {
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      overflow: hidden;
      margin: 12px 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    
    .progress-fill-error {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }
    
    .progress-fill-warning {
      background: linear-gradient(90deg, #f59e0b, #ea580c);
    }
    
    .info-box {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0;
    }
    
    .info-box-warning {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.2);
    }
    
    .info-box-error {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
    }
    
    .info-box-success {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.2);
    }
    
    .code-display {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #adc6ff;
      text-align: center;
      padding: 24px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      margin: 16px 0;
    }
    
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    @media (max-width: 480px) {
      .grid-2 { grid-template-columns: 1fr; }
      .h1 { font-size: 24px; }
      .h2 { font-size: 20px; }
      .glass-card { padding: 24px; }
      .main { padding: 24px 16px; }
    }
    
    .footer {
      padding: 32px 24px;
      border-top: 1px solid rgba(255,255,255,0.08);
      text-align: center;
    }
    
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .footer-links a {
      color: #9ca3af;
      text-decoration: none;
      font-size: 12px;
      transition: color 0.2s;
    }
    
    .footer-links a:hover {
      color: #adc6ff;
    }
    
    .footer-copy {
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">VoiceForge AI</div>
    </div>
    <div class="main">
      ${content}
    </div>
    <div class="footer">
      <div class="footer-links">
        <a href="${config.clientUrl}/privacy">Privacy Policy</a>
        <a href="${config.clientUrl}/terms">Terms of Service</a>
        <a href="${config.clientUrl}/support">Support</a>
      </div>
      <div class="footer-copy">
        © ${new Date().getFullYear()} VoiceForge AI. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// 1. Credit Limit Reminder
function creditLimitReminderTemplate({ name = "", usagePercent = 95, charactersUsed = 47500, charactersLimit = 50000, plan = "Pro" }) {
  const remaining = charactersLimit - charactersUsed;
  const isExhausted = usagePercent >= 100;
  
  const content = `
    <div class="glass-card">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
        <span class="badge ${isExhausted ? 'badge-error' : 'badge-warning'}">
          ${isExhausted ? '⚠ CRITICAL' : '⚠ LOW BALANCE'}
        </span>
      </div>
      
      <h1 class="h1 text-primary">${isExhausted ? 'Credits Exhausted' : 'Running Low on Credits'}</h1>
      
      <p class="text-md text-muted mb-3">
        ${name ? `Hi ${name},` : 'Hi there,'}<br><br>
        ${isExhausted 
          ? 'Your synthetic voice production has reached its limit. To continue forging high-fidelity audio, please recharge your account.'
          : 'You are approaching your monthly character limit. Upgrade now to avoid interruptions to your workflow.'
        }
      </p>
      
      <div class="info-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="text-sm text-muted">Usage Limit</span>
          <span class="text-sm ${isExhausted ? 'text-error' : 'text-tertiary'} font-bold">${usagePercent}% Used</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${isExhausted ? 'progress-fill-error' : 'progress-fill-warning'}" style="width: ${Math.min(usagePercent, 100)}%;"></div>
        </div>
        <p class="text-xs text-muted mt-1">${charactersUsed.toLocaleString()} / ${charactersLimit.toLocaleString()} characters processed this month</p>
      </div>
      
      ${isExhausted ? `
      <div class="grid-2" style="margin: 24px 0;">
        <div class="info-box info-box-error">
          <h3 class="h3 text-error mb-2">🔒 Locked Features</h3>
          <ul class="text-sm text-muted" style="list-style: none; line-height: 1.8;">
            <li>• High-Res WAV Export</li>
            <li>• Multilingual Voice Synthesis</li>
            <li>• API Access Endpoints</li>
          </ul>
        </div>
        <div class="info-box info-box-success">
          <h3 class="h3 text-success mb-2">✓ Available</h3>
          <ul class="text-sm text-muted" style="list-style: none; line-height: 1.8;">
            <li>• Project Dashboard</li>
            <li>• Saved Scripts Library</li>
            <li>• Account Settings</li>
          </ul>
        </div>
      </div>
      ` : ''}
      
      <div class="text-center" style="background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2)); border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid rgba(59,130,246,0.3);">
        <h3 class="h3" style="color: white; margin-bottom: 8px;">Resume Your Creations</h3>
        <p class="text-md text-muted mb-3">Instant recharge. No interruptions to your workflow.</p>
        <a href="${config.clientUrl}/billing" class="btn">Top Up Now →</a>
        
        <div class="info-box mt-3" style="background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2);">
          <p class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Limited Time Offer</p>
          <p class="h3" style="color: white; margin-bottom: 8px;">Upgrade to Pro & Get 25% Off</p>
          <p class="text-sm text-muted">Unlimited generations and priority processing.</p>
          <a href="${config.clientUrl}/pricing" style="color: #adc6ff; font-weight: 600; text-decoration: underline;">View Pro Plan →</a>
        </div>
      </div>
    </div>
  `;
  
  return baseEmailTemplate(content, isExhausted ? 'Credits Exhausted - VoiceForge AI' : 'Low Credits - VoiceForge AI');
}

// 2. Marketing/Promotional
function marketingPromotionalTemplate({ name = "", campaignTitle = "New xAI Voice Models", features = [] }) {
  const content = `
    <div class="text-center mb-3">
      <div style="width: 100%; height: 200px; background: linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3)); border-radius: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 64px;">🎙️</span>
      </div>
      <h1 class="h1 text-primary" style="margin-bottom: 16px;">${campaignTitle}</h1>
      <p class="text-lg text-muted">
        Experience the next frontier of hyper-realistic speech synthesis. Our latest models deliver unparalleled emotional depth and precision.
      </p>
    </div>
    
    <div class="glass-card">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(192,193,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🧠</div>
          <div>
            <h3 class="h3 text-primary" style="margin-bottom: 4px;">Neural Fidelity</h3>
            <p class="text-sm text-muted">Advanced algorithms that mimic human resonance and breathing patterns for total immersion.</p>
          </div>
        </div>
        
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255,183,134,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">⚡</div>
          <div>
            <h3 class="h3 text-tertiary" style="margin-bottom: 4px;">Instant Generation</h3>
            <p class="text-sm text-muted">Reduced latency models allow for real-time voice synthesis in any application environment.</p>
          </div>
        </div>
        
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(77,142,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🌍</div>
          <div>
            <h3 class="h3 text-secondary" style="margin-bottom: 4px;">Global Nuance</h3>
            <p class="text-sm text-muted">Support for 40+ languages with regional accents and localized emotional cues.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="text-center">
      <a href="${config.clientUrl}/studio" class="btn" style="margin-bottom: 16px;">Try New Voices →</a>
      <p class="text-sm text-muted">Join 50,000+ developers shaping the future of voice-first interfaces.</p>
    </div>
  `;
  
  return baseEmailTemplate(content, campaignTitle + ' - VoiceForge AI');
}

// 3. Order Successful
function orderSuccessfulTemplate({ name = "", orderId = "VF-00000", plan = "Pro", amount = "0.00", billingCycle = "yearly", paymentMethod = "•••• 4242" }) {
  const content = `
    <div class="text-center mb-3">
      <div class="icon-circle icon-circle-success" style="margin-bottom: 24px;">
        <span style="font-size: 32px;">✓</span>
      </div>
      <h1 class="h1 text-success" style="margin-bottom: 8px;">Thank You!</h1>
      <p class="text-lg text-muted">Your order has been confirmed and your studio is ready.</p>
    </div>
    
    <div class="glass-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <span class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.1em;">Plan Summary</span>
        <span class="text-sm text-primary">ORDER #${orderId}</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div>
          <h2 class="h2 text-primary" style="margin-bottom: 4px;">${plan} Plan</h2>
          <p class="text-sm text-muted">${billingCycle} subscription with priority rendering</p>
        </div>
        <div style="text-align: right;">
          <span class="h2 text-primary">$${amount}</span>
          <p class="text-xs text-muted">Billed ${billingCycle}</p>
        </div>
      </div>
      
      <div class="grid-2" style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
        <div>
          <span class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Transaction ID</span>
          <span class="text-sm">tx_${orderId.toLowerCase().replace('vf-', '')}</span>
        </div>
        <div>
          <span class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Payment Method</span>
          <span class="text-sm">💳 ${paymentMethod}</span>
        </div>
      </div>
    </div>
    
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <a href="${config.clientUrl}/studio" class="btn btn-success" style="text-align: center;">🚀 Go to Studio</a>
      <a href="${config.clientUrl}/billing" class="btn btn-secondary" style="text-align: center;">📄 View Invoice</a>
    </div>
    
    <div class="text-center mt-3">
      <p class="text-sm text-muted">
        Need help with your subscription?<br>
        <a href="${config.clientUrl}/support" style="color: #adc6ff; text-decoration: underline;">Visit our Help Center</a> or reply to this email.
      </p>
    </div>
  `;
  
  return baseEmailTemplate(content, 'Order Confirmation - VoiceForge AI');
}

// 4. Password Reset
function passwordResetTemplate({ name = "", resetUrl = "", expiresIn = "60" }) {
  const content = `
    <div class="text-center mb-3">
      <div style="width: 100%; height: 150px; background: linear-gradient(to top, #0b1326, transparent), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>🔐</text></svg>') center/contain no-repeat; border-radius: 16px; margin-bottom: 24px; opacity: 0.8;"></div>
    </div>
    
    <div class="glass-card">
      <h1 class="h1 text-primary" style="margin-bottom: 16px;">Reset Your Password</h1>
      
      <p class="text-md text-muted mb-3">
        ${name ? `Hi ${name},` : 'Hi there,'}<br><br>
        We received a request to reset the password for your VoiceForge AI account. Click the button below to create a new password.
      </p>
      
      <div class="text-center mb-3">
        <a href="${resetUrl}" class="btn" style="display: inline-block; padding: 16px 40px; font-size: 16px;">Reset Password →</a>
      </div>
      
      <div class="info-box info-box-warning">
        <p class="text-sm text-muted">
          <span style="color: #ffb786; font-weight: 600;">⏱ Time Sensitive:</span> 
          For security reasons, this link will expire in <strong style="color: #ffb786;">${expiresIn} minutes</strong>. 
          If the link has expired, you will need to submit a new request.
        </p>
      </div>
      
      <div style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
        <p class="text-sm text-muted">
          <strong>Didn't request this?</strong> If you didn't ask to change your password, you can safely ignore this email. Your account is still secure.
        </p>
      </div>
    </div>
    
    <div class="text-center">
      <div style="display: inline-flex; align-items: center; gap: 8px; opacity: 0.6;">
        <span>🔒</span>
        <span class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.1em;">Secure Communication</span>
      </div>
    </div>
  `;
  
  return baseEmailTemplate(content, 'Reset Your Password - VoiceForge AI');
}

// 5. Purchase Error
function purchaseErrorTemplate({ name = "", amount = "29.00", plan = "Pro", last4 = "4242", retryDate = "24 hours" }) {
  const content = `
    <div class="glass-card" style="border-top: 4px solid #ef4444;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <span style="font-size: 32px;">⚠️</span>
        <h1 class="h2 text-error">Action Required: Payment Failed</h1>
      </div>
      
      <p class="text-md text-muted mb-3">
        We were unable to process your most recent payment for your <strong>VoiceForge ${plan}</strong> subscription. 
        To ensure your AI voice generation services continue without interruption, please update your payment details.
      </p>
      
      <div class="grid-2" style="margin: 24px 0;">
        <div class="info-box">
          <span class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Amount Due</span>
          <span class="h2 text-primary">$${amount} USD</span>
        </div>
        <div class="info-box">
          <span class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Due Date</span>
          <span class="h2 text-primary">${new Date(Date.now() + 48*60*60*1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
      
      <div class="info-box info-box-error" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Current Method</span>
            <span class="text-md">💳 Visa ending in ${last4}</span>
          </div>
          <span class="badge badge-error">Declined</span>
        </div>
      </div>
      
      <a href="${config.clientUrl}/billing" class="btn btn-warning" style="display: block; text-align: center; margin-bottom: 16px;">
        Update Payment Method →
      </a>
    </div>
    
    <div class="info-box">
      <h3 class="h3 text-tertiary mb-2">📋 What happens next?</h3>
      <ul style="list-style: none; padding: 0; color: #9ca3af; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><span style="color: #adc6ff;">•</span> Your current voice generations will remain active for the next <strong style="color: white;">48 hours</strong>.</li>
        <li style="margin-bottom: 8px;"><span style="color: #adc6ff;">•</span> We will automatically attempt the charge again in <strong style="color: white;">${retryDate}</strong>.</li>
        <li><span style="color: #adc6ff;">•</span> Access to premium High-Fidelity voices may be temporarily limited if the second attempt fails.</li>
      </ul>
    </div>
  `;
  
  return baseEmailTemplate(content, 'Action Required: Payment Failed - VoiceForge AI');
}

// 6. Signup Verification Code
function signupVerificationTemplate({ name = "", code = "000000", expiresIn = "15 minutes" }) {
  const content = `
    <div class="text-center mb-3">
      <div class="icon-circle" style="margin-bottom: 24px;">
        <span style="font-size: 32px;">✉️</span>
      </div>
      <h1 class="h1 text-primary" style="margin-bottom: 8px;">Verify Your Account</h1>
      <p class="text-md text-muted">
        To complete your sign-up and start forging high-fidelity voices, please enter the 6-digit verification code below.
      </p>
    </div>
    
    <div class="glass-card text-center">
      <div class="code-display">
        ${code.split('').join(' ')}
      </div>
      
      <p class="text-sm text-muted mb-2">
        This code will expire in <strong style="color: #ffb786;">${expiresIn}</strong>
      </p>
      
      <p class="text-xs text-muted">
        Didn't receive it? <a href="${config.clientUrl}/resend-verification" style="color: #adc6ff; text-decoration: underline;">Resend Code</a>
      </p>
    </div>
    
    <div class="info-box info-box-warning">
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <span style="font-size: 20px;">ℹ️</span>
        <div>
          <h4 class="h3 text-tertiary" style="margin-bottom: 4px;">Security Tip</h4>
          <p class="text-sm text-muted">
            VoiceForge AI will never ask for your password via email. If you didn't request this code, please ignore this email or contact support.
          </p>
        </div>
      </div>
    </div>
  `;
  
  return baseEmailTemplate(content, 'Verify Your Account - VoiceForge AI');
}

// 7. Voice Clone Ready
function voiceCloneReadyTemplate({ name = "", voiceName = "My Custom Clone", voiceSlug = "" }) {
  const content = `
    <div class="text-center mb-3">
      <div class="icon-circle icon-circle-success" style="margin-bottom: 24px;">
        <span style="font-size: 32px;">✨</span>
      </div>
      <h1 class="h1 text-success" style="margin-bottom: 8px;">Your Voice is Ready!</h1>
      <p class="text-lg text-muted">
        The training is complete. Your high-fidelity digital twin is now available in your studio.
      </p>
    </div>
    
    <div class="glass-card">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(192,193,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px;">
          🎙️
        </div>
        <div>
          <h2 class="h2 text-primary" style="margin-bottom: 4px;">${voiceName}</h2>
          <span class="badge badge-success">✓ Ready</span>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; gap: 4px; height: 100px;">
        ${Array.from({length: 20}, (_, i) => {
          const height = Math.floor(Math.random() * 60) + 20;
          return `<div style="width: 4px; height: ${height}%; background: linear-gradient(to top, #3b82f6, #8b5cf6); border-radius: 2px;"></div>`;
        }).join('')}
      </div>
      
      <div class="grid-2" style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #6ee7b7;">✓</span>
          <span class="text-sm text-muted">Neural Precision</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #6ee7b7;">✓</span>
          <span class="text-sm text-muted">Zero Latency</span>
        </div>
      </div>
      
      <a href="${config.clientUrl}/studio${voiceSlug ? `?voice=${voiceSlug}` : ''}" class="btn btn-success" style="display: block; text-align: center; margin-bottom: 8px;">
        Try it in Studio →
      </a>
      <p class="text-xs text-muted text-center">No credit card required to test your voice.</p>
    </div>
    
    <div class="glass-card">
      <h3 class="h3 text-primary" style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">How to use your clone</h3>
      
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #adc6ff; flex-shrink: 0;">1</div>
          <p class="text-sm text-muted">Access the <strong style="color: white;">Studio</strong> from your dashboard and select '${voiceName}' from the voice library.</p>
        </div>
        
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #adc6ff; flex-shrink: 0;">2</div>
          <p class="text-sm text-muted">Input any text script. Use our <strong style="color: white;">Emotion Tags</strong> to adjust tone, pitch, and cadence in real-time.</p>
        </div>
        
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #adc6ff; flex-shrink: 0;">3</div>
          <p class="text-sm text-muted">Click <strong style="color: white;">Generate</strong> to produce studio-quality audio files ready for export or integration.</p>
        </div>
      </div>
    </div>
  `;
  
  return baseEmailTemplate(content, 'Voice Clone Ready - VoiceForge AI');
}

// 8. Credit Gift Email (Admin sends free credits to users)
function creditGiftTemplate({ name = "", heading = "", body = "", imageUrl = "", gifUrl = "", credits = 0, usdAmount = 0, claimUrl = "", buttonText = "Claim Your Free Credits", expiresIn = "7 days" }) {
  const mediaHtml = (gifUrl || imageUrl)
    ? `<div style="margin: 24px 0; text-align: center;">
        <img src="${gifUrl || imageUrl}" alt="" style="max-width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);" />
      </div>`
    : "";

  const content = `
    <div class="text-center mb-3">
      <div class="icon-circle icon-circle-success" style="margin-bottom: 24px;">
        <span style="font-size: 40px;">🎁</span>
      </div>
      <h1 class="h1 text-success" style="margin-bottom: 8px;">${heading || "You've Got Free Credits!"}</h1>
    </div>

    <div class="glass-card">
      <p class="text-md text-muted mb-3">
        ${name ? `Hi ${name},` : "Hi there,"}
      </p>

      <div style="color: #dae2fd; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
        ${body}
      </div>

      ${mediaHtml}

      <div class="info-box info-box-success" style="margin: 24px 0; text-align: center;">
        <span class="text-xs text-muted" style="text-transform: uppercase; letter-spacing: 0.15em; display: block; margin-bottom: 8px;">Your Gift</span>
        <span class="h1 text-success" style="display: block;">${credits.toLocaleString()} Credits</span>
      </div>

      <div class="text-center mb-3">
        <a href="${claimUrl}" class="btn btn-success" style="font-size: 16px; padding: 16px 40px;">
          ${buttonText} →
        </a>
      </div>

      <div class="info-box" style="margin-top: 24px;">
        <p class="text-sm text-muted" style="text-align: center;">
          ⏰ This gift expires in <strong style="color: #ffb786;">${expiresIn}</strong>. Claim it before it's gone!
        </p>
      </div>
    </div>
  `;

  return baseEmailTemplate(content, heading || "Free Credits Gift - VoiceForge AI");
}

// 9. Contact Form Submission (sent to support team)
function contactSubmissionTemplate({ name = "", email = "", topic = "General question", message = "" }) {
  const safeMessage = (message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  const submittedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const content = `
    <div class="text-center mb-3">
      <div class="icon-circle" style="margin-bottom: 24px;">
        <span style="font-size: 36px;">📬</span>
      </div>
      <h1 class="h1 text-primary" style="margin-bottom: 8px;">New Contact Form Submission</h1>
      <p class="text-md text-muted">A user has submitted a message via the website contact form.</p>
    </div>
    
    <div class="glass-card">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 14px;">
        <div>
          <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</div>
          <div style="color: #fff; font-weight: 600;">${name || "Not provided"}</div>
        </div>
        <div>
          <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</div>
          <div><a href="mailto:${email}" style="color: #adc6ff; text-decoration: underline;">${email}</a></div>
        </div>
        <div style="grid-column: 1 / -1;">
          <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Topic</div>
          <div style="color: #fff; font-weight: 600;">${topic}</div>
        </div>
      </div>

      <div style="margin: 16px 0 8px;">
        <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Message</div>
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; line-height: 1.65; color: #dae2fd;">
          ${safeMessage || "<em>(no message body)</em>"}
        </div>
      </div>

      <div style="margin-top: 16px; font-size: 12px; color: #6b7280;">
        Submitted: ${submittedAt}
      </div>
    </div>

    <div style="text-align: center; margin-top: 8px;">
      <p class="text-sm text-muted">
        Reply directly to the sender to continue the conversation.
      </p>
    </div>
  `;

  return baseEmailTemplate(content, "New Contact Form Submission - VoiceForge AI");
}

// 10. Contact Form Auto-Reply (sent to the user who submitted)
function contactConfirmationTemplate({ name = "", topic = "General question" }) {
  const content = `
    <div class="text-center mb-3">
      <div class="icon-circle icon-circle-success" style="margin-bottom: 24px;">
        <span style="font-size: 36px;">✅</span>
      </div>
      <h1 class="h1 text-success" style="margin-bottom: 8px;">We've received your message</h1>
    </div>

    <div class="glass-card">
      <p class="text-md text-muted mb-3">
        Hi ${name || "there"},<br><br>
        Thank you for contacting VoiceForge AI. We have received your inquiry about <strong>"${topic}"</strong>.
      </p>

      <p class="text-md text-muted">
        A member of our team will review it and get back to you within <strong>one business day</strong>.
      </p>

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 13px; color: #6b7280;">
        If you need immediate assistance, reply to this email or reach us at <a href="mailto:support@voiceforgeai.site" style="color: #adc6ff;">support@voiceforgeai.site</a>.
      </div>
    </div>
  `;

  return baseEmailTemplate(content, "Thank you — VoiceForge AI");
}

module.exports = {
  creditLimitReminderTemplate,
  marketingPromotionalTemplate,
  orderSuccessfulTemplate,
  passwordResetTemplate,
  purchaseErrorTemplate,
  signupVerificationTemplate,
  voiceCloneReadyTemplate,
  creditGiftTemplate,
  contactSubmissionTemplate,
  contactConfirmationTemplate,
  baseEmailTemplate,
};
