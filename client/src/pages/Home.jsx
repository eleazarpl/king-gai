import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard from '../components/PostCard';

const CATEGORIES = ['All', 'General', 'Confessions', 'Happiness', 'Struggles', 'Solutions', 'Random'];

function Home() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [category, sort]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts', { params: { category, sort } });
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Failed to fetch posts');
    }
    setLoading(false);
  };

  const handleVote = (postId, newVoteCount) => {
    setPosts(prev => prev.map(p =>
      p._id === postId ? { ...p, voteCount: newVoteCount } : p
    ));
  };

  return (
    <div>
      <div className="page-header">
        <h1>What's on your mind?</h1>
        <p>Share your stories, confessions, and moments — over a cup of coffee ☕</p>
      </div>

      <div className="filter-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            marginLeft: 'auto',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            background: 'var(--warm-white)',
            fontSize: '0.85rem'
          }}
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Brewing posts... ☕</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No stories here yet.</p>
          <p>Be the first to share something!</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post._id} post={post} onVote={handleVote} />
        ))
      )}
    </div>
  );
}

export default Home;
