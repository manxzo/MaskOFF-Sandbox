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
    // Optionally, check if req.user.id matches post.user
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

// TODO: Add routes for commenting and upvoting/downvoting posts

module.exports = router;
