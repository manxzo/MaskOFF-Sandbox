// models/Post.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAuth",
    required: true,
  },
  author:{type:String,required:true},
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  // Optional anonymous info for comments:
  anonymousInfo: {
    anonymousIdentity: { type: String },
    details: { type: String },
  },
});

// You can add a custom method on the comment schema as well if you want to hide the real user info
commentSchema.methods.toPublic = function() {
  const ret = this.toObject({ virtuals: true });
  // If comment is posted anonymously (assuming we pass an `isAnonymous` flag along with comment data),
  // then expose only the anonymous info.
  ret.commentID = ret._id
  if (ret.anonymousInfo && ret.anonymousInfo.anonymousIdentity) {
    // Remove the actual user field
    ret.user = undefined;
    return {
      ...ret,
      user: {
        anonymousIdentity: ret.anonymousInfo.anonymousIdentity,
        details: ret.anonymousInfo.details || "",
      },
    };
  } else {
    // Otherwise, return the user id and assume that the caller populated it.
    return ret;
  }
};

// Consolidated Post schema
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuth",
      required: true,
    },
    isAnonymous: { type: Boolean, default: false },
    author: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
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
    // Field to store anonymous identity & details if the post is anonymous.
    anonymousInfo: {
      anonymousIdentity: { type: String },
      details: { type: String },
    },
  },
  { timestamps: true }
);

// A custom method to output a public version of a post.
postSchema.methods.toPublic = function() {
  const ret = this.toObject({ virtuals: true });
  ret.postID = ret._id;  
  // Remove Mongo-specific fields
  delete ret.__v;
  delete ret._id;
  
  // Depending on anonymity, set the user field accordingly.
  if (ret.isAnonymous) {
    // If the post is anonymous, do not reveal the real user information.
    ret.user = {
      // Show only anonymous info; if not set, provide a fallback.
      anonymousIdentity: ret.anonymousInfo?.anonymousIdentity || "Anonymous",
      details: ret.anonymousInfo?.details || "",
    };
  } else {
    // Non-anonymous posts: assume the user field is populated.
    // Expose the user's id and username.
    ret.user = {
      userID: ret.user._id ? ret.user._id : ret.user, // if populated, ret.user._id is available
      username: ret.user.username,
    };
  }
  
  // Optionally, remove the anonymousInfo field from output.
  delete ret.anonymousInfo;
  return ret;
};

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
