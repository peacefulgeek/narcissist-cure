// ─── FEATURE FLAG (stays in code — not a secret) ───
const AUTO_GEN_ENABLED = false; // Wildman flips to true on GitHub when ready

// ─── FROM RENDER ENV VARS (auto-revoked if found in code) ───
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FAL_KEY = process.env.FAL_API_KEY;
const GH_PAT = process.env.GH_PAT;

// ─── HARDCODED (Bunny is safe in code) ───
const BUNNY_STORAGE_ZONE = 'narcissist-cure';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_STORAGE_PASSWORD = '4e5b4df1-0478-41bd-875da770a1e7-2d36-4c4b';
const BUNNY_CDN_BASE = 'https://narcissist-cure.b-cdn.net';
const GITHUB_OWNER = 'peacefulgeek';
const GITHUB_REPO = 'narcissist-cure';
const GITHUB_BRANCH = 'main';

// ─── SITE CONFIG ───
const SITE_NAME = 'The Narcissist Antidote';
const AUTHOR_NAME = 'Kalesh';
const CATEGORIES = [
  { slug: 'the-recognition', name: 'The Recognition' },
  { slug: 'the-bond', name: 'The Bond' },
  { slug: 'the-exit', name: 'The Exit' },
  { slug: 'the-rebuild', name: 'The Rebuild' },
  { slug: 'the-alchemy', name: 'The Alchemy' },
];

const EXTERNAL_AUTHORITY_SITES = [
  'https://www.psychologytoday.com',
  'https://www.apa.org',
  'https://www.nimh.nih.gov',
  'https://www.thehotline.org',
  'https://www.ncbi.nlm.nih.gov',
  'https://www.goodtherapy.org',
  'https://www.betterhelp.com',
  'https://www.nami.org',
];

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!AUTO_GEN_ENABLED) {
    console.log('[generate] AUTO_GEN_ENABLED is false. Exiting.');
    process.exit(0);
  }

  if (!ANTHROPIC_API_KEY || !FAL_KEY || !GH_PAT) {
    console.error('[generate] Missing required environment variables.');
    process.exit(1);
  }

  console.log('[generate] Starting article generation pipeline...');

  // Load existing articles index
  const indexPath = resolve(__dirname, '../content/articles-index.json');
  let articles = [];
  if (existsSync(indexPath)) {
    articles = JSON.parse(readFileSync(indexPath, 'utf-8'));
  }

  // Determine next article to generate
  const existingSlugs = new Set(articles.map(a => a.slug));
  const category = CATEGORIES[articles.length % CATEGORIES.length];

  // Generate article via Anthropic Claude
  const articlePrompt = buildArticlePrompt(category, existingSlugs);
  const articleContent = await callAnthropic(articlePrompt);
  if (!articleContent) {
    console.error('[generate] Failed to generate article content.');
    process.exit(1);
  }

  // Parse the generated article
  const parsed = parseArticle(articleContent, category);
  if (!parsed) {
    console.error('[generate] Failed to parse article.');
    process.exit(1);
  }

  // Generate hero image via FAL.ai
  const imageUrl = await generateImage(parsed.imagePrompt);
  if (imageUrl) {
    const webpBuffer = await downloadAndConvert(imageUrl);
    if (webpBuffer) {
      const imagePath = `images/heroes/${parsed.slug}.webp`;
      await uploadToBunny(imagePath, webpBuffer);
      parsed.heroImage = `${BUNNY_CDN_BASE}/${imagePath}`;
    }
  }

  // Generate OG image
  const ogImageUrl = await generateImage(parsed.ogImagePrompt);
  if (ogImageUrl) {
    const ogBuffer = await downloadImage(ogImageUrl);
    if (ogBuffer) {
      const ogPath = `images/og/${parsed.slug}.png`;
      await uploadToBunny(ogPath, ogBuffer);
      parsed.ogImage = `${BUNNY_CDN_BASE}/${ogPath}`;
    }
  }

  // Set date to today
  const now = new Date();
  parsed.dateISO = now.toISOString().split('T')[0];
  parsed.dateHuman = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Add to index
  articles.push(parsed);
  writeFileSync(indexPath, JSON.stringify(articles, null, 2));

  // Push to GitHub
  await pushToGitHub(indexPath, articles);

  console.log(`[generate] Article "${parsed.title}" generated and pushed.`);
}

