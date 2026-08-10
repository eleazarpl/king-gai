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
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      let imageUrl = null;

      // Upload image if present
      if (imageData) {
        const uploadRes = await api.post('/upload/base64', { imageData });
        imageUrl = uploadRes.data.imageUrl;
      }

      await api.post('/posts', {
        title,
        content,
        category,
        isAnonymous,
        customAlias: customAlias || undefined,
        imageUrl
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
        <div className={`message ${message.includes('Failed') || message.includes('must') || message.includes('Please') ? 'message-error' : 'message-success'}`}>
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
          </div>

          <div className="form-group">
            <label>Add a Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                width: '100%'
              }}
            />
            {imagePreview && (
              <div style={{ marginTop: '0.8rem', position: 'relative' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)'
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            )}
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
        All posts are reviewed by admin before going live.
      </p>
    </div>
  );
}

export default CreatePost;
