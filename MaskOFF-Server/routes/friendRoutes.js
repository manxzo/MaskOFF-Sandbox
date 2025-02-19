// routes/friendRoutes.js
const express = require("express");
const router = express.Router();
const UserAuth = require("../models/UserAuth");
const { verifyToken } = require("../components/jwtUtils");
// Websocket utility (placeholder)
const { sendToUser, sendToUsers } = require("../components/wsUtils");

/*
  ---------------------
  Friend Endpoints
  ---------------------
*/

// Send a friend request
router.post("/friends/request", verifyToken, async (req, res) => {
  try {
    const { friendID } = req.body;
    const user = await UserAuth.findById(req.user.id);
    const friend = await UserAuth.findById(friendID);
    if (!friend) return res.status(404).json({ error: "Friend user not found" });
    if (friend.friendRequests && friend.friendRequests.includes(user._id)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }
    friend.friendRequests = friend.friendRequests || [];
    friend.friendRequests.push(user._id);
    await friend.save();
    // Notify friend to update their friend requests via websockets
    sendToUser(friendID, { type: "UPDATE_DATA", update: "friends" });
    res.json({ message: "Friend request sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List friend requests for the current user
router.get("/friends/requests", verifyToken, async (req, res) => {
  try {
    const user = await UserAuth.findById(req.user.id).populate("friendRequests", "username");
    res.json({ friendRequests: user.friendRequests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a friend request
router.post("/friends/accept", verifyToken, async (req, res) => {
  try {
    const { friendID } = req.body;
    const user = await UserAuth.findById(req.user.id);
    const friend = await UserAuth.findById(friendID);
    if (!friend) return res.status(404).json({ error: "User not found" });
    // Remove friend request if exists
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== friendID.toString()
    );
    // Add to friends list if not already
    user.friends = user.friends || [];
    friend.friends = friend.friends || [];
    if (!user.friends.includes(friendID)) user.friends.push(friendID);
    if (!friend.friends.includes(req.user.id)) friend.friends.push(req.user.id);
    await user.save();
    await friend.save();
    // Notify both users to update their friend lists
    sendToUsers([req.user.id, friendID], { type: "UPDATE_DATA", update: "friends" });
    res.json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List friend list for the current user
router.get("/friends", verifyToken, async (req, res) => {
  try {
    const user = await UserAuth.findById(req.user.id).populate("friends", "username");
    res.json({ friends: user.friends });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
