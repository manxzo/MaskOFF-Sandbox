// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const UserAuth = require("../models/UserAuth");
const UserProfile = require("../models/UserProfile");
const { generateToken, verifyToken } = require("../components/jwtUtils");
// Placeholder for email service (e.g., nodemailer)

// Registration: Create UserAuth and corresponding UserProfile
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    username,
    password,
    confirmPassword,
    publicInfo,
    anonymousInfo
  } = req.body;
  
  if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
    return res.status(400).json({ error: "All compulsory fields are required." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }
  try {
    // Check for duplicate email or username
    if (await UserAuth.findOne({ email })) return res.status(409).json({ error: "Email already in use." });
    if (await UserAuth.findOne({ username })) return res.status(409).json({ error: "Username already taken." });
    
    // Create authentication document
    const newUserAuth = new UserAuth({ firstName, lastName, email, username, password });
    newUserAuth.generateVerificationToken(); // Generate token for email verification
    await newUserAuth.save();
    
    // Create corresponding profile document
    const newUserProfile = new UserProfile({ user: newUserAuth._id, publicInfo, anonymousInfo });
    await newUserProfile.save();
    
    // TODO: Send verification email with newUserAuth.verificationToken
    
    const token = generateToken(newUserAuth);
    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      token,
      user: { ...newUserAuth.toJSON(), profile: newUserProfile.toJSON() }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Login Route
router.post("/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserAuth.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!(await user.isCorrectPassword(password))) return res.status(401).json({ error: "Invalid credentials." });
    
    const token = generateToken(user);
    // Optionally, you could also fetch the user profile:
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

app.get("/api/users", async (req, res) => {
  try {
    // Retrieve all users from authentication collection
    const users = await UserAuth.find({});
    // For each user, get their corresponding public profile
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
