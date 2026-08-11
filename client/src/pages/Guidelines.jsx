import React from 'react';

function Guidelines() {
  return (
    <div style={{ paddingTop: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'left', padding: '0 0 1.5rem' }}>
        <h1>Community Guidelines</h1>
        <p>Keep the coffee shop vibe friendly ☕</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Welcome to King Gai 傾偈</h3>
        <p style={{ marginBottom: '1rem' }}>
          This is a space for sharing stories, confessions, happy moments, struggles, and solutions. 
          Think of it like a conversation over coffee — open, honest, and respectful.
        </p>

        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>✅ Do</h4>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
          <li>Share genuine stories and experiences</li>
          <li>Be supportive and empathetic in replies</li>
          <li>Use appropriate categories for your posts</li>
          <li>Report posts that violate these guidelines</li>
          <li>Respect anonymity — don't try to identify anonymous posters</li>
        </ul>

        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>❌ Don't</h4>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
          <li>Post hate speech, harassment, or threats</li>
          <li>Share personal information about others without consent</li>
          <li>Spam, advertise, or promote products/services</li>
          <li>Post illegal content or encourage illegal activity</li>
          <li>Impersonate other people</li>
          <li>Post sexually explicit content</li>
        </ul>

        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>📋 How It Works</h4>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
          <li>All posts are reviewed by an admin before going live</li>
          <li>Posts that violate guidelines will be rejected</li>
          <li>Repeated violations may result in your account being removed</li>
          <li>You can report any post using the 🚩 Report button</li>
        </ul>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>Remember:</strong> Behind every post is a real person. Treat them how you'd want to be treated 
            if you were sharing something personal over coffee.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Guidelines;
