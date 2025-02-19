// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { verifyToken } = require("../components/jwtUtils");

// Create a new post (job listing, service offer, social post)
router.post("/posts", verifyToken, async (req, res) => {
  try {
    const { content, tags, isAnonymous } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required." });
    
    const newPost = new Post({
      user: req.user.id,
      content,
      tags,
      isAnonymous
    });
    await newPost.save();
    res.status(201).json({ message: "Post created successfully.", post: newPost.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve all posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "username publicInfo");
    res.json({ posts: posts.map(post => post.toJSON()) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a post (e.g., edit content)
router.put("/posts/:postID", verifyToken, async (req, res) => {
  try {
    const { postID } = req.params;
    const { content, tags, isAnonymous } = req.body;
    const post = await Post.findById(postID);
    if (!post) return res.status(404).json({ error: "Post not found" });
    // Optionally, verify if req.user.id matches post.user
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.isAnonymous = isAnonymous !== undefined ? isAnonymous : post.isAnonymous;
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
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== New Routes ====================

// Add a comment to a post
router.post("/posts/:postID/comments", verifyToken, async (req, res) => {
  try {
    const { postID } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Comment content is required." });
    const post = await Post.findById(postID);
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    // Push the comment with the user's ID and content
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
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    const userId = req.user.id;
    
    // Remove user from downvotedBy if they had previously downvoted
    if (post.downvotedBy && post.downvotedBy.includes(userId)) {
      post.downvotedBy = post.downvotedBy.filter(id => id.toString() !== userId.toString());
    }
    
    // Toggle upvote: if already upvoted, remove; otherwise, add.
    if (post.upvotedBy && post.upvotedBy.includes(userId)) {
      post.upvotedBy = post.upvotedBy.filter(id => id.toString() !== userId.toString());
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
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    const userId = req.user.id;
    
    // Remove user from upvotedBy if they had previously upvoted
    if (post.upvotedBy && post.upvotedBy.includes(userId)) {
      post.upvotedBy = post.upvotedBy.filter(id => id.toString() !== userId.toString());
    }
    
    // Toggle downvote: if already downvoted, remove; otherwise, add.
    if (post.downvotedBy && post.downvotedBy.includes(userId)) {
      post.downvotedBy = post.downvotedBy.filter(id => id.toString() !== userId.toString());
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
