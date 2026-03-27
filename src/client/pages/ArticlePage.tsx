import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';
import NewsletterForm from '../components/NewsletterForm';
import type { Article } from '../../shared/types';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/articles/${slug}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(data => {
        setArticle(data);
        setLoading(false);
        // Fetch related
        fetch('/api/articles')
          .then(r => r.json())
          .then(all => {
            const sameCategory = all.filter((a: Article) => a.categorySlug === data.categorySlug && a.slug !== data.slug).slice(0, 3);
            setRelated(sameCategory);
          });
      })
      .catch(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
  if (!article) return <div className="container" style={{ padding: '4rem 0' }}><h1>Article not found</h1><Link to="/articles">Browse articles</Link></div>;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.metaDescription,
      image: article.heroImage,
      datePublished: article.dateISO,
      dateModified: article.dateISO,
      author: { '@type': 'Person', name: 'Kalesh' },
      publisher: {
        '@type': 'Organization',
        name: 'The Narcissist Antidote',
        url: 'https://narcissistcure.com',
      },
      mainEntityOfPage: `https://narcissistcure.com/articles/${article.slug}`,
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['.article-body h2', '.article-body p:first-of-type'],
      },
      articleSection: article.category,
      wordCount: article.readingTime * 250,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://narcissistcure.com' },
        { '@type': 'ListItem', position: 2, name: article.category, item: `https://narcissistcure.com/category/${article.categorySlug}` },
        { '@type': 'ListItem', position: 3, name: article.title },
      ],
    },
    ...(article.faqs && article.faqs.length > 0 ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    }] : []),
  ];

  return (
    <>
      <SEOHead
        title={article.title}
        description={article.metaDescription}
        canonical={`https://narcissistcure.com/articles/${article.slug}`}
        ogImage={article.ogImage}
        ogType="article"
        keywords={article.metaKeywords}
        jsonLd={jsonLd}
      />

      {/* Hero image - full bleed */}
      <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <img
          src={article.heroImage}
          alt={article.heroAlt}
          width={1200}
          height={675}
          style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
          fetchPriority="high"
        />
      </div>

      <article className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Title below hero */}
        <h1>{article.title}</h1>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link to={`/category/${article.categorySlug}`} className="category-badge">{article.category}</Link>
          <span style={{ color: '#999', fontSize: '0.85rem' }}>{article.dateHuman}</span>
          <span style={{ color: '#999', fontSize: '0.85rem' }}>{article.readingTime} min read</span>
        </div>

        {/* Body */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />

        {/* FAQ section */}
        {article.faqs && article.faqs.length > 0 && (
          <section className="faq-section">
            <h2 style={{ marginTop: 0 }}>Frequently Asked Questions</h2>
            {article.faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </section>
        )}

        {/* Share buttons */}
        <ShareButtons url={`/articles/${article.slug}`} title={article.title} />

        {/* Inline author bio */}
        <div style={{
          borderTop: '2px solid #e0e0e0',
          marginTop: '2rem',
          paddingTop: '1.5rem',
        }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>About Kalesh</p>
          <p style={{ color: '#555', lineHeight: 1.6 }}>
            Kalesh is a consciousness teacher and writer whose work explores the intersection of ancient contemplative traditions and modern neuroscience. With decades of practice in meditation, breathwork, and somatic inquiry, he guides others toward embodied awareness.{' '}
            <a href="https://kalesh.love">Visit Kalesh's Website</a>
          </p>
        </div>

        {/* Cross-links */}
        {related.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>More from {article.category}</h3>
            {related.map(r => (
              <div key={r.slug} style={{ marginBottom: '0.5rem' }}>
                <Link to={`/articles/${r.slug}`}>{r.title}</Link>
              </div>
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(70,130,180,0.05)', borderRadius: '8px' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Stay connected</p>
          <NewsletterForm source={`article-${article.slug}`} />
        </div>

        {/* Disclaimer */}
        <div className="disclaimer">
          <strong>Disclaimer:</strong> The content on this site is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. If you are in crisis, please contact the National Domestic Violence Hotline at 1-800-799-7233 or text START to 88788. Always seek the advice of a qualified professional with any questions you may have.
        </div>
      </article>
    </>
  );
}
