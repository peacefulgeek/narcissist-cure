import React, { useEffect } from 'react';

interface Props {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  author?: string;
  jsonLd?: object | object[];
}

export default function SEOHead({ title, description, canonical, ogImage, ogType = 'website', keywords, author, jsonLd }: Props) {
  useEffect(() => {
    document.title = `${title} | The Narcissist Antidote`;

    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', description);
    setMeta('author', author || 'The Narcissist Antidote Editorial');
    if (keywords) setMeta('keywords', keywords);

    // OG tags
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('og:type', ogType, 'property');
    setMeta('og:site_name', 'The Narcissist Antidote', 'property');
    if (ogImage) setMeta('og:image', ogImage, 'property');

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (ogImage) setMeta('twitter:image', ogImage);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;

    // JSON-LD
    const existingScripts = document.querySelectorAll('script[data-jsonld]');
    existingScripts.forEach(s => s.remove());

    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach(item => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-jsonld', 'true');
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
      });
    }

    return () => {
      const scripts = document.querySelectorAll('script[data-jsonld]');
      scripts.forEach(s => s.remove());
    };
  }, [title, description, canonical, ogImage, ogType, keywords, author, jsonLd]);

  return null;
}
