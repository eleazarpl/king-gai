const express = require('express');
const Announcement = require('../models/Announcement');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all announcements (public)
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ pinned: -1, createdAt: -1 })
      .lean();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Create announcement (admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { title, content, pinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const announcement = new Announcement({
      title,
      content,
      author: req.user._id,
      authorAlias: req.user.alias || 'King Gai Admin',
      pinned: pinned || false
    });

    await announcement.save();
    res.status(201).json({ message: 'Announcement posted', announcement });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// Toggle pin (admin only)
router.patch('/:id/pin', authenticate, adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    announcement.pinned = !announcement.pinned;
    await announcement.save();
    res.json({ message: `Announcement ${announcement.pinned ? 'pinned' : 'unpinned'}`, announcement });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

module.exports = router;
