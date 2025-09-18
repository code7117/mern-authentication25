const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const mailhelper = require('../helper/mailhelper');

const authController = {};

// Helper: create JWT token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ---------------- REGISTER ----------------
authController.Register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return { status: false, message: 'Missing Details' };

    if (!validator.isEmail(email))
        return { status: false, message: 'Invalid Email Format' };

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser)
            return { status: false, message: "User already exists" };

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: hashedPassword });

        const token = createToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Send welcome email
        await mailhelper.sendMail(user.email, user.name);

        return { status: true, message: 'Registration successful', data: user };
    } catch (err) {
        console.error(err);
        return { status: false, message: 'Server Error' };
    }
};

// ---------------- LOGIN ----------------
// authController.js
authController.Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ status: false, message: "Email and Password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ status: false, message: "Invalid Email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ status: false, message: "Invalid Password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,      // ✅ cross-site cookie
      sameSite: 'None',  // ✅ cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ status: true, message: "Login successful", data: user });
  } catch (err) {
    console.log(err);
    return res.json({ status: false, message: "Server Error" });
  }
};

// ---------------- LOGOUT ----------------
authController.Logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict'
        });
        return { status: true, message: "Logged Out" };
    } catch (err) {
        console.error(err);
        return { status: false, message: 'Server Error' };
    }
};

// ---------------- IS AUTHENTICATED ----------------
authController.isAuthenticated = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ status: false, message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ status: true, userId: decoded.id });
  } catch (err) {
    return res.json({ status: false, message: "Auth Error" });
  }
};


// ---------------- SEND VERIFY OTP ----------------
authController.sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        if (!user)
            return { status: false, message: "User not found" };
        if (user.isAccountVerified)
            return { status: false, message: "Account already verified" };

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        await mailhelper.sendOtpMail(user.email, user.name, otp);
        return { status: true, message: "Verification OTP sent to email" };
    } catch (err) {
        console.error(err);
        return { status: false, message: "Server error" };
    }
};

// ---------------- VERIFY EMAIL ----------------
authController.verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userId = req.userId;

    if (!userId || !otp)
        return { status: false, message: "Missing Details" };

    try {
        const user = await userModel.findById(userId);
        if (!user)
            return { status: false, message: "User not found" };

        if (!user.verifyOtp || user.verifyOtp !== otp)
            return { status: false, message: "Invalid OTP" };

        if (user.verifyOtpExpireAt < Date.now())
            return { status: false, message: "OTP Expired" };

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return { status: true, message: "Email verified successfully" };
    } catch (err) {
        console.error(err);
        return { status: false, message: "Server error" };
    }
};

// ---------------- RESET OTP ----------------
authController.sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return { status: false, message: 'Email is Required' };

    try {
        const user = await userModel.findOne({ email });
        if (!user) return { status: false, message: 'User not found' };

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
        await user.save();

        await mailhelper.sendresetOtpMail(user.email, user.name, otp);
        return { status: true, message: "OTP sent to your email" };
    } catch (err) {
        console.error(err);
        return { status: false, message: "Server error" };
    }
};

// ---------------- RESET PASSWORD ----------------
authController.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
        return { status: false, message: 'Email, OTP, and new password are required' };

    try {
        const user = await userModel.findOne({ email });
        if (!user) return { status: false, message: "User not found" };

        if (!user.resetOtp || user.resetOtp !== otp)
            return { status: false, message: 'Invalid OTP' };
        if (user.resetOtpExpireAt < Date.now())
            return { status: false, message: "OTP Expired" };

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();

        return { status: true, message: "Password has been reset successfully" };
    } catch (err) {
        console.error(err);
        return { status: false, message: "Server error" };
    }
};

module.exports = authController;
