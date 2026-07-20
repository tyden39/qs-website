import {
  machines,
  HIGHLIGHT_COUNT,
  type Machine,
  type MachineCategory,
  type MachineSpec,
  type MachinePhoto,
  type MachineHeroShot,
} from "@/data/machines";
import type { Locale } from "@/lib/i18n/config";

export type { MachineCategory, MachineSpec, MachinePhoto, MachineHeroShot };

export type MachineFeatureView = { title: string; desc: string; img?: string };
export type MachineUseCaseView = { icon: string; title: string; desc: string };
export type MachineCapabilityView = { img?: string; caption: string };
export type MachineLineStepView = { title: string; desc: string };
export type MachineControlView = { system: string; points: string[] };
export type MachineShotView = { src: string; caption: string };

export type MachineView = {
  slug: string;
  model: string;
  category: MachineCategory;
  axes: number;
  controller: string | null;
  controllerSlug: string | null;
  /** Neutral English product line under the model on the datasheet hero. */
  subtitle: string | null;
  tagline: string;
  image: MachinePhoto;
  thumbnail: MachinePhoto;
  /** Hero slideshow shots (CNC template). Empty when the machine ships none. */
  heroShots: MachineHeroShot[];
  specs: MachineSpec[];
  /** Leading spec rows for the list panel / card preview. */
  highlights: MachineSpec[];
  features: MachineFeatureView[];
  /**
   * CNC datasheet sections. Empty arrays are expected — the template renders an
   * "updating" placeholder in their slot so every machine keeps the same shape.
   */
  useCases: MachineUseCaseView[];
  capabilities: MachineCapabilityView[];
  standardEquip: string[];
  optionalEquip: string[];
  /** Line-station template extras (automation/inspection). Empty when unused. */
  line: MachineLineStepView[];
  control: MachineControlView | null;
  gallery: MachineShotView[];
  applications: string[];
};

/** Localize prose values and thousands separators for the requested locale. */
function formatSpecs(specs: MachineSpec[], nf: Intl.NumberFormat, en: boolean): MachineSpec[] {
  return specs.map((s) => ({
    k: s.k,
    v: (en ? s.vEn ?? s.v : s.v).replace(/\d{4,}/g, (d) => nf.format(Number(d))),
  }));
}

function toView(m: Machine, locale: Locale): MachineView {
  const en = locale === "en";
  const nf = new Intl.NumberFormat(en ? "en-US" : "vi-VN");
  const specs = formatSpecs(m.specs, nf, en);
  return {
    slug: m.slug,
    model: m.model,
    category: m.category,
    axes: m.axes,
    controller: m.controller ?? null,
    controllerSlug: m.controllerSlug ?? null,
    subtitle: m.subtitle ?? null,
    tagline: en ? m.taglineEn ?? m.tagline : m.tagline,
    image: m.image,
    thumbnail: m.thumbnail ?? m.image,
    heroShots: m.heroShots ?? [],
    specs,
    highlights: specs.slice(0, HIGHLIGHT_COUNT),
    features: m.features.map((f) => ({
      title: en ? f.titleEn ?? f.title : f.title,
      desc: en ? f.descEn ?? f.desc : f.desc,
      img: f.img,
    })),
    useCases: (m.useCases ?? []).map((u) => ({
      icon: u.icon,
      title: en ? u.titleEn ?? u.title : u.title,
      desc: en ? u.descEn ?? u.desc : u.desc,
    })),
    capabilities: (m.capabilities ?? []).map((c) => ({
      img: c.img,
      caption: en ? c.captionEn ?? c.caption : c.caption,
    })),
    standardEquip: (m.standardEquip ?? []).map((e) => (en ? e.labelEn ?? e.label : e.label)),
    optionalEquip: (m.optionalEquip ?? []).map((e) => (en ? e.labelEn ?? e.label : e.label)),
    line: (m.line ?? []).map((s) => ({
      title: en ? s.titleEn ?? s.title : s.title,
      desc: en ? s.descEn ?? s.desc : s.desc,
    })),
    control: m.control
      ? {
          system: m.control.system,
          points: m.control.points.map((p) => (en ? p.labelEn ?? p.label : p.label)),
        }
      : null,
    gallery: (m.gallery ?? []).map((g) => ({
      src: g.src,
      caption: en ? g.captionEn ?? g.caption : g.caption,
    })),
    applications: (m.applications ?? []).map((a) => (en ? a.labelEn ?? a.label : a.label)),
  };
}

export function getMachines(locale: Locale): MachineView[] {
  return machines.map((m) => toView(m, locale));
}

export function getMachineBySlug(slug: string, locale: Locale): MachineView | null {
  const m = machines.find((x) => x.slug === slug);
  return m ? toView(m, locale) : null;
}

export function getMachineSlugs(): string[] {
  return machines.map((m) => m.slug);
}
