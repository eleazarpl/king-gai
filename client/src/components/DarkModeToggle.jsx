import React, { useState, useEffect } from 'react';

function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('kinggai_theme') === 'dark';
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('kinggai_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('kinggai_theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: 'var(--cream, #f5ebe0)',
        padding: '0.5rem',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: '1rem'
      }}
      aria-label="Toggle dark mode"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}

export default DarkModeToggle;
