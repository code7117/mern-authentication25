const nodemailer = require('nodemailer');
const { otpTemplate, welcomeTemplate, resetPasswordOtpTemplate } = require('../EmailTemplate/email');

// Reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.user,
    pass: process.env.pass
  }
});

// Verify transporter once
transporter.verify((err, success) => {
  if (err) console.log("Mail transporter error:", err);
  else console.log("Mail transporter ready:", success);
});

const mailhelper = {};

// Send welcome email
mailhelper.sendMail = async (email, name) => {
  const message = {
    from: process.env.user,
    to: email,
    subject: "Welcome to Our Platform!",
    html: welcomeTemplate(email, name)
  };

  try {
    let info = await transporter.sendMail(message);
    console.log('Welcome Mail sent:', info.response);
    return { status: true, info };
  } catch (err) {
    console.error('Welcome Mail failed:', err);
    return { status: false, error: err };
  }
};

// Send OTP for verification
mailhelper.sendOtpMail = async (email, name, otp) => {
  const message = {
    from: process.env.user,
    to: email,
    subject: "Your Verification OTP",
    html: otpTemplate(name, otp)
  };

  try {
    let info = await transporter.sendMail(message);
    console.log('OTP Mail sent:', info.response);
    return { status: true, info };
  } catch (err) {
    console.error('OTP Mail failed:', err);
    return { status: false, error: err };
  }
};

// Send OTP for password reset
mailhelper.sendresetOtpMail = async (email, name, otp) => {
  const message = {
    from: process.env.user,
    to: email,
    subject: "Your Password Reset OTP",
    html: resetPasswordOtpTemplate(name, otp)
  };

  try {
    let info = await transporter.sendMail(message);
    console.log('Reset OTP Mail sent:', info.response);
    return { status: true, info };
  } catch (err) {
    console.error('Reset OTP Mail failed:', err);
    return { status: false, error: err };
  }
};

module.exports = mailhelper;
