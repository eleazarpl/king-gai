import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function MyPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyPosts();
  }, [user]);

  const fetchMyPosts = async () => {
    try {
      const res = await api.get('/posts/me/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts');
    }
    setLoading(false);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      fetchMyPosts();
    } catch (err) {
      console.error('Failed to delete');
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!user) return null;

  return (
    <div style={{ paddingTop: '2rem' }}>
      <div className="page-header" style={{ textAlign: 'left', padding: '0 0 1.5rem' }}>
        <h1>My Posts</h1>
        <p>Your submissions and their status</p>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>You haven't posted anything yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/create')} style={{ marginTop: '1rem' }}>
            Share Something
          </button>
        </div>
      ) : (
        posts.map(post => (
          <div key={post._id} className="card">
            <div className="post-header">
              <div className="post-meta">
                <span className={`badge badge-${post.status}`}>
                  {post.status === 'approved' ? 'Live' : post.status === 'hidden' ? 'Archived' : post.status}
                </span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
              <span className="badge">{post.category}</span>
            </div>
            <h3 style={{ marginBottom: '0.5rem', cursor: post.status === 'approved' ? 'pointer' : 'default' }}
              onClick={() => post.status === 'approved' && navigate(`/post/${post._id}`)}
            >
              {post.title}
            </h3>
            <p className="post-content">
              {post.content.length > 150 ? post.content.slice(0, 150) + '...' : post.content}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
              {post.status === 'approved' && (
                <span className="post-meta">▲ {post.voteCount || 0} · 💬 {post.replyCount || 0}</span>
              )}
              <button
                className="btn btn-danger btn-small"
                onClick={() => handleDelete(post._id)}
                style={{ marginLeft: 'auto' }}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyPosts;
