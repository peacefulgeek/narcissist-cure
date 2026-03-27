export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  dateISO: string;
  dateHuman: string;
  readingTime: number;
  heroImage: string;
  heroAlt: string;
  ogImage: string;
  metaDescription: string;
  metaKeywords: string;
  bodyHtml: string;
  faqs: FAQ[];
  backlinkType: 'kalesh' | 'external' | 'internal';
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Quiz {
  slug: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  results: QuizResult[];
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  text: string;
  scores: Record<string, number>;
}

export interface QuizResult {
  id: string;
  title: string;
  description: string;
  articleSlugs: string[];
}
