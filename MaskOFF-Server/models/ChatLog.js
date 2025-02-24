const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config(); // make sure .env is loaded

// derive a 32-byte AES key from the secret
const AES_SECRET_KEY = process.env.AES_SECRET_KEY;
const getAESKey = () => crypto.createHash('sha256').update(String(AES_SECRET_KEY)).digest();

// encryption function for chat messages
const encryptMessage = (text) => {
  const iv = crypto.randomBytes(16);
  const key = getAESKey();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
};

// decryption function for chat messages
const decryptMessage = (encryptedText, iv) => {
  const key = getAESKey();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth' },
  encryptedMessage: { type: String, required: true },
  iv: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatLogSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAuth',
      required: true
    }],
    messages: [messageSchema]
  },
  { timestamps: true }
);

// add a new encrypted message
chatLogSchema.methods.addMessage = async function(sender, recipient, text) {
  const { iv, encryptedData } = encryptMessage(text);
  this.messages.push({ sender, recipient, encryptedMessage: encryptedData, iv });
  await this.save();
};

// delete message by its ID
chatLogSchema.methods.deleteMessage = async function(messageId) {
  this.messages = this.messages.filter(msg => msg._id.toString() !== messageId.toString());
  await this.save();
};

// edit message by its ID (re-encrypt new text)
chatLogSchema.methods.editMessage = async function(messageId, newText) {
  const message = this.messages.id(messageId);
  if (message) {
    const { iv, encryptedData } = encryptMessage(newText);
    message.encryptedMessage = encryptedData;
    message.iv = iv;
    message.timestamp = new Date();
    await this.save();
  } else {
    throw new Error("Message not found");
  }
};

// get all messages decrypted
chatLogSchema.methods.getDecryptedMessages = function() {
  return this.messages.map(msg => ({
    msgID: msg._id.toHexString(),  // custom label
    sender: msg.sender,
    recipient: msg.recipient,
    message: decryptMessage(msg.encryptedMessage, msg.iv),
    timestamp: msg.timestamp
  }));
};

// transform _id to chatID
chatLogSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.chatID = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
chatLogSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("ChatLog", chatLogSchema);
