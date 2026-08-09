const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, adminOnly);

// Get pending posts (approval queue)
router.get('/posts/pending', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending posts' });
  }
});

// Get all posts (any status)
router.get('/posts', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Approve a post
router.patch('/posts/:id/approve', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post approved', post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve post' });
  }
});

// Reject a post
router.patch('/posts/:id/reject', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post rejected', post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject post' });
  }
});

// Hide a post (was approved, now hidden)
router.patch('/posts/:id/hide', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'hidden' },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post hidden', post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to hide post' });
  }
});

// Delete a post permanently
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted permanently' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const pending = await Post.countDocuments({ status: 'pending' });
    const approved = await Post.countDocuments({ status: 'approved' });
    const rejected = await Post.countDocuments({ status: 'rejected' });
    const hidden = await Post.countDocuments({ status: 'hidden' });
    const totalUsers = await User.countDocuments();

    res.json({ totalPosts, pending, approved, rejected, hidden, totalUsers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Seed admin user (run once)
router.post('/seed', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const admin = new User({
      email: process.env.ADMIN_EMAIL || 'admin@kinggai.com',
      password: process.env.ADMIN_PASSWORD || 'changeme123',
      alias: 'King Gai Admin',
      role: 'admin'
    });
    await admin.save();
    res.status(201).json({ message: 'Admin user created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

module.exports = router;
