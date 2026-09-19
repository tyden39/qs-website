// News data now lives in `news.json` (edited by the internal admin app). This
// module keeps the type and re-exports the JSON so consumers are unchanged.
import newsData from "./news.json";

export type News = {
  slug: string;
  title: string;
  titleEn?: string;
  date: string;
  cat: string;
  catEn?: string;
  excerpt: string;
  excerptEn?: string;
  body: string; // HTML — sanitized at crawl time, rendered with prose styles.
  bodyEn?: string; // Same HTML structure, English copy (including image alts).
  cover?: string; // Local hero image derived from the first body image.
  tags?: string[];
  tagsEn?: string[];
};

// Crawled from qstcnc.com (WordPress REST API, category "News"). Newest first.
export const news = newsData as unknown as News[];
