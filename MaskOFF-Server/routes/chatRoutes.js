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

// create new chat (explicitly)
router.post("/chat/create", verifyToken, async (req, res) => {
  try {
    const { recipientID } = req.body;
    const chat = new ChatLog({ participants: [req.user.id, recipientID] });
    await chat.save();
    // notify both participants
    sendToUsers([req.user.id, recipientID], { type: "UPDATE_DATA", update: "chats" });
    res.status(201).json(chat.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// list all chats for current user
router.get("/chats", verifyToken, async (req, res) => {
  try {
    const chats = await ChatLog.find({ participants: req.user.id }).populate("participants", "username");
    res.json(chats.map(chat => chat.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// send message in chat (auto-create chat if needed)
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
    // notify both participants
    sendToUsers([req.user.id, recipientID], { type: "UPDATE_DATA", update: "chats" });
    res.json({ message: "Message sent", chat: chat.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get decrypted messages for specific chat
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

// delete specific message from 1 chat
router.delete("/chat/message/:chatId/:messageId", verifyToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await ChatLog.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    await chat.deleteMessage(messageId);
    // notify other participants
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

// edit a message in a chat
router.put("/chat/message/:chatId/:messageId", verifyToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { newText } = req.body;
    const chat = await ChatLog.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    await chat.editMessage(messageId, newText);
    // notify other participants
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

// delete entire chat
router.delete("/chat/:chatId", verifyToken, async (req, res) => {
  try {
    const chat = await ChatLog.findByIdAndDelete(req.params.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    // notify all participants
    chat.participants.forEach(participant => {
      sendToUsers([participant.toString()], { type: "UPDATE_DATA", update: "chats" });
    });
    res.json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
