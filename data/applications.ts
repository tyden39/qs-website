// Application data now lives in `applications.json` (edited by the internal
// admin app). Previously these rows were generated from shared workflow/spec
// constants; the JSON now holds the fully-resolved rows. This module keeps the
// types and re-exports the JSON so consumers are unchanged.
import applicationsData from "./applications.json";

export type ApplicationWorkflowStep = {
  n: string;
  label: string;
  title: string;
  desc: string;
};

export type ApplicationDeployment = {
  name: string;
  loc: string;
};

export type Application = {
  slug: string;
  machine: string;
  summary: string;
  workflow: ApplicationWorkflowStep[];
  specs: Array<{ label: string; value: string }>;
  deployments: ApplicationDeployment[];
  /** Controller model slugs (see data/products.ts) suited to this machine type. */
  products: string[];
};

export const applications = applicationsData as unknown as Application[];
