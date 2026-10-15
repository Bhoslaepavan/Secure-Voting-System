const crypto = require('crypto');
const nodemailer = require('nodemailer');

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Configurable Nodemailer Transporter
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return null;
};

const sendOTPEmail = async (email, otp, purpose = 'Verification') => {
  console.log(`\n==========================================`);
  console.log(`🔐 DEV OTP GENERATED FOR [${email}]`);
  console.log(`🔑 OTP CODE: ${otp} (${purpose})`);
  console.log(`==========================================\n`);

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Secure Voting Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Voting Portal One-Time Passcode (${purpose})`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0b132b; margin-top: 0;">🔒 Secure Voting Authentication</h2>
              <p style="color: #4a5568;">Use the following code to complete your <strong>${purpose}</strong>:</p>
              <div style="background: #1c2541; color: #48cae4; font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 16px; border-radius: 6px; margin: 20px 0;">
                ${otp}
              </div>
              <p style="color: #718096; font-size: 13px;">This code is valid for 5 minutes. Do not share this OTP with anyone.</p>
            </div>
          </div>
        `
      });
      console.log(`📧 OTP Email successfully dispatched to ${email}`);
    } catch (err) {
      console.error(`⚠️ Failed to send OTP email: ${err.message}. Relying on console OTP.`);
    }
  }
};

module.exports = { generateOTP, sendOTPEmail };
