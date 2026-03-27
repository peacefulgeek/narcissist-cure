import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import {
  SITE_NAME, SITE_DOMAIN, SITE_EDITORIAL, AUTHOR_NAME, AUTHOR_TITLE,
  AUTHOR_BIO, AUTHOR_LINK, BUNNY_CDN_BASE, BUNNY_STORAGE_ZONE,
  BUNNY_STORAGE_HOST, BUNNY_STORAGE_PASSWORD, CATEGORIES, SITE_SUBTITLE,
  SITE_TAGLINE,
} from '../shared/config.js';
import type { Article } from '../shared/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

// Load articles
const articlesPath = resolve(__dirname, '../../content/articles');
let allArticles: Article[] = [];

function loadArticles() {
  try {
    const indexPath = resolve(__dirname, '../../content/articles-index.json');
    if (existsSync(indexPath)) {
      allArticles = JSON.parse(readFileSync(indexPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load articles:', e);
  }
}
loadArticles();

function filterPublished(articles: Article[]): Article[] {
  const now = new Date();
  return articles.filter(a => new Date(a.dateISO) <= now)
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
}

const app = express();

// Compression
app.use(compression());

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// AI headers on every response
app.use((_req, res, next) => {
  res.setHeader('X-AI-Content-Author', AUTHOR_NAME);
  res.setHeader('X-AI-Content-Site', SITE_NAME);
  res.setHeader('X-AI-Identity-Endpoint', `${SITE_DOMAIN}/api/ai/identity`);
  res.setHeader('X-AI-LLMs-Txt', `${SITE_DOMAIN}/llms.txt`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// API: Email subscription to Bunny CDN
app.use(express.json());
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, source } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Invalid email' });
      return;
    }
    const entry = JSON.stringify({
      email,
      date: new Date().toISOString(),
      source: source || 'unknown',
    }) + '\n';

    const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/data/subscribers.jsonl`;
    // Read existing, append, write back
    let existing = '';
    try {
      const getResp = await fetch(url, {
        headers: { AccessKey: BUNNY_STORAGE_PASSWORD },
      });
      if (getResp.ok) existing = await getResp.text();
    } catch {}
    
    await fetch(url, {
      method: 'PUT',
      headers: {
        AccessKey: BUNNY_STORAGE_PASSWORD,
        'Content-Type': 'application/octet-stream',
      },
      body: existing + entry,
    });

    res.json({ success: true, message: 'Thanks for subscribing!' });
  } catch (e) {
    console.error('Subscribe error:', e);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

// API: Articles data
app.get('/api/articles', (_req, res) => {
  const published = filterPublished(allArticles);
  res.json(published.map(a => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    categorySlug: a.categorySlug,
    dateISO: a.dateISO,
    dateHuman: a.dateHuman,
    readingTime: a.readingTime,
    heroImage: a.heroImage,
    heroAlt: a.heroAlt,
  })));
});

app.get('/api/articles/:slug', (req, res) => {
  const article = allArticles.find(a => a.slug === req.params.slug);
  if (!article || new Date(article.dateISO) > new Date()) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  res.json(article);
});

// AI Endpoints
app.get('/llms.txt', (_req, res) => {
  const published = filterPublished(allArticles);
  res.type('text/plain').send(`# ${SITE_NAME}
# ${SITE_SUBTITLE}
# ${SITE_TAGLINE}

## About
${SITE_NAME} is an editorial publication focused on narcissistic abuse recovery, gaslighting recognition, trauma bonding, and rebuilding trust in your own perception. Content is written by ${AUTHOR_NAME}, ${AUTHOR_TITLE}.

## Topics
${CATEGORIES.map(c => `- ${c.name}`).join('\n')}

## Content
Total published articles: ${published.length}
Article format: Long-form editorial (2,500-2,800 words)
Update frequency: Daily

## Access
- Articles API: ${SITE_DOMAIN}/api/ai/articles
- Topics API: ${SITE_DOMAIN}/api/ai/topics
- Identity: ${SITE_DOMAIN}/api/ai/identity
- Sitemap: ${SITE_DOMAIN}/sitemap-index.xml
- RSS: ${SITE_DOMAIN}/feed.xml
`);
});

app.get('/.well-known/ai.json', (_req, res) => {
  const published = filterPublished(allArticles);
  res.json({
    version: '1.0',
    name: SITE_NAME,
    description: SITE_SUBTITLE,
    url: SITE_DOMAIN,
    author: { name: AUTHOR_NAME, title: AUTHOR_TITLE, url: AUTHOR_LINK },
    content: {
      type: 'editorial',
      topics: CATEGORIES.map(c => c.name),
      articleCount: published.length,
      format: 'long-form',
      wordRange: '2500-2800',
    },
    endpoints: {
      identity: '/api/ai/identity',
      topics: '/api/ai/topics',
      ask: '/api/ai/ask',
      articles: '/api/ai/articles',
      sitemap: '/api/ai/sitemap',
      llms: '/llms.txt',
    },
  });
});

app.get('/api/ai/identity', (_req, res) => {
  res.json({
    name: AUTHOR_NAME,
    title: AUTHOR_TITLE,
    bio: AUTHOR_BIO,
    site: SITE_NAME,
    url: AUTHOR_LINK,
    editorial: SITE_EDITORIAL,
  });
});

app.get('/api/ai/topics', (_req, res) => {
  const published = filterPublished(allArticles);
  res.json({
    categories: CATEGORIES.map(c => ({
      name: c.name,
      slug: c.slug,
      articleCount: published.filter(a => a.categorySlug === c.slug).length,
    })),
  });
});

app.get('/api/ai/ask', (req, res) => {
  const q = (req.query.q as string || '').toLowerCase();
  const published = filterPublished(allArticles);
  const matches = published.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q) ||
    a.metaKeywords.toLowerCase().includes(q)
  ).slice(0, 5);
  res.json({
    query: q,
    results: matches.map(a => ({
      title: a.title,
      url: `${SITE_DOMAIN}/articles/${a.slug}`,
      excerpt: a.excerpt,
      category: a.category,
    })),
  });
});

app.get('/api/ai/articles', (_req, res) => {
  const published = filterPublished(allArticles);
  res.json({
    total: published.length,
    articles: published.map(a => ({
      title: a.title,
      url: `${SITE_DOMAIN}/articles/${a.slug}`,
      category: a.category,
      date: a.dateISO,
      excerpt: a.excerpt,
    })),
  });
});

app.get('/api/ai/sitemap', (_req, res) => {
  const published = filterPublished(allArticles);
  res.json({
    pages: [
      { url: SITE_DOMAIN, title: 'Home', type: 'homepage' },
      { url: `${SITE_DOMAIN}/articles`, title: 'Articles', type: 'listing' },
      { url: `${SITE_DOMAIN}/about`, title: 'About', type: 'about' },
      { url: `${SITE_DOMAIN}/start-here`, title: 'Start Here', type: 'guide' },
      ...CATEGORIES.map(c => ({
        url: `${SITE_DOMAIN}/category/${c.slug}`,
        title: c.name,
        type: 'category',
      })),
      ...published.map(a => ({
        url: `${SITE_DOMAIN}/articles/${a.slug}`,
        title: a.title,
        type: 'article',
      })),
    ],
  });
});

// Sitemaps
app.get('/sitemap-index.xml', (_req, res) => {
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE_DOMAIN}/sitemap.xml</loc></sitemap>
  <sitemap><loc>${SITE_DOMAIN}/sitemap-images.xml</loc></sitemap>
</sitemapindex>`);
});

app.get('/sitemap.xml', (_req, res) => {
  const published = filterPublished(allArticles);
  const pages = [
    { loc: SITE_DOMAIN, priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE_DOMAIN}/articles`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_DOMAIN}/about`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE_DOMAIN}/start-here`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_DOMAIN}/privacy`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${SITE_DOMAIN}/terms`, priority: '0.3', changefreq: 'yearly' },
    ...CATEGORIES.map(c => ({
      loc: `${SITE_DOMAIN}/category/${c.slug}`,
      priority: '0.8',
      changefreq: 'daily' as const,
    })),
    ...published.map(a => ({
      loc: `${SITE_DOMAIN}/articles/${a.slug}`,
      priority: '0.6',
      changefreq: 'monthly' as const,
    })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

app.get('/sitemap-images.xml', (_req, res) => {
  const published = filterPublished(allArticles);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${published.map(a => `  <url>
    <loc>${SITE_DOMAIN}/articles/${a.slug}</loc>
    <image:image>
      <image:loc>${a.heroImage}</image:loc>
      <image:title>${a.title}</image:title>
    </image:image>
  </url>`).join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

// RSS Feed
app.get('/feed.xml', (_req, res) => {
  const published = filterPublished(allArticles).slice(0, 20);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_DOMAIN}</link>
    <description>${SITE_SUBTITLE}</description>
    <language>en-us</language>
    <atom:link href="${SITE_DOMAIN}/feed.xml" rel="self" type="application/rss+xml"/>
${published.map(a => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE_DOMAIN}/articles/${a.slug}</link>
      <guid>${SITE_DOMAIN}/articles/${a.slug}</guid>
      <pubDate>${new Date(a.dateISO).toUTCString()}</pubDate>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(a.category)}</category>
    </item>`).join('\n')}
  </channel>
</rss>`;
  res.type('application/rss+xml').send(xml);
});

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Robots.txt
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(`# Robots.txt for ${SITE_NAME}
User-agent: *
Allow: /
Allow: /llms.txt
Allow: /.well-known/ai.json
Allow: /api/ai/
Allow: /feed.xml
Allow: /sitemap.xml
Allow: /sitemap-index.xml
Allow: /sitemap-images.xml
Disallow: /api/subscribe
Disallow: /api/trpc/
Disallow: /api/cron/

# AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Bytespider
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: YouBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Diffbot
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: FriendlyCrawler
Allow: /

User-agent: Google-InspectionTool
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: GoogleOther-Image
Allow: /

User-agent: GoogleOther-Video
Allow: /

User-agent: ImagesiftBot
Allow: /

User-agent: Kangaroo Bot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Meta-ExternalFetcher
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PetalBot
Allow: /

User-agent: Scrapy
Allow: /

User-agent: Timpibot
Allow: /

User-agent: VelenPublicWebCrawler
Allow: /

User-agent: Webzio-Extended
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: iaskspider
Allow: /

User-agent: img2dataset
Allow: /

User-agent: omgili
Allow: /

User-agent: omgilibot
Allow: /

User-agent: peer39_crawler
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

User-agent: Sogou
Allow: /

User-agent: Exabot
Allow: /

User-agent: ia_archiver
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: Discordbot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: Slackbot
Allow: /

User-agent: Embedly
Allow: /

User-agent: Quora-Bot
Allow: /

User-agent: Pinterestbot
Allow: /

User-agent: redditbot
Allow: /

Sitemap: ${SITE_DOMAIN}/sitemap-index.xml
Sitemap: ${SITE_DOMAIN}/sitemap.xml
Sitemap: ${SITE_DOMAIN}/sitemap-images.xml
`);
});

// Serve static files in production
if (isProduction) {
  const clientDir = resolve(__dirname, '../client');
  app.use(express.static(clientDir, {
    maxAge: '1y',
    immutable: true,
  }));

  // SPA fallback — serve index.html for all non-API routes
  const knownPaths = ['/', '/articles', '/categories', '/about', '/start-here', '/privacy', '/terms', '/quiz', '/pattern-check', '/404'];
  app.get('*', (req, res) => {
    const p = req.path;
    const isKnown = knownPaths.includes(p) || p.startsWith('/articles/') || p.startsWith('/categories/');
    const status = isKnown ? 200 : 404;
    const indexPath = resolve(clientDir, 'index.html');
    if (existsSync(indexPath)) {
      res.status(status).sendFile(indexPath);
    } else {
      res.status(404).send('Not found');
    }
  });
}

app.listen(PORT, () => {
  console.log(`${SITE_NAME} running on port ${PORT}`);
});

export default app;
