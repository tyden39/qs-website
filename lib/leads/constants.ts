export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "closed",
] as const;

export const LEAD_SOURCES = [
  "contact",
  "newsletter",
  "datasheet",
  "inquiry",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
