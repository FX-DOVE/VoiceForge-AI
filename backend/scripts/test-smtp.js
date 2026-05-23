require("dotenv").config();
const nodemailer = require("nodemailer");
const config = require("../src/config");

async function testSMTP() {
  console.log("\n=== SMTP Configuration Test ===\n");
  
  // Check configuration
  console.log("SMTP Host:", config.smtp.host);
  console.log("SMTP Port:", config.smtp.port);
  console.log("SMTP Secure:", config.smtp.secure);
  console.log("SMTP User:", config.smtp.user);
  console.log("SMTP From:", config.smtp.from);
  console.log("Password set:", config.smtp.pass ? "✓ Yes" : "✗ No");
  
  if (!config.smtp.user || !config.smtp.pass) {
    console.log("\n✗ ERROR: SMTP_USER or SMTP_PASS not set in .env file");
    console.log("\nAdd these lines to your .env file:");
    console.log("SMTP_HOST=mail.privateemail.com");
    console.log("SMTP_PORT=465");
    console.log("SMTP_SECURE=true");
    console.log("SMTP_USER=your-email@voiceforgeai.site");
    console.log("SMTP_PASS=your-actual-password");
    console.log("EMAIL_FROM=VoiceForge AI <noreply@voiceforgeai.site>");
    return;
  }
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true, // Enable debug output
    logger: true // Log to console
  });
  
  console.log("\n--- Testing Connection ---");
  
  try {
    await transporter.verify();
    console.log("\n✓ SMTP Connection Verified Successfully!");
  } catch (err) {
    console.log("\n✗ SMTP Connection Failed:");
    console.log("Error:", err.message);
    console.log("\nPossible fixes:");
    console.log("1. Check your SMTP_USER and SMTP_PASS in .env");
    console.log("2. For Namecheap Private Email, use the full email as username");
    console.log("3. Make sure the email account exists in Namecheap");
    console.log("4. Try port 587 with SMTP_SECURE=false");
    console.log("5. Enable 'Less secure app access' if using Gmail");
    return;
  }
  
  // Try sending a test email
  console.log("\n--- Sending Test Email ---");
  try {
    const info = await transporter.sendMail({
      from: config.smtp.from,
      to: config.smtp.user, // Send to yourself
      subject: "VoiceForge AI - SMTP Test",
      text: "If you received this, SMTP is working correctly!",
      html: "<h2>SMTP Test Successful!</h2><p>If you received this, SMTP is working correctly!</p>"
    });
    console.log("\n✓ Test email sent!");
    console.log("Message ID:", info.messageId);
    console.log("Check your inbox at:", config.smtp.user);
  } catch (err) {
    console.log("\n✗ Failed to send test email:");
    console.log("Error:", err.message);
  }
}

testSMTP().catch(console.error);
