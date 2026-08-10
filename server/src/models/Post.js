const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  authorAlias: {
    type: String,
    default: 'Anonymous'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  parentReplyId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  authorAlias: {
    type: String,
    default: 'Anonymous'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'General'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for vote count
postSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
