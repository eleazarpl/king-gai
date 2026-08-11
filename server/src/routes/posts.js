const express = require('express');
const Post = require('../models/Post');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ posts: [], totalPages: 0, currentPage: 1 });
    }

    const query = {
      status: 'approved',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const postsWithVotes = posts.map(post => ({
      ...post,
      voteCount: (post.upvotes?.length || 0) - (post.downvotes?.length || 0),
      replyCount: post.replies?.length || 0
    }));

    const total = await Post.countDocuments(query);

    res.json({
      posts: postsWithVotes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get all approved posts (public)
router.get('/', async (req, res) => {
  try {
    const { category, sort = 'newest', page = 1, limit = 20 } = req.query;
    const query = { status: 'approved' };

    if (category && category !== 'All') {
      query.category = category;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const postsWithVotes = posts.map(post => ({
      ...post,
      voteCount: (post.upvotes?.length || 0) - (post.downvotes?.length || 0),
      replyCount: post.replies?.length || 0
    }));

    if (sort === 'popular') {
      postsWithVotes.sort((a, b) => b.voteCount - a.voteCount);
    }

    const total = await Post.countDocuments(query);

    res.json({
      posts: postsWithVotes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: 'approved' }).lean();
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.voteCount = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create post (authenticated or anonymous)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { title, content, category, isAnonymous, customAlias } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const postData = {
      title,
      content,
      category: category || 'General',
      status: 'pending'
    };

    if (req.user && !isAnonymous) {
      postData.author = req.user._id;
      postData.authorAlias = customAlias || req.user.alias;
      postData.isAnonymous = false;
    } else {
      postData.isAnonymous = true;
      postData.authorAlias = customAlias || 'Anonymous';
    }

    const post = new Post(postData);
    await post.save();

    res.status(201).json({ message: 'Post submitted for approval', post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Upvote a post
router.post('/:id/upvote', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user._id;
    post.downvotes = post.downvotes.filter(id => !id.equals(userId));

    const alreadyUpvoted = post.upvotes.some(id => id.equals(userId));
    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter(id => !id.equals(userId));
    } else {
      post.upvotes.push(userId);
    }

    await post.save();
    res.json({ voteCount: post.upvotes.length - post.downvotes.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// Downvote a post
router.post('/:id/downvote', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user._id;
    post.upvotes = post.upvotes.filter(id => !id.equals(userId));

    const alreadyDownvoted = post.downvotes.some(id => id.equals(userId));
    if (alreadyDownvoted) {
      post.downvotes = post.downvotes.filter(id => !id.equals(userId));
    } else {
      post.downvotes.push(userId);
    }

    await post.save();
    res.json({ voteCount: post.upvotes.length - post.downvotes.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to downvote' });
  }
});

// Add reply to a post
router.post('/:id/reply', optionalAuth, async (req, res) => {
  try {
    const { content, isAnonymous, customAlias, parentReplyId } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    const post = await Post.findOne({ _id: req.params.id, status: 'approved' });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const reply = {
      content,
      isAnonymous: !req.user || isAnonymous,
      parentReplyId: parentReplyId || null
    };

    if (req.user && !isAnonymous) {
      reply.author = req.user._id;
      reply.authorAlias = customAlias || req.user.alias;
    } else {
      reply.authorAlias = customAlias || 'Anonymous';
    }

    post.replies.push(reply);
    await post.save();

    res.status(201).json({ message: 'Reply added', reply: post.replies[post.replies.length - 1] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Get my posts (authenticated)
router.get('/me/posts', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const postsWithVotes = posts.map(post => ({
      ...post,
      voteCount: (post.upvotes?.length || 0) - (post.downvotes?.length || 0),
      replyCount: post.replies?.length || 0
    }));

    res.json(postsWithVotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your posts' });
  }
});

// Delete own post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found or not yours' });
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Report a post
router.post('/:id/report', optionalAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Add to reported list if not already reported
    if (!post.reports) post.reports = [];
    post.reports.push({
      reason: reason || 'Inappropriate content',
      reportedAt: new Date(),
      reportedBy: req.user?._id || null
    });
    await post.save();

    res.json({ message: 'Post reported. Admin will review it.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report post' });
  }
});

module.exports = router;
