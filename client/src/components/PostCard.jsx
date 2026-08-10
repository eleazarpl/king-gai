import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function PostCard({ post, onVote }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleVote = async (e, type) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/posts/${post._id}/${type}`);
      if (onVote) onVote(post._id, res.data.voteCount);
    } catch (err) {
      console.error('Vote failed');
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="card" onClick={() => navigate(`/post/${post._id}`)}>
      <div className="post-header">
        <div className="post-meta">
          <span>☕ {post.authorAlias || 'Anonymous'}</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        <span className="badge">{post.category}</span>
      </div>
      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">
        {post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content}
      </p>
      <div className="post-footer">
        <div className="vote-section">
          <button
            className="vote-btn"
            onClick={(e) => handleVote(e, 'upvote')}
            aria-label="Upvote"
          >
            ▲
          </button>
          <span className="vote-count">{post.voteCount || 0}</span>
          <button
            className="vote-btn"
            onClick={(e) => handleVote(e, 'downvote')}
            aria-label="Downvote"
          >
            ▼
          </button>
        </div>
        <span className="post-meta">
          💬 {post.replyCount || post.replies?.length || 0} replies
        </span>
      </div>
    </div>
  );
}

export default PostCard;
