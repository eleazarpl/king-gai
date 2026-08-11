import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CATEGORIES = ['General', 'Confessions', 'Happiness', 'Struggles', 'Solutions', 'Random'];

function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/posts', {
        title,
        content,
        category,
        isAnonymous,
        customAlias: customAlias || undefined
      });
      setMessage('Your post has been submitted for approval! ☕');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage('Failed to submit post. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="page-header" style={{ textAlign: 'left', padding: '1rem 0' }}>
        <h1>Share Your Story</h1>
        <p>What's brewing in your mind today?</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story a title..."
              maxLength={200}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', float: 'right' }}>
              {title.length}/200
            </span>
          </div>

          <div className="form-group">
            <label>Your Story</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell us what's on your mind... confessions, happy moments, struggles, solutions — all welcome here."
              maxLength={5000}
              style={{ minHeight: '180px' }}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', float: 'right' }}>
              {content.length}/5000
            </span>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="postAnon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <label htmlFor="postAnon" style={{ margin: 0 }}>Post anonymously</label>
            </div>
          </div>

          {(isAnonymous || !user) && (
            <div className="form-group">
              <label>Custom alias (optional)</label>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="e.g. Night Owl, Coffee Lover"
                maxLength={30}
              />
            </div>
          )}

          {!user && (
            <div className="message message-success" style={{ background: 'var(--cream)' }}>
              You're posting as a guest. <a href="/login">Login</a> to track your posts and earn upvotes!
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : '☕ Submit for Approval'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
        All posts are reviewed by admin before going live. Read our <a href="/guidelines">community guidelines</a>.
      </p>
    </div>
  );
}

export default CreatePost;