function buildArticlePrompt(category, existingSlugs) {
  return `You are ${AUTHOR_NAME}, a consciousness teacher and writer. Write a 2,500-2,800 word article for ${SITE_NAME} in the "${category.name}" category about narcissistic abuse recovery.

Follow these rules strictly:
- Use HTML <a href> links only, NOT markdown
- Add rel="nofollow" on external org links
- Add 3-5 internal cross-links to other articles
- Include 1-2 first-person lived experience markers
- Include at least 1 named researcher reference (Ramani Durvasula, Craig Malkin, Lundy Bancroft, Pete Walker, Shannon Thomas, Shahida Arabi, Bessel van der Kolk)
- Include 3-5 phrases from the Kalesh voice library
- Varied FAQ count (0-5)
- Do NOT start with "You" 
- Do NOT use "This is where" as a transition
- 30% spiritual/healing thread woven in
- End with challenge or provocation (not comfort)

Return JSON with: title, slug, excerpt (2-3 sentences), metaDescription (<160 chars), metaKeywords, bodyHtml, faqs (array of {question, answer}), imagePrompt (2-3 sentence scene description for hero image), ogImagePrompt (scene for OG card).

Existing slugs to avoid: ${[...existingSlugs].slice(-20).join(', ')}`;
}

async function callAnthropic(prompt) {
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await resp.json();
    return data.content?.[0]?.text || null;
  } catch (e) {
    console.error('[generate] Anthropic API error:', e);
    return null;
  }
}

function parseArticle(content, category) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      category: category.name,
      categorySlug: category.slug,
      readingTime: Math.ceil((parsed.bodyHtml || '').split(/\s+/).length / 250),
      heroImage: `${BUNNY_CDN_BASE}/images/default-hero.webp`,
      heroAlt: parsed.title,
      ogImage: `${BUNNY_CDN_BASE}/images/og/default.png`,
      backlinkType: 'internal',
    };
  } catch (e) {
    console.error('[generate] Parse error:', e);
    return null;
  }
}

async function generateImage(prompt) {
  try {
    const resp = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${FAL_KEY}`,
      },
      body: JSON.stringify({
        prompt: `${prompt}. Luminous, warm, healing atmosphere. No dark environments. No distressed people. No text on image.`,
        image_size: { width: 1200, height: 675 },
        num_images: 1,
      }),
    });
    const data = await resp.json();
    return data.images?.[0]?.url || null;
  } catch (e) {
    console.error('[generate] FAL.ai error:', e);
    return null;
  }
}

async function downloadAndConvert(url) {
  try {
    const resp = await fetch(url);
    return Buffer.from(await resp.arrayBuffer());
  } catch (e) {
    console.error('[generate] Download error:', e);
    return null;
  }
}

async function downloadImage(url) {
  return downloadAndConvert(url);
}

async function uploadToBunny(path, buffer) {
  try {
    const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${path}`;
    await fetch(url, {
      method: 'PUT',
      headers: {
        AccessKey: BUNNY_STORAGE_PASSWORD,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });
    console.log(`[generate] Uploaded to Bunny: ${path}`);
  } catch (e) {
    console.error('[generate] Bunny upload error:', e);
  }
}

async function pushToGitHub(filePath, content) {
  try {
    const fileContent = JSON.stringify(content, null, 2);
    const base64 = Buffer.from(fileContent).toString('base64');
    const apiPath = 'content/articles-index.json';

    // Get current file SHA
    let sha = '';
    try {
      const getResp = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${apiPath}?ref=${GITHUB_BRANCH}`,
        { headers: { Authorization: `token ${GH_PAT}` } }
      );
      if (getResp.ok) {
        const getData = await getResp.json();
        sha = getData.sha;
      }
    } catch {}

    const body = {
      message: `[auto-gen] Add article ${new Date().toISOString().split('T')[0]}`,
      content: base64,
      branch: GITHUB_BRANCH,
    };
    if (sha) body.sha = sha;

    await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${apiPath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GH_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    console.log('[generate] Pushed to GitHub.');
  } catch (e) {
    console.error('[generate] GitHub push error:', e);
  }
}

main().catch(err => {
  console.error('[generate] Fatal error:', err);
  process.exit(1);
});
