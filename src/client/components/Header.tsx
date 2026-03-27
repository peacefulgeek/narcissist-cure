import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header style={{
      borderBottom: '1px solid #e0e0e0',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      <Link to="/" style={{
        fontFamily: "'DM Serif Text', Georgia, serif",
        fontSize: '1.4rem',
        color: '#1a1a1a',
        textDecoration: 'none',
      }}>
        The Narcissist Antidote
      </Link>
      <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
        <Link to="/articles" style={{ color: '#555' }}>Articles</Link>
        <Link to="/about" style={{ color: '#555' }}>About</Link>
      </nav>
    </header>
  );
}
