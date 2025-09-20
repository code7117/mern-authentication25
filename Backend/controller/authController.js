const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const mailhelper = require('../helper/mailhelper');

const authController = {};

// Helper: create JWT token
const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ---------------- REGISTER ----------------
authController.Register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.json({ status: false, message: 'Missing Details' });

  if (!validator.isEmail(email))
    return res.json({ status: false, message: 'Invalid Email Format' });

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.json({ status: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashedPassword });

    const token = createToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await mailhelper.sendMail(user.email, user.name);
    return res.json({ status: true, message: 'Registration successful', data: user });
  } catch (err) {
    console.error(err);
    return res.json({ status: false, message: 'Server Error' });
  }
};

// ---------------- LOGIN ----------------
authController.Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ status: false, message: "Email and Password are required" });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ status: false, message: "Invalid Email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ status: false, message: "Invalid Password" });

    const token = createToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ status: true, message: "Login successful", data: user });
  } catch (err) {
    console.log(err);
    return res.json({ status: false, message: "Server Error" });
  }
};

// ---------------- SEND RESET OTP ----------------
authController.sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ status: false, message: 'Email is required' });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ status: false, message: 'User not found' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 5 * 60 * 1000; // OTP valid 5 mins
    await user.save();

    await mailhelper.sendresetOtpMail(user.email, user.name, otp);
    return res.json({ status: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    return res.json({ status: false, message: "Server error" });
  }
};

// ---------------- VERIFY RESET OTP ----------------
// ---------------- VERIFY RESET OTP ----------------
authController.verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.json({ status: false, message: "Email and OTP are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ status: false, message: "User not found" });

    // Check if OTP matches
    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.json({ status: false, message: "Invalid OTP" });
    }

    // Check if OTP expired
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ status: false, message: "OTP expired" });
    }

    return res.json({ status: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    return res.json({ status: false, message: "Server error" });
  }
};


// ---------------- RESET PASSWORD ----------------
authController.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.json({ status: false, message: 'Email, OTP, and new password are required' });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ status: false, message: "User not found" });

    if (!user.resetOtp || user.resetOtp !== String(otp))
      return res.json({ status: false, message: 'Invalid OTP' });

    if (user.resetOtpExpireAt < Date.now())
      return res.json({ status: false, message: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ status: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    return res.json({ status: false, message: "Server error" });
  }
};

module.exports = authController;
