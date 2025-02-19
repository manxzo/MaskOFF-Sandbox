// models/Post.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// models/Post.js snippet addition
const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
    isAnonymous: { type: Boolean, default: false },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    upvotes: { type: Number, default: 0 }, // optional if you calculate length of upvotedBy
    downvotes: { type: Number, default: 0 }, // optional if you calculate length of downvotedBy
    upvotedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'UserAuth', default: [] },
    downvotedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'UserAuth', default: [] },
    comments: [commentSchema]
  },
  { timestamps: true }
);


// Transform _id to postID in output
postSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.postID = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
postSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
