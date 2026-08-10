import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to fetch announcements');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/announcements', { title, content, pinned });
      setTitle('');
      setContent('');
      setPinned(false);
      setShowForm(false);
      setMessage('Announcement posted!');
      fetchAnnouncements();
    } catch (err) {
      setMessage('Failed to post announcement');
    }
    setSubmitting(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete');
    }
  };

  const handlePin = async (id) => {
    try {
      await api.patch(`/announcements/${id}/pin`);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to pin');
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
    <div>
      <div className="page-header">
        <h1>📢 Announcements</h1>
        <p>Updates and news from King Gai</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      {isAdmin && (
        <div style={{ marginBottom: '1.5rem' }}>
          {!showForm ? (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + New Announcement
            </button>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Post Announcement</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title..."
                    maxLength={200}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your update..."
                    maxLength={5000}
                    required
                  />
                </div>
                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="pinAnnouncement"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                    />
                    <label htmlFor="pinAnnouncement" style={{ margin: 0 }}>Pin to top</label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="empty-state">
          <p>No announcements yet.</p>
        </div>
      ) : (
        announcements.map(a => (
          <div key={a._id} className="card" style={{ borderLeft: a.pinned ? '4px solid var(--accent)' : undefined }}>
            <div className="post-header">
              <div className="post-meta">
                {a.pinned && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>📌 Pinned</span>}
                <span>👑 {a.authorAlias}</span>
                <span>{timeAgo(a.createdAt)}</span>
              </div>
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{a.title}</h3>
            <p className="post-content" style={{ whiteSpace: 'pre-wrap' }}>{a.content}</p>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-secondary btn-small" onClick={() => handlePin(a._id)}>
                  {a.pinned ? 'Unpin' : '📌 Pin'}
                </button>
                <button className="btn btn-danger btn-small" onClick={() => handleDelete(a._id)}>
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Announcements;
