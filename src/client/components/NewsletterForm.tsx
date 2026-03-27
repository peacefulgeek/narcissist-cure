import React, { useState } from 'react';

interface Props {
  source: string;
}

export default function NewsletterForm({ source }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <p style={{ color: '#4682B4', fontWeight: 600 }}>Thanks for subscribing!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      <label htmlFor={`email-${source}`} className="sr-only">Email address</label>
      <input
        id={`email-${source}`}
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        aria-label="Email address"
      />
      <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Joining...' : 'Join'}
      </button>
    </form>
  );
}
