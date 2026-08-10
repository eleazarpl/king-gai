import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          King Gai <span>傾偈</span>
        </Link>
        <nav className="header-nav">
          <Link to="/announcements">Highlights</Link>
          <Link to="/create">Share</Link>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Join</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
