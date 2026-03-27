import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import type { Article } from '../../shared/types';

const PILLAR_SLUGS = [
  'how-gaslighting-rewires-your-brain',
  'trauma-bonding-explained',
  'the-no-contact-survival-guide',
  'rebuilding-trust-in-your-own-perception',
  'when-narcissistic-abuse-becomes-spiritual-awakening',
  'the-flying-monkey-playbook',
];

export default function StartHerePage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(all => {
        const pillars = PILLAR_SLUGS.map(s => all.find((a: Article) => a.slug === s)).filter(Boolean);
        if (pillars.length < 4) {
          // Fallback: pick first from each category
          const cats = ['the-recognition', 'the-bond', 'the-exit', 'the-rebuild', 'the-alchemy'];
          const fallback = cats.map(c => all.find((a: Article) => a.categorySlug === c)).filter(Boolean);
          setArticles(fallback.slice(0, 6));
        } else {
          setArticles(pillars);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <SEOHead
        title="Start Here"
        description="New to The Narcissist Antidote? Start with these essential articles on recognizing narcissistic abuse, understanding trauma bonds, and beginning your recovery."
        canonical="https://narcissistcure.com/start-here"
        ogImage="https://narcissist-cure.b-cdn.net/og/start-here.png"
      />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1>Start Here</h1>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          If you have just discovered that what you experienced was narcissistic abuse, or if you have known for a while but cannot seem to break free from the patterns it left behind, these articles are where we recommend you begin. They cover the foundational concepts, the neuroscience of what happened to your brain, and the first steps toward reclaiming your perception.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {articles.map((article, i) => (
            <div key={article.slug} style={{
              padding: '1.5rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              borderLeft: '4px solid #B87333',
            }}>
              <span style={{ color: '#B87333', fontWeight: 700, fontSize: '0.85rem' }}>
                {i + 1} of {articles.length}
              </span>
              <h2 style={{ marginTop: '0.25rem', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                <Link to={`/articles/${article.slug}`}>{article.title}</Link>
              </h2>
              <p style={{ color: '#555', marginBottom: '0.5rem' }}>{article.excerpt}</p>
              <span style={{ fontSize: '0.8rem', color: '#999' }}>{article.readingTime} min read</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
