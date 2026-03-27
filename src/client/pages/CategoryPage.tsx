import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import type { Article } from '../../shared/types';

const CATEGORY_META: Record<string, { name: string; description: string }> = {
  'the-recognition': { name: 'The Recognition', description: 'Recognizing narcissistic abuse patterns, gaslighting tactics, and the moment you realize what happened to you.' },
  'the-bond': { name: 'The Bond', description: 'Understanding trauma bonds, codependency, and why leaving feels impossible even when you know the truth.' },
  'the-exit': { name: 'The Exit', description: 'Practical guidance on no-contact, gray rock, co-parenting with a narcissist, and the logistics of leaving.' },
  'the-rebuild': { name: 'The Rebuild', description: 'Rebuilding your identity, trust, boundaries, and relationships after narcissistic abuse.' },
  'the-alchemy': { name: 'The Alchemy', description: 'Transforming narcissistic abuse into spiritual awakening, ego dissolution, and profound self-understanding.' },
};

const PER_PAGE = 20;

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(all => setArticles(all.filter((a: Article) => a.categorySlug === slug)))
      .catch(() => {});
  }, [slug]);

  const meta = CATEGORY_META[slug || ''] || { name: slug, description: '' };
  const totalPages = Math.ceil(articles.length / PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const pageArticles = articles.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <SEOHead
        title={meta.name}
        description={meta.description}
        canonical={`https://narcissistcure.com/category/${slug}`}
        ogImage="https://narcissist-cure.b-cdn.net/og/category.png"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: meta.name,
          url: `https://narcissistcure.com/category/${slug}`,
          description: meta.description,
        }}
      />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1>{meta.name}</h1>
        <p style={{ color: '#555', marginBottom: '2rem' }}>{meta.description}</p>
        <p style={{ color: '#999', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{articles.length} articles</p>

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
            <Link to={`/articles/${article.slug}`} style={{ color: '#1a1a1a', fontWeight: 600, flex: 1 }}>
              {article.title}
            </Link>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#999', whiteSpace: 'nowrap' }}>
              <span>{article.dateHuman}</span>
              <span>{article.readingTime} min</span>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setSearchParams({ page: String(p) })}
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
