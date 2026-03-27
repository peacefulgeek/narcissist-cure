import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import type { Article } from '../../shared/types';

const CATEGORIES = [
  { slug: 'the-recognition', name: 'The Recognition' },
  { slug: 'the-bond', name: 'The Bond' },
  { slug: 'the-exit', name: 'The Exit' },
  { slug: 'the-rebuild', name: 'The Rebuild' },
  { slug: 'the-alchemy', name: 'The Alchemy' },
];

const PER_PAGE = 20;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const category = searchParams.get('category') || '';
  const query = searchParams.get('q') || '';

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(setArticles)
      .catch(() => {});
  }, []);

  let filtered = articles;
  if (category) filtered = filtered.filter(a => a.categorySlug === category);
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
    );
  }

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const pageArticles = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <SEOHead
        title="Articles"
        description={`Browse ${articles.length} articles on narcissistic abuse recovery, healing, and rebuilding your life.`}
        canonical={`https://narcissistcure.com/articles${category ? `?category=${category}` : ''}`}
        ogImage="https://narcissist-cure.b-cdn.net/og/articles.png"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Articles',
          url: 'https://narcissistcure.com/articles',
          description: `Browse ${articles.length} articles on narcissistic abuse recovery.`,
        }}
      />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1>Articles</h1>
        <p style={{ color: '#555', marginBottom: '1.5rem' }}>{filtered.length} articles</p>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="search"
            placeholder="Search articles..."
            value={query}
            onChange={e => setSearchParams({ q: e.target.value, category, page: '1' })}
            style={{
              width: '100%',
              padding: '0.75em 1em',
              fontSize: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
            aria-label="Search articles"
          />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <button
            onClick={() => setSearchParams({ q: query, page: '1' })}
            style={{
              padding: '0.4em 0.8em',
              border: `2px solid ${!category ? '#4682B4' : '#e0e0e0'}`,
              borderRadius: '4px',
              background: !category ? '#4682B4' : 'transparent',
              color: !category ? '#FFFFF0' : '#555',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.slug}
              onClick={() => setSearchParams({ category: c.slug, q: query, page: '1' })}
              style={{
                padding: '0.4em 0.8em',
                border: `2px solid ${category === c.slug ? '#4682B4' : '#e0e0e0'}`,
                borderRadius: '4px',
                background: category === c.slug ? '#4682B4' : 'transparent',
                color: category === c.slug ? '#FFFFF0' : '#555',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div>
          {pageArticles.map(article => (
            <div key={article.slug} style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <Link to={`/articles/${article.slug}`} style={{
                color: '#1a1a1a',
                fontWeight: 600,
                flex: 1,
              }}>
                {article.title}
              </Link>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#999', whiteSpace: 'nowrap' }}>
                <span>{article.dateHuman}</span>
                <span>{article.readingTime} min</span>
                <Link to={`/category/${article.categorySlug}`} className="category-badge" style={{ fontSize: '0.65rem' }}>
                  {article.category}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setSearchParams({ category, q: query, page: String(p) })}
                style={{
                  padding: '0.5em 0.75em',
                  border: `2px solid ${p === currentPage ? '#4682B4' : '#e0e0e0'}`,
                  borderRadius: '4px',
                  background: p === currentPage ? '#4682B4' : 'transparent',
                  color: p === currentPage ? '#FFFFF0' : '#555',
                  cursor: 'pointer',
                  minWidth: '44px',
                  minHeight: '44px',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
