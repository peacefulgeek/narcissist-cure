import type { Article } from './types.js';

export function filterPublished(articles: Article[]): Article[] {
  const now = new Date();
  return articles.filter(a => new Date(a.dateISO) <= now);
}

export function sortByDate(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
}

export function getReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 250);
}

export function formatDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getCategoryArticles(articles: Article[], categorySlug: string): Article[] {
  return articles.filter(a => a.categorySlug === categorySlug);
}

export function getRelatedArticles(articles: Article[], current: Article, count: number): Article[] {
  const sameCategory = articles.filter(a => a.categorySlug === current.categorySlug && a.slug !== current.slug);
  const otherCategory = articles.filter(a => a.categorySlug !== current.categorySlug);
  const result = [...sameCategory.slice(0, Math.ceil(count / 2))];
  const remaining = count - result.length;
  result.push(...otherCategory.slice(0, remaining));
  return result.slice(0, count);
}

export function paginate<T>(items: T[], page: number, perPage: number): { items: T[]; totalPages: number; currentPage: number } {
  const totalPages = Math.ceil(items.length / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    totalPages,
    currentPage,
  };
}
