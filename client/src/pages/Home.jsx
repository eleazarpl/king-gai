import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard from '../components/PostCard';

const CATEGORIES = ['All', 'General', 'Confessions', 'Happiness', 'Struggles', 'Solutions', 'Random'];

function Home() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    fetchPosts(1, true);
  }, [category, sort]);

  const fetchPosts = async (pageNum = 1, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await api.get('/posts', { params: { category, sort, page: pageNum } });
      if (reset) {
        setPosts(res.data.posts);
      } else {
        setPosts(prev => [...prev, ...res.data.posts]);
      }
      setTotalPages(res.data.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch posts');
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearching(false);
      fetchPosts(1, true);
      return;
    }
    setLoading(true);
    setSearching(true);
    try {
      const res = await api.get('/posts/search', { params: { q: searchQuery } });
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Search failed');
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearching(false);
    fetchPosts(1, true);
  };

  const handleVote = (postId, newVoteCount) => {
    setPosts(prev => prev.map(p =>
      p._id === postId ? { ...p, voteCount: newVoteCount } : p
    ));
  };

  const loadMore = () => {
    fetchPosts(page + 1, false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>What's on your mind?</h1>
        <p>Share your stories, confessions, and moments — over a cup of coffee ☕</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--warm-white)',
              fontSize: '0.9rem'
            }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {searching && (
            <button type="button" className="btn btn-secondary" onClick={clearSearch}>Clear</button>
          )}
        </div>
      </form>

      {!searching && (
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
      )}

      {searching && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Showing results for "{searchQuery}"
        </p>
      )}

      {loading ? (
        <div className="loading">Brewing posts... ☕</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>{searching ? 'No posts found for your search.' : 'No stories here yet.'}</p>
          {!searching && <p>Be the first to share something!</p>}
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post._id} post={post} onVote={handleVote} />
          ))}
          {!searching && page < totalPages && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Back to top */}
      <BackToTop />
    </div>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: 'var(--coffee-medium)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 50
      }}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

export default Home;
