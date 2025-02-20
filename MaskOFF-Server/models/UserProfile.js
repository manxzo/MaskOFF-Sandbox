// models/UserProfile.js
const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  // Reference the corresponding authentication document
  user: { type: mongoose.Schema.Types.ObjectId, ref: "UserAuth", required: true },
  // --- Optional Public Information ---
  publicInfo: {
    bio:          { type: String, default: "" },
    skills:       { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    portfolio:    { type: String, default: "" }
    // Add any additional public fields here
  },
  // --- Optional Anonymous Information (for MaskON mode) ---
  anonymousInfo: {
    anonymousIdentity: { type: String, default: "" , unique:true, required:true },
    details:           { type: String, default: "" } // e.g., skills, hobbies, etc.
  }
}, { timestamps: true });

// Virtual: Expose a friendly profileID
UserProfileSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.profileID = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
UserProfileSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("UserProfile", UserProfileSchema);
