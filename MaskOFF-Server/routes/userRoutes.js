// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const UserAuth = require("../models/UserAuth");
const UserProfile = require("../models/UserProfile");
const { generateToken, verifyToken } = require("../components/jwtUtils");
// Import MailerSend-based email utility functions
const { sendVerificationEmail, sendForgotPasswordEmail } = require("../components/emailUtils");

// ================== Registration & Verification ==================

// Registration: Create UserAuth and corresponding UserProfile, then send verification email.
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    username,
    password,
    confirmPassword,
    publicInfo,
    anonymousInfo,
  } = req.body;

  // Validate compulsory fields.
  if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
    return res.status(400).json({ error: "All compulsory fields are required." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }
  
  try {
    // Check for duplicate email or username.
    if (await UserAuth.findOne({ email })) {
      return res.status(409).json({ error: "Email already in use." });
    }
    if (await UserAuth.findOne({ username })) {
      return res.status(409).json({ error: "Username already taken." });
    }
    
    // Create authentication document.
    const newUserAuth = new UserAuth({ firstName, lastName, email, username, password });
    newUserAuth.generateVerificationToken(); // Generate token for email verification.
    await newUserAuth.save();
    
    // Create corresponding profile document.
    const newUserProfile = new UserProfile({ user: newUserAuth._id, publicInfo, anonymousInfo });
    await newUserProfile.save();
    
    // Construct the verification URL using APP_URL from your environment.
    const verificationUrl = `${process.env.APP_URL || "http://localhost:3000"}/verify-email?userID=${newUserAuth.userID}&token=${newUserAuth.verificationToken}`;
    
    // Send verification email using MailerSend API via emailUtils.
    await sendVerificationEmail({
      to: newUserAuth.email,
      toName: newUserAuth.firstName,
      username: newUserAuth.username,
      verifyUrl: verificationUrl,
      supportEmail: process.env.SUPPORT_EMAIL || "support@domain.com",
    });
    
    // Generate JWT token for immediate login (optional).
    const token = generateToken(newUserAuth);
    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      token,
      user: { ...newUserAuth.toJSON(), profile: newUserProfile.toJSON() },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Email Verification Route
router.get("/verify-email", async (req, res) => {
  const { userID, token } = req.query;
  if (!userID || !token) {
    return res.status(400).json({ error: "Missing parameters." });
  }
  try {
    const user = await UserAuth.findById(userID);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.verificationToken !== token) {
      return res.status(400).json({ error: "Invalid verification token." });
    }
    user.emailVerified = true;
    user.verificationToken = undefined; // Clear the token after verification.
    await user.save();
    res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================== Forgot Password & Reset Password ==================

// Forgot Password: Request a password reset.
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });
  
  try {
    const user = await UserAuth.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });
    
    // Generate a reset token.
    const resetToken = user.generateResetPasswordToken();
    await user.save();
    
    // Construct the password reset URL.
    const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?userID=${user.userID}&token=${resetToken}`;
    
    // Send forgot-password email using MailerSend API via emailUtils.
    await sendForgotPasswordEmail({
      to: user.email,
      toName: user.firstName,
      username: user.username,
      resetUrl,
      supportEmail: process.env.SUPPORT_EMAIL || "support@domain.com",
    });
    
    res.json({ message: "Password reset instructions have been sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Reset Password: Set a new password using the token.
router.post("/reset-password", async (req, res) => {
  const { userID, token, newPassword, confirmNewPassword } = req.body;
  if (!userID || !token || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ error: "Missing parameters." });
  }
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }
  
  try {
    const user = await UserAuth.findById(userID);
    if (!user) return res.status(404).json({ error: "User not found." });
    // Check if token is valid and not expired.
    if (user.resetPasswordToken !== token || Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }
    // Update password (it will be hashed in the pre-save hook).
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================== Login, Get User, Update Profile, List Users ==================

// Login Route
router.post("/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserAuth.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!(await user.isCorrectPassword(password))) return res.status(401).json({ error: "Invalid credentials." });
    
    const token = generateToken(user);
    // Fetch user profile.
    const profile = await UserProfile.findOne({ user: user._id });
    res.json({ token, user: { ...user.toJSON(), profile: profile ? profile.toJSON() : {} } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user details (combined auth & profile)
router.get("/user/:userID", verifyToken, async (req, res) => {
  try {
    const user = await UserAuth.findById(req.params.userID);
    if (!user) return res.status(404).json({ error: "User not found." });
    const profile = await UserProfile.findOne({ user: user._id });
    res.json({ ...user.toJSON(), profile: profile ? profile.toJSON() : {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile (optional update of public/anonymous info)
router.put("/profile/:userID", verifyToken, async (req, res) => {
  try {
    const { publicInfo, anonymousInfo } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { user: req.params.userID },
      { publicInfo, anonymousInfo },
      { new: true }
    );
    if (!profile) return res.status(404).json({ error: "Profile not found." });
    res.json({ message: "Profile updated", profile: profile.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get list of all users (basic public information)
router.get("/users", async (req, res) => {
  try {
    // Retrieve all users from the authentication collection.
    const users = await UserAuth.find({});
    // For each user, retrieve corresponding public profile data.
    const userList = await Promise.all(
      users.map(async (user) => {
        const profile = await UserProfile.findOne({ user: user._id });
        return {
          userID: user.userID,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          publicInfo: profile ? profile.publicInfo : {},
        };
      })
    );
    res.json({ users: userList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
