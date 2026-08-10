import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, postsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/posts?status=${filter}`)
      ]);
      setStats(statsRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data');
    }
    setLoading(false);
  };

  const handleAction = async (postId, action) => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Permanently delete this post?')) return;
        await api.delete(`/admin/posts/${postId}`);
      } else {
        await api.patch(`/admin/posts/${postId}/${action}`);
      }
      fetchData();
    } catch (err) {
      console.error(`Failed to ${action} post`);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ paddingTop: '2rem' }}>
      <div className="page-header" style={{ textAlign: 'left', padding: '0 0 1.5rem' }}>
        <h1>Admin Panel</h1>
        <p>Manage posts and community content</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="admin-grid">
          <div className="stat-card">
            <div className="number">{stats.pending}</div>
            <div className="label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="number">{stats.approved}</div>
            <div className="label">Approved</div>
          </div>
          <div className="stat-card">
            <div className="number">{stats.rejected}</div>
            <div className="label">Rejected</div>
          </div>
          <div className="stat-card">
            <div className="number">{stats.hidden}</div>
            <div className="label">Hidden</div>
          </div>
          <div className="stat-card">
            <div className="number">{stats.totalUsers}</div>
            <div className="label">Users</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="filter-bar">
        {['pending', 'approved', 'rejected', 'hidden'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No {filter} posts</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post._id} className="card">
            <div className="post-header">
              <div className="post-meta">
                <span>☕ {post.authorAlias || 'Anonymous'}</span>
                <span>{timeAgo(post.createdAt)}</span>
                <span className={`badge badge-${post.status}`}>{post.status}</span>
              </div>
              <span className="badge">{post.category}</span>
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{post.title}</h3>
            <p className="post-content">{post.content}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
              {post.status !== 'approved' && (
                <button className="btn btn-success btn-small" onClick={() => handleAction(post._id, 'approve')}>
                  ✓ Approve
                </button>
              )}
              {post.status === 'approved' && (
                <button className="btn btn-secondary btn-small" onClick={() => handleAction(post._id, 'hide')}>
                  🚫 Archive (Hide from Live)
                </button>
              )}
              {post.status !== 'rejected' && post.status !== 'approved' && (
                <button className="btn btn-secondary btn-small" onClick={() => handleAction(post._id, 'reject')}>
                  ✗ Reject
                </button>
              )}
              <button className="btn btn-danger btn-small" onClick={() => handleAction(post._id, 'delete')}>
                🗑 Delete Permanently
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;
