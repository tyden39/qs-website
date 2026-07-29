// Application data now lives in `applications.json` (edited by the internal
// admin app). Previously these rows were generated from shared workflow/spec
// constants; the JSON now holds the fully-resolved rows. This module keeps the
// types and re-exports the JSON so consumers are unchanged.
import applicationsData from "./applications.json";

/**
 * A machine-type case study. The detail page renders its workflow, spec table
 * and deployment list from `application.detailPage` in the message catalogue —
 * one shared block for every machine type — so those never lived here; this row
 * carries the per-machine identity, the summary behind the metadata/JSON-LD,
 * and the controller pairing.
 */
export type Application = {
  slug: string;
  machine: string;
  /** English machine name; matches `application.index.items[].machine` in messages. */
  machineEn?: string;
  summary: string;
  summaryEn?: string;
  /** Controller model slugs (see data/products.ts) suited to this machine type. */
  products: string[];
};

export const applications = applicationsData as unknown as Application[];
