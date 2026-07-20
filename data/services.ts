// Service data now lives in `services.json` (edited by the internal admin app).
// This module keeps the types and re-exports the JSON so consumers are unchanged.
import servicesData from "./services.json";

export type ServicePackage = {
  name: string;
  title: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

export type ServiceStep = {
  num: number;
  day: string;
  title: string;
  desc: string;
  duration: string;
  active?: boolean;
};

export type ServiceInclude = {
  has: boolean;
  name: string;
  note: string;
  tag: string;
};

export type ServiceFaq = { q: string; a: string };

export type Service = {
  slug: string;
  number: string;
  name: string;
  hero: { line1: string; emphasis: string; line2: string };
  lede: string;
  stats: [string, string][];
  process: ServiceStep[];
  includesIntro: string[];
  includes: ServiceInclude[];
  packages: ServicePackage[];
  faqs: ServiceFaq[];
  cta: { title: string; desc: string };
};

export const services = servicesData as unknown as Service[];
