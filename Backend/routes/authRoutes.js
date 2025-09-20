const express = require('express');
const authController = require("../controller/authController");
const userAuth = require('../middleware/userAuth');

const authRouter = express.Router();

// ---------------- AUTH ROUTES ----------------
authRouter.post('/register', async (req, res) => {
    try {
        const result = await authController.Register(req, res);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const result = await authController.Login(req, res);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

authRouter.post('/logout', async (req, res) => {
    try {
        const result = await authController.Logout(req, res);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

authRouter.get('/is-auth', userAuth, async (req, res) => {
    try {
        const result = await authController.isAuthenticated(req, res);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

// ---------------- EMAIL VERIFICATION ----------------
authRouter.post('/send-verify-otp', userAuth, async (req, res) => {
    try {
        const result = await authController.sendVerifyOtp(req, res);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

authRouter.post('/verify-account', userAuth, async (req, res) => {
    try {
        const result = await authController.verifyEmail(req, res);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

// ---------------- RESET PASSWORD ----------------
authRouter.post('/send-reset-otp', async (req, res) => {
    try {
        const result = await authController.sendResetOtp(req, res);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

// THIS WAS MISSING → VERIFY RESET OTP
authRouter.post('/verify-reset-otp', async (req, res) => {
    try {
        const result = await authController.verifyResetOtp(req, res);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

authRouter.post('/reset-password', async (req, res) => {
    try {
        const result = await authController.resetPassword(req, res);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
});

module.exports = authRouter;
