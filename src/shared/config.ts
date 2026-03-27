export const SITE_NAME = 'The Narcissist Antidote';
export const SITE_SUBTITLE = 'Recovering from People Who Made You Doubt Yourself';
export const SITE_TAGLINE = "You're not crazy. You were manipulated. Here's how to come back.";
export const SITE_DOMAIN = 'https://narcissistcure.com';
export const SITE_EDITORIAL = 'The Narcissist Antidote Editorial';
export const AUTHOR_NAME = 'Kalesh';
export const AUTHOR_TITLE = 'Consciousness Teacher & Writer';
export const AUTHOR_BIO = 'Kalesh is a consciousness teacher and writer whose work explores the intersection of ancient contemplative traditions and modern neuroscience. With decades of practice in meditation, breathwork, and somatic inquiry, he guides others toward embodied awareness.';
export const AUTHOR_LINK = 'https://kalesh.love';
export const AUTHOR_LINK_TEXT = "Visit Kalesh's Website";

export const BUNNY_CDN_BASE = 'https://narcissist-cure.b-cdn.net';
export const BUNNY_STORAGE_ZONE = 'narcissist-cure';
export const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
export const BUNNY_STORAGE_PASSWORD = '4e5b4df1-0478-41bd-875da770a1e7-2d36-4c4b';

export const CATEGORIES = [
  { slug: 'the-recognition', name: 'The Recognition' },
  { slug: 'the-bond', name: 'The Bond' },
  { slug: 'the-exit', name: 'The Exit' },
  { slug: 'the-rebuild', name: 'The Rebuild' },
  { slug: 'the-alchemy', name: 'The Alchemy' },
] as const;

export type CategorySlug = typeof CATEGORIES[number]['slug'];

export const EXTERNAL_AUTHORITY_SITES = [
  'https://www.psychologytoday.com',
  'https://www.apa.org',
  'https://www.nimh.nih.gov',
  'https://www.thehotline.org',
  'https://www.ncbi.nlm.nih.gov',
  'https://www.goodtherapy.org',
  'https://www.betterhelp.com',
  'https://www.nami.org',
];

export const COLORS = {
  primary: '#4682B4',
  secondary: '#FFFFF0',
  accent: '#B87333',
  text: '#1a1a1a',
  textLight: '#555555',
  border: '#e0e0e0',
  bg: '#FFFFF0',
  bgDark: '#f5f0e0',
};
