import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function ReplyItem({ reply, allReplies, postId, onReplyAdded, depth = 0 }) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const childReplies = allReplies.filter(r =>
    r.parentReplyId && r.parentReplyId.toString() === reply._id.toString()
  );

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/reply`, {
        content: replyContent,
        isAnonymous,
        customAlias: customAlias || undefined,
        parentReplyId: reply._id
      });
      setReplyContent('');
      setCustomAlias('');
      setShowReplyForm(false);
      onReplyAdded();
    } catch (err) {
      console.error('Failed to reply');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0 }}>
      <div className="reply" style={{ borderLeftColor: depth > 0 ? 'var(--border)' : 'var(--accent)' }}>
        <div className="reply-meta">
          <strong>☕ {reply.authorAlias || 'Anonymous'}</strong> · {timeAgo(reply.createdAt)}
        </div>
        <p>{reply.content}</p>
        {depth < 3 && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--coffee-light)',
              fontSize: '0.8rem',
              marginTop: '0.5rem',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {showReplyForm ? 'Cancel' : '↩ Reply'}
          </button>
        )}

        {showReplyForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '0.8rem' }}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${reply.authorAlias || 'Anonymous'}...`}
              maxLength={2000}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                minHeight: '60px',
                resize: 'vertical',
                fontSize: '0.9rem',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{ width: '14px', height: '14px' }}
                />
                Anonymous
              </label>
              {(isAnonymous || !user) && (
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="Alias"
                  maxLength={30}
                  style={{
                    padding: '0.3rem 0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    width: '120px'
                  }}
                />
              )}
              <button type="submit" className="btn btn-primary btn-small" disabled={submitting}>
                {submitting ? '...' : 'Reply'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Child replies */}
      {childReplies.map(child => (
        <ReplyItem
          key={child._id}
          reply={child}
          allReplies={allReplies}
          postId={postId}
          onReplyAdded={onReplyAdded}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

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
  const [reportMessage, setReportMessage] = useState('');

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

  const handleReport = async () => {
    const reason = window.prompt('Why are you reporting this post? (optional)');
    if (reason === null) return; // cancelled
    try {
      await api.post(`/posts/${id}/report`, { reason: reason || 'Inappropriate content' });
      setReportMessage('Post reported. Admin will review it.');
    } catch (err) {
      setReportMessage('Failed to report post.');
    }
    setTimeout(() => setReportMessage(''), 4000);
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

  // Get top-level replies (no parentReplyId)
  const topLevelReplies = (post.replies || []).filter(r => !r.parentReplyId);

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
        <div className="post-footer">
          <div className="vote-section">
            <button className="vote-btn" onClick={() => handleVote('upvote')} aria-label="Upvote">▲</button>
            <span className="vote-count">{post.voteCount || 0}</span>
            <button className="vote-btn" onClick={() => handleVote('downvote')} aria-label="Downvote">▼</button>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <span className="post-meta">💬 {post.replies?.length || 0} replies</span>
            <button
              onClick={handleReport}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              🚩 Report
            </button>
          </div>
        </div>
        {reportMessage && (
          <div className={`message ${reportMessage.includes('Failed') ? 'message-error' : 'message-success'}`} style={{ marginTop: '0.8rem' }}>
            {reportMessage}
          </div>
        )}
      </div>

      {/* Replies */}
      <h3 style={{ margin: '1.5rem 0 1rem' }}>Replies</h3>
      {post.replies?.length === 0 && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No replies yet. Start the conversation!</p>
      )}

      {topLevelReplies.map(reply => (
        <ReplyItem
          key={reply._id}
          reply={reply}
          allReplies={post.replies}
          postId={id}
          onReplyAdded={fetchPost}
        />
      ))}

      {/* Top-level reply form */}
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', float: 'right' }}>
              {replyContent.length}/2000
            </span>
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
