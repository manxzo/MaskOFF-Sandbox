// routes/friendRoutes.js
const express = require("express");
const router = express.Router();
const UserAuth = require("../models/UserAuth");
const { verifyToken } = require("../components/jwtUtils");
const { sendToUser, sendToUsers } = require("../components/wsUtils");

/**
 * Send a friend request:
 * - Adds an entry to the sender's friendRequestsSent.
 * - Adds an entry to the recipient's friendRequestsReceived.
 */
router.post("/friends/request", verifyToken, async (req, res) => {
  try {
    const { friendID } = req.body;
    const sender = await UserAuth.findById(req.user.id);
    const recipient = await UserAuth.findById(friendID);
    if (!recipient)
      return res.status(404).json({ error: "Recipient not found." });

    // Check if request already exists.
    if (
      sender.friendRequestsSent.some((fr) => fr.userID.toString() === friendID)
    ) {
      return res.status(400).json({ error: "Friend request already sent." });
    }

    // Add to sender's friendRequestsSent.
    sender.friendRequestsSent.push({
      userID: recipient._id,
      username: recipient.username,
    });
    // Add to recipient's friendRequestsReceived.
    recipient.friendRequestsReceived.push({
      userID: sender._id,
      username: sender.username,
    });
    await sender.save();
    await recipient.save();

    // Optionally notify the recipient.
    sendToUser(friendID, { type: "UPDATE_DATA", update: "friendRequests" });
    res.json({ message: "Friend request sent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List friend requests received by the current user.
 */
router.get("/friends/requests/received", verifyToken, async (req, res) => {
  try {
    const user = await UserAuth.findById(req.user.id);
    res.json({ friendRequestsReceived: user.friendRequestsReceived });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List friend requests sent by the current user.
 */
router.get("/friends/requests/sent", verifyToken, async (req, res) => {
  try {
    const user = await UserAuth.findById(req.user.id);
    res.json({ friendRequestsSent: user.friendRequestsSent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Accept a friend request:
 * - Removes the request from friendRequestsReceived of the current user.
 * - Removes the corresponding request from friendRequestsSent of the sender.
 * - Adds both users to each other's friends list.
 */
router.post("/friends/accept", verifyToken, async (req, res) => {
  try {
    const { friendID } = req.body;
    const currentUser = await UserAuth.findById(req.user.id);
    const sender = await UserAuth.findById(friendID);
    if (!sender) return res.status(404).json({ error: "Sender not found." });

    // Remove from current user's friendRequestsReceived.
    currentUser.friendRequestsReceived =
      currentUser.friendRequestsReceived.filter(
        (fr) => fr.userID.toString() !== friendID
      );
    // Remove from sender's friendRequestsSent.
    sender.friendRequestsSent = sender.friendRequestsSent.filter(
      (fr) => fr.userID.toString() !== currentUser._id.toString()
    );

    // Check if they are already friends.
    const alreadyFriends = currentUser.friends.some(
      (f) => f.userID.toString() === friendID
    );
    if (!alreadyFriends) {
      currentUser.friends.push({
        userID: sender._id,
        username: sender.username,
      });
      sender.friends.push({
        userID: currentUser._id,
        username: currentUser.username,
      });
    }

    await currentUser.save();
    await sender.save();

    // Notify both users.
    sendToUsers([req.user.id, friendID], {
      type: "UPDATE_DATA",
      update: "friends",
    });
    res.json({ message: "Friend request accepted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Reject a friend request:
 * - Removes the request from friendRequestsReceived of the current user.
 * - Removes the corresponding request from friendRequestsSent of the sender.
 */
router.post("/friends/reject", verifyToken, async (req, res) => {
  try {
    const { friendID } = req.body;
    const currentUser = await UserAuth.findById(req.user.id);
    const sender = await UserAuth.findById(friendID);
    if (!sender) return res.status(404).json({ error: "Sender not found." });

    currentUser.friendRequestsReceived =
      currentUser.friendRequestsReceived.filter(
        (fr) => fr.userID.toString() !== friendID
      );
    sender.friendRequestsSent = sender.friendRequestsSent.filter(
      (fr) => fr.userID.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await sender.save();

    res.json({ message: "Friend request rejected." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List friends for the current user.
 */
router.get("/friends", verifyToken, async (req, res) => {
  try {
    const user = await UserAuth.findById(req.user.id);
    res.json({ friends: user.friends });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
