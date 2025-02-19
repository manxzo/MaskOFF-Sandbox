// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const ChatLog = require("../models/ChatLog");
const { verifyToken } = require("../components/jwtUtils");
const { sendToUsers } = require("../components/wsUtils");

/*
  ---------------------
  Chat Endpoints
  ---------------------
*/

// Create a new chat (explicitly)
router.post("/chat/create", verifyToken, async (req, res) => {
  try {
    const { recipientID } = req.body;
    const chat = new ChatLog({ participants: [req.user.id, recipientID] });
    await chat.save();
    // Notify both participants
    sendToUsers([req.user.id, recipientID], { type: "UPDATE_DATA", update: "chats" });
    res.status(201).json(chat.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all chats for the current user
router.get("/chats", verifyToken, async (req, res) => {
  try {
    const chats = await ChatLog.find({ participants: req.user.id }).populate("participants", "username");
    res.json(chats.map(chat => chat.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message in a chat (auto-creates chat if needed)
router.post("/chat/send", verifyToken, async (req, res) => {
  try {
    const { recipientID, text } = req.body;
    if (!recipientID || !text) throw new Error("Missing recipientID or text");
    
    let chat = await ChatLog.findOne({ participants: { $all: [req.user.id, recipientID] } });
    if (!chat) {
      chat = new ChatLog({ participants: [req.user.id, recipientID] });
      await chat.save();
    }
    await chat.addMessage(req.user.id, recipientID, text);
    // Notify both participants
    sendToUsers([req.user.id, recipientID], { type: "UPDATE_DATA", update: "chats" });
    res.json({ message: "Message sent", chat: chat.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve decrypted messages for a specific chat
router.get("/chat/messages/:chatId", verifyToken, async (req, res) => {
  try {
    const chat = await ChatLog.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    const messages = chat.getDecryptedMessages();
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a specific message from a chat
router.delete("/chat/message/:chatId/:messageId", verifyToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await ChatLog.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    await chat.deleteMessage(messageId);
    // Notify other participants
    chat.participants.forEach(participant => {
      if (participant.toString() !== req.user.id) {
        sendToUsers([participant.toString()], { type: "UPDATE_DATA", update: "chats" });
      }
    });
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a message in a chat
router.put("/chat/message/:chatId/:messageId", verifyToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { newText } = req.body;
    const chat = await ChatLog.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    await chat.editMessage(messageId, newText);
    // Notify other participants
    chat.participants.forEach(participant => {
      if (participant.toString() !== req.user.id) {
        sendToUsers([participant.toString()], { type: "UPDATE_DATA", update: "chats" });
      }
    });
    res.json({ message: "Message edited" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an entire chat
router.delete("/chat/:chatId", verifyToken, async (req, res) => {
  try {
    const chat = await ChatLog.findByIdAndDelete(req.params.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    // Notify all participants
    chat.participants.forEach(participant => {
      sendToUsers([participant.toString()], { type: "UPDATE_DATA", update: "chats" });
    });
    res.json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
