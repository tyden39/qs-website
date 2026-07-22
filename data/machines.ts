/**
 * CNC machine catalogue (MACHINE MANUFACTURING line). Data now lives in
 * `machines.json` (edited by the internal admin app); this module keeps the
 * TypeScript types and re-exports the JSON so consumers are unchanged.
 *
 * Spec rows reference a label key (`k`) resolved from the `cnc.machines.labels`
 * i18n dictionary so the same row renders in both languages. `v` is Vietnamese
 * primary content; `vEn` is only needed when the value itself contains prose.
 */
import machinesData from "./machines.json";

export type MachineCategory = "milling" | "router" | "jewelry" | "automation" | "inspection";

/**
 * Sub-type the machine is listed under on /products/machines. The five
 * datasheet categories are a finer cut than the catalogue sells against, so
 * every milling/router/jewelry machine collapses into one "CNC" type while
 * automation and inspection stay on their own.
 */
export type MachineType = "cnc" | "automation" | "inspection";

export const MACHINE_TYPE: Record<MachineCategory, MachineType> = {
  milling: "cnc",
  router: "cnc",
  jewelry: "cnc",
  automation: "automation",
  inspection: "inspection",
};

export type MachinePhoto = { src: string; w: number; h: number };

/** A spec row: `k` is an i18n label key; `v` is vi primary, `vEn` optional EN. */
export type MachineSpec = { k: string; v: string; vEn?: string };

/**
 * A callout box (the highlighted feature blocks on the datasheet pages). `img`,
 * when present, is a detail photo of that feature (spindle, controller, table…)
 * cropped from the machine's datasheet — the view renders it above the text.
 */
export type MachineFeature = {
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
  img?: string;
};

/**
 * One station in the line-flow strip on the automation/inspection detail
 * template: what enters, what the machine does, what leaves. Localized prose.
 */
export type MachineLineStep = { title: string; titleEn?: string; desc: string; descEn?: string };

/** The machine's operator control system (HMI + safety chrome), shown as a
 *  control-panel card in place of the CNC controller card. */
export type MachineControl = {
  /** Control system as labelled on the machine, e.g. "Siemens SIMATIC HMI". */
  system: string;
  /** Operator-facing control points (touchscreen, e-stop, andon…). */
  points: { label: string; labelEn?: string }[];
};

/** An in-context photo for the gallery strip, with a localized caption. */
export type MachineShot = { src: string; caption: string; captionEn?: string };

/**
 * A studio shot for the CNC hero slideshow. `kind` is an i18n key resolved from
 * `cnc.machines.detail.shots.*` (front, back, left, controller…) so the caption
 * localizes; `src`/`w`/`h` point at the real photo under `/img/machines/gallery`.
 */
export type MachineHeroShot = { src: string; w: number; h: number; kind: string };

/** An industry this machine is deployed in (chip cloud). */
export type MachineApplication = { label: string; labelEn?: string };

/**
 * A "suitable applications" card on the CNC datasheet template. `icon` is a key
 * resolved to a Lucide icon by the view (see `USE_CASE_ICON`); prose localized.
 */
export type MachineUseCase = {
  icon: string;
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
};

/**
 * A machining-capability thumbnail (a representative workpiece). `img` is
 * omitted while no photo has been shot — the view then draws a blueprint plate
 * placeholder in its slot.
 */
export type MachineCapability = { img?: string; caption: string; captionEn?: string };

/** One line in the standard / optional configuration lists. */
export type MachineEquip = { label: string; labelEn?: string };

export type Machine = {
  slug: string;
  model: string;
  category: MachineCategory;
  /** Controlled motion axes; 0 for non-CNC automation/inspection lines. */
  axes: number;
  /**
   * Controller name as printed on the datasheet, e.g. "QS Astro 10i". Omitted
   * on automation/inspection machines that don't ship a QS controller.
   */
  controller?: string;
  /** Slug of the matching controller in the products catalogue, if any. */
  controllerSlug?: string;
  /**
   * Neutral English product line printed under the model on the datasheet hero
   * (e.g. "Compact CNC Machining Center"). Not localized — it reads as a model
   * designation in both languages.
   */
  subtitle?: string;
  /** Short positioning line — vi primary, en override. */
  tagline: string;
  taglineEn?: string;
  /** Full-size representative image used by metadata and detail fallbacks. */
  image: MachinePhoto;
  /** Optional smaller derivative for catalogue and gallery thumbnails. */
  thumbnail?: MachinePhoto;
  /**
   * Studio shots for the hero slideshow (CNC datasheet template). When present,
   * the detail hero cross-fades through these instead of the single `image`.
   */
  heroShots?: MachineHeroShot[];
  /** Ordered spec rows; the machine list panel shows the first `HIGHLIGHT_COUNT`. */
  specs: MachineSpec[];
  /** Datasheet callout boxes shown on the detail page. */
  features: MachineFeature[];
  /**
   * CNC datasheet template sections. Each is optional: the detail page always
   * renders the section so every machine has the same shape, filling the gaps
   * with an "updating" placeholder until the datasheet content lands.
   */
  useCases?: MachineUseCase[];
  capabilities?: MachineCapability[];
  standardEquip?: MachineEquip[];
  optionalEquip?: MachineEquip[];
  /**
   * Line-station template extras (automation/inspection machines). When present,
   * the detail page renders the light "line station" layout instead of the dark
   * CNC datasheet layout: a process line-flow, an in-context gallery, a control
   * panel card and an applications chip cloud.
   */
  line?: MachineLineStep[];
  control?: MachineControl;
  gallery?: MachineShot[];
  applications?: MachineApplication[];
};

/** How many leading spec rows surface in the list panel / card preview. */
export const HIGHLIGHT_COUNT = 6;

export const machines = machinesData as unknown as Machine[];
