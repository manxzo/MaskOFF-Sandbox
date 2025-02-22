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
  try {
    const {
      name,
      dob,
      email,
      username,
      password,
      confirmPassword,
      anonymousIdentity // Required for the maskOFF identity
    } = req.body;

    // 1. Validate all required fields
    if (!name || !dob || !email || !username || !password || !confirmPassword || !anonymousIdentity) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // 2. Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // 3. Check age >= 16
    const dateOfBirth = new Date(dob);
    if (isNaN(dateOfBirth.getTime())) {
      return res.status(400).json({ error: "Invalid date of birth format." });
    }
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setFullYear(now.getFullYear() - 16);
    if (dateOfBirth > cutoffDate) {
      return res.status(400).json({ error: "You must be at least 16 years old to register." });
    }

    // 4. Check for duplicates
    const emailExists = await UserAuth.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ error: "Email already in use." });
    }
    const usernameExists = await UserAuth.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({ error: "Username already taken." });
    }
    const anonymousIdentityExists = await UserProfile.findOne({ 'anonymousInfo.anonymousIdentity': anonymousIdentity });
    if (anonymousIdentityExists) {
      return res.status(409).json({ error: "This MaskOFF ID is already taken." });
    }

    // 5. Create the user
    const newUserAuth = new UserAuth({
      name,
      dob: dateOfBirth,
      email,
      username,
      password
    });
    newUserAuth.generateVerificationToken(); // generate a verification token
    await newUserAuth.save();

    // 6. Create the profile
    // Only anonymousIdentity is mandatory for the "anonymousInfo"
    const newUserProfile = new UserProfile({
      user: newUserAuth._id,
      anonymousInfo: {
        anonymousIdentity
      }
      // publicInfo, etc. remain optional
    });
    await newUserProfile.save();

    // 7. Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?userID=${newUserAuth._id}&verifytoken=${newUserAuth.verificationToken}`;
    await sendVerificationEmail({
      to: newUserAuth.email,
      toName: newUserAuth.name,
      username: newUserAuth.username,
      verifyUrl: verificationUrl,
      supportEmail: process.env.SUPPORT_EMAIL || "support@domain.com",
    });

    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        ...newUserAuth.toJSON(),
        profile: newUserProfile.toJSON()
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: err.message });
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

    if (user.emailVerified) {
      return res.json({ message: "Email verified." });
    }

    if (user.verificationToken !== token) {
      return res.status(400).json({ error: "Invalid verification token." });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
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
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?userID=${user._id}&token=${resetToken}&username=${user.username}`;

    // Updated: Use user.name (not user.firstName) since our schema has "name"
    await sendForgotPasswordEmail({
      to: user.email,
      toName: user.name,
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
    // Updated: Using custom instance methods for public profile conversion.
    res.json({ ...user.toPublicProfile(), profile: profile ? profile.toPublicProfile() : {} });
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
        return {
          userID: user.userID,
          username: user.username,
        };
      })
    );
    res.json({ users: userList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
