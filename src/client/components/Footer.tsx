import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #e0e0e0',
      padding: '2rem 1.5rem',
      maxWidth: '1100px',
      margin: '3rem auto 0',
      fontSize: '0.875rem',
      color: '#777',
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>Stay connected</p>
        <NewsletterForm source="footer" />
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/privacy" style={{ color: '#777' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: '#777' }}>Terms of Service</Link>
          <Link to="/start-here" style={{ color: '#777' }}>Start Here</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} The Narcissist Antidote. All rights reserved.</p>
      </div>
    </footer>
  );
}
