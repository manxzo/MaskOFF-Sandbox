const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAuth",
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Consolidated Post schema for all posts (MaskON/MaskOFF)
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuth",
      required: true,
    },
    // Flag to indicate whether the post is anonymous (MaskON) or public (MaskOFF)
    isAnonymous: { type: Boolean, default: false },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    // Vote tracking (optional, can be computed from the upvotedBy/downvotedBy arrays)
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "UserAuth",
      default: [],
    },
    downvotedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "UserAuth",
      default: [],
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Virtual transformation: rename _id to postID and remove __v.
postSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.postID = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
postSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
