const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const UserProfile = require("../models/UserProfile");
const { verifyToken } = require("../components/jwtUtils");

// Create a new post
router.post("/posts", verifyToken, async (req, res) => {
  try {
    const { content, tags, isAnonymous } = req.body;
    if (!content)
      return res.status(400).json({ error: "Content is required." });

    const newPost = new Post({
      user: req.user.id,
      content,
      tags,
      isAnonymous: isAnonymous || false,
    });
    await newPost.save();
    res
      .status(201)
      .json({ message: "Post created successfully.", post: newPost.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve all posts with proper profile info based on MaskON (anonymous) vs. MaskOFF (public)
router.get("/posts", async (req, res) => {
  try {
    // Get all posts and populate the "user" field (but note that we don't want to reveal public info for anonymous posts)
    const posts = await Post.find().populate("user", "username");

    // For each post, fetch the associated UserProfile and decide which info to include
    const postsWithProfile = await Promise.all(
      posts.map(async (post) => {
        const profile = await UserProfile.findOne({ user: post.user._id });
        let displayProfile = {};
        if (post.isAnonymous) {
          // If anonymous, return only the anonymousInfo
          displayProfile = {
            anonymousInfo: profile ? profile.anonymousInfo : {},
          };
        } else {
          // Otherwise, return the publicInfo
          displayProfile = { publicInfo: profile ? profile.publicInfo : {} };
        }
        return {
          ...post.toJSON(),
          user: {
            userID: post.user._id, // or post.user.userID if virtuals are available
            username: post.user.username,
            ...displayProfile,
          },
        };
      })
    );
    res.json({ posts: postsWithProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single post by postID, with proper profile info
router.get("/posts/:postID", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postID).populate(
      "user",
      "username"
    );
    if (!post) return res.status(404).json({ error: "Post not found." });
    const profile = await UserProfile.findOne({ user: post.user._id });
    let displayProfile = {};
    if (post.isAnonymous) {
      displayProfile = { anonymousInfo: profile ? profile.anonymousInfo : {} };
    } else {
      displayProfile = { publicInfo: profile ? profile.publicInfo : {} };
    }
    res.json({
      post: {
        ...post.toJSON(),
        user: {
          userID: post.user._id,
          username: post.user.username,
          ...displayProfile,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a post
router.put("/posts/:postID", verifyToken, async (req, res) => {
  try {
    const { postID } = req.params;
    const { content, tags, isAnonymous } = req.body;
    const post = await Post.findById(postID);
    if (!post) return res.status(404).json({ error: "Post not found." });
    // Optionally check if req.user.id matches post.user.
    post.content = content || post.content;
    post.tags = tags || post.tags;
    if (typeof isAnonymous !== "undefined") {
      post.isAnonymous = isAnonymous;
    }
    await post.save();
    res.json({ message: "Post updated", post: post.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a post
router.delete("/posts/:postID", verifyToken, async (req, res) => {
  try {
    const { postID } = req.params;
    const post = await Post.findByIdAndDelete(postID);
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Additional Routes ====================

// Add a comment to a post
router.post("/posts/:postID/comments", verifyToken, async (req, res) => {
  try {
    const { postID } = req.params;
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ error: "Comment content is required." });
    const post = await Post.findById(postID);
    if (!post) return res.status(404).json({ error: "Post not found." });

    // Add the comment with the user's ID and content.
    post.comments.push({ user: req.user.id, content });
    await post.save();
    res.status(201).json({ message: "Comment added", post: post.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote a post
router.post("/posts/:postID/upvote", verifyToken, async (req, res) => {
  try {
    const { postID } = req.params;
    const post = await Post.findById(postID);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const userId = req.user.id;

    // Remove from downvotedBy if exists.
    if (post.downvotedBy && post.downvotedBy.includes(userId)) {
      post.downvotedBy = post.downvotedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    // Toggle upvote.
    if (post.upvotedBy && post.upvotedBy.includes(userId)) {
      post.upvotedBy = post.upvotedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.upvotedBy = post.upvotedBy || [];
      post.upvotedBy.push(userId);
    }

    await post.save();
    res.json({ message: "Upvote processed", post: post.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Downvote a post
router.post("/posts/:postID/downvote", verifyToken, async (req, res) => {
  try {
    const { postID } = req.params;
    const post = await Post.findById(postID);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const userId = req.user.id;

    // Remove from upvotedBy if exists.
    if (post.upvotedBy && post.upvotedBy.includes(userId)) {
      post.upvotedBy = post.upvotedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    // Toggle downvote.
    if (post.downvotedBy && post.downvotedBy.includes(userId)) {
      post.downvotedBy = post.downvotedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.downvotedBy = post.downvotedBy || [];
      post.downvotedBy.push(userId);
    }

    await post.save();
    res.json({ message: "Downvote processed", post: post.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
