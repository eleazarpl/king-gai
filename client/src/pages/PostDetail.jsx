import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      console.error('Failed to fetch post');
    }
    setLoading(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/posts/${id}/reply`, {
        content: replyContent,
        isAnonymous,
        customAlias: customAlias || undefined
      });
      setReplyContent('');
      setCustomAlias('');
      setMessage('Reply added!');
      fetchPost();
    } catch (err) {
      setMessage('Failed to add reply');
    }
    setSubmitting(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleVote = async (type) => {
    if (!user) return;
    try {
      const res = await api.post(`/posts/${id}/${type}`);
      setPost(prev => ({ ...prev, voteCount: res.data.voteCount }));
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

  if (loading) return <div className="loading">Loading... ☕</div>;
  if (!post) return <div className="empty-state"><p>Post not found</p></div>;

  return (
    <div style={{ paddingTop: '2rem' }}>
      <div className="card">
        <div className="post-header">
          <div className="post-meta">
            <span>☕ {post.authorAlias || 'Anonymous'}</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
          <span className="badge">{post.category}</span>
        </div>
        <h2 style={{ marginBottom: '1rem' }}>{post.title}</h2>
        <p className="post-content" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post attachment"
            style={{
              maxWidth: '100%',
              maxHeight: '400px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              border: '1px solid var(--border)'
            }}
          />
        )}
        <div className="post-footer">
          <div className="vote-section">
            <button className="vote-btn" onClick={() => handleVote('upvote')} aria-label="Upvote">▲</button>
            <span className="vote-count">{post.voteCount || 0}</span>
            <button className="vote-btn" onClick={() => handleVote('downvote')} aria-label="Downvote">▼</button>
          </div>
          <span className="post-meta">💬 {post.replies?.length || 0} replies</span>
        </div>
      </div>

      {/* Replies */}
      <h3 style={{ margin: '1.5rem 0 1rem' }}>Replies</h3>
      {post.replies?.length === 0 && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No replies yet. Start the conversation!</p>
      )}
      {post.replies?.map((reply, i) => (
        <div key={reply._id || i} className="reply">
          <div className="reply-meta">
            <strong>☕ {reply.authorAlias || 'Anonymous'}</strong> · {timeAgo(reply.createdAt)}
          </div>
          <p>{reply.content}</p>
        </div>
      ))}

      {/* Reply form */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>Add a Reply</h4>
        {message && (
          <div className={`message ${message.includes('Failed') ? 'message-error' : 'message-success'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleReply}>
          <div className="form-group">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={2000}
              required
            />
          </div>
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="replyAnon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <label htmlFor="replyAnon" style={{ margin: 0 }}>Post anonymously</label>
            </div>
          </div>
          {(isAnonymous || !user) && (
            <div className="form-group">
              <label>Custom alias (optional)</label>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="e.g. Coffee Lover"
                maxLength={30}
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Sending...' : 'Reply'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostDetail;
