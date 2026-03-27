import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import type { Article } from '../../shared/types';

const INSIGHTS = [
  "The mind is not the enemy. The identification with it is.",
  "What we call 'stuck' is usually the body doing exactly what it was designed to do under conditions that no longer exist.",
  "Awareness doesn't need to be cultivated. It needs to be uncovered.",
  "Every resistance is information. The question is whether you're willing to read it.",
  "The gap between stimulus and response is where your entire life lives.",
  "Sit with it long enough and even the worst feeling reveals its edges.",
  "The paradox of acceptance is that nothing changes until you stop demanding that it does.",
  "You don't arrive at peace. You stop walking away from it.",
  "Information without integration is just intellectual hoarding.",
  "You are not a problem to be solved. You are a process to be witnessed.",
];

export default function NotFoundPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(all => setArticles(all.slice(0, 6)))
      .catch(() => {});
  }, []);

  const insight = INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];

  return (
    <>
      <SEOHead
        title="Page Not Found"
        description="The page you are looking for does not exist."
        canonical="https://narcissistcure.com/404"
      />
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: '#B87333' }}>404</h1>
        <blockquote style={{
          fontSize: '1.3rem',
          maxWidth: '600px',
          margin: '2rem auto',
          border: 'none',
          background: 'none',
          fontStyle: 'italic',
          color: '#4682B4',
        }}>
          "{insight}"
        </blockquote>
        <p style={{ color: '#555', marginBottom: '2rem' }}>
          The page you were looking for has moved or does not exist. But you are exactly where you need to be.
        </p>

        <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Start reading</h2>
          {articles.map(a => (
            <div key={a.slug} style={{ marginBottom: '0.5rem' }}>
              <Link to={`/articles/${a.slug}`}>{a.title}</Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/" className="btn btn-primary">Return Home</Link>
        </div>
      </div>
    </>
  );
}
