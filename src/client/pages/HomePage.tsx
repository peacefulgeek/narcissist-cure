import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import NewsletterForm from '../components/NewsletterForm';
import type { Article } from '../../shared/types';

const CATEGORIES = [
  { slug: 'the-recognition', name: 'The Recognition' },
  { slug: 'the-bond', name: 'The Bond' },
  { slug: 'the-exit', name: 'The Exit' },
  { slug: 'the-rebuild', name: 'The Rebuild' },
  { slug: 'the-alchemy', name: 'The Alchemy' },
];

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(setArticles)
      .catch(() => {});
  }, []);

  const latest = articles.slice(0, 3);
  const categoryCounts = CATEGORIES.map(c => ({
    ...c,
    count: articles.filter(a => a.categorySlug === c.slug).length,
  }));

  const pullQuote = latest[0]?.excerpt || "You're not crazy. You were manipulated. Here's how to come back.";

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'The Narcissist Antidote',
      url: 'https://narcissistcure.com',
      description: 'Recovering from People Who Made You Doubt Yourself',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'The Narcissist Antidote',
      url: 'https://narcissistcure.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://narcissistcure.com/articles?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <>
      <SEOHead
        title="The Narcissist Antidote"
        description="Recovering from People Who Made You Doubt Yourself. Expert guidance on narcissistic abuse recovery, gaslighting recognition, and rebuilding trust in your own perception."
        canonical="https://narcissistcure.com"
        ogImage="https://narcissist-cure.b-cdn.net/og/home.png"
        keywords="narcissistic abuse recovery, gaslighting, trauma bonding, narcissist, healing"
        jsonLd={jsonLd}
      />
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        {/* Pull quote */}
        <blockquote style={{
          fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
          fontFamily: "'DM Serif Text', Georgia, serif",
          lineHeight: 1.3,
          border: 'none',
          padding: '2rem 0',
          margin: '0 0 3rem',
          background: 'none',
          fontStyle: 'normal',
          color: '#1a1a1a',
          borderLeft: '4px solid #B87333',
          paddingLeft: '1.5rem',
        }}>
          {pullQuote}
        </blockquote>

        {/* Latest articles as text blocks */}
        <section>
          {latest.map(article => (
            <article key={article.slug} style={{
              padding: '1.5rem 0',
              borderBottom: '1px solid #e0e0e0',
            }}>
              <Link to={`/articles/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h2 style={{ fontSize: '1.4rem', marginTop: 0, marginBottom: '0.5rem' }}>{article.title}</h2>
              </Link>
              <p style={{ color: '#555', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                {article.excerpt}
              </p>
              <div style={{ fontSize: '0.8rem', color: '#999', display: 'flex', gap: '1rem' }}>
                <span>{article.readingTime} min read</span>
                <span>{article.dateHuman}</span>
                <Link to={`/category/${article.categorySlug}`} className="category-badge" style={{ fontSize: '0.7rem' }}>
                  {article.category}
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* Category links */}
        <section style={{ margin: '3rem 0' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Explore</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categoryCounts.map(c => (
              <Link key={c.slug} to={`/category/${c.slug}`} style={{
                color: '#4682B4',
                fontSize: '1rem',
              }}>
                {c.name} <span style={{ color: '#999', fontSize: '0.85rem' }}>({c.count} articles)</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section style={{ margin: '3rem 0' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Join our community</p>
          <NewsletterForm source="homepage" />
        </section>
      </div>
    </>
  );
}
