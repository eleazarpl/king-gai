import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="empty-state" style={{ paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>This page doesn't exist.</p>
      <p>Maybe the coffee hasn't kicked in yet ☕</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
