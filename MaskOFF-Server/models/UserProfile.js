// models/UserProfile.js
const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuth",
      required: true,
    },
    privacy: { type: Boolean, default: false },
    // Optional public info
    publicInfo: {
      bio: { type: String, default: "" },
      skills: { type: [String], default: [] },
      achievements: { type: [String], default: [] },
      portfolio: { type: String, default: "" },
    },
    // Anonymous info (MaskON mode)
    anonymousInfo: {
      anonymousIdentity: { type: String, unique: true, required: true },
      details: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

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
