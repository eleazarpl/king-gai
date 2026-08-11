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
        filter === 'reported'
          ? api.get('/admin/posts/reported')
          : api.get(`/admin/posts?status=${filter}`)
      ]);
      setStats(statsRes.data);
      setPosts(filter === 'reported' ? postsRes.data : postsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data');
    }
    setLoading(false);
  };

  const handleAction = async (postId, action) => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Permanently delete this post? This cannot be undone.')) return;
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
            <div className="label">Live</div>
          </div>
          <div className="stat-card">
            <div className="number">{stats.hidden}</div>
            <div className="label">Archived</div>
          </div>
          <div className="stat-card">
            <div className="number">{stats.rejected}</div>
            <div className="label">Rejected</div>
          </div>
          <div className="stat-card">
            <div className="number">{stats.totalUsers}</div>
            <div className="label">Users</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="filter-bar">
        {['pending', 'approved', 'reported', 'hidden', 'rejected'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'approved' ? 'Live' : f === 'hidden' ? 'Archived' : f === 'reported' ? '🚩 Reported' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No {filter === 'approved' ? 'live' : filter === 'hidden' ? 'archived' : filter} posts</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post._id} className="card">
            <div className="post-header">
              <div className="post-meta">
                <span>☕ {post.authorAlias || 'Anonymous'}</span>
                <span>{timeAgo(post.createdAt)}</span>
                <span className={`badge badge-${post.status}`}>
                  {post.status === 'approved' ? 'live' : post.status === 'hidden' ? 'archived' : post.status}
                </span>
              </div>
              <span className="badge">{post.category}</span>
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{post.title}</h3>
            <p className="post-content">{post.content}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
              {post.status === 'pending' && (
                <>
                  <button className="btn btn-success btn-small" onClick={() => handleAction(post._id, 'approve')}>
                    ✓ Approve (Go Live)
                  </button>
                  <button className="btn btn-secondary btn-small" onClick={() => handleAction(post._id, 'reject')}>
                    ✗ Reject
                  </button>
                </>
              )}
              {post.status === 'approved' && (
                <button className="btn btn-secondary btn-small" onClick={() => handleAction(post._id, 'hide')}>
                  🚫 Archive (Remove from Live)
                </button>
              )}
              {post.status === 'hidden' && (
                <button className="btn btn-success btn-small" onClick={() => handleAction(post._id, 'approve')}>
                  ✓ Restore to Live
                </button>
              )}
              {post.status === 'rejected' && (
                <button className="btn btn-success btn-small" onClick={() => handleAction(post._id, 'approve')}>
                  ✓ Approve (Go Live)
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
