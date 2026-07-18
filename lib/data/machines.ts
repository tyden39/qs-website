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
  tagline: string;
  image: MachinePhoto;
  /** Hero slideshow shots (CNC template). Empty when the machine ships none. */
  heroShots: MachineHeroShot[];
  specs: MachineSpec[];
  /** Leading spec rows for the list panel / card preview. */
  highlights: MachineSpec[];
  features: MachineFeatureView[];
  /** Line-station template extras (automation/inspection). Empty when unused. */
  line: MachineLineStepView[];
  control: MachineControlView | null;
  gallery: MachineShotView[];
  applications: string[];
};

/** Localize thousands separators: integer runs of 4+ digits are grouped per locale. */
function formatSpecs(specs: MachineSpec[], nf: Intl.NumberFormat): MachineSpec[] {
  return specs.map((s) => ({
    k: s.k,
    v: s.v.replace(/\d{4,}/g, (d) => nf.format(Number(d))),
  }));
}

function toView(m: Machine, locale: Locale): MachineView {
  const en = locale === "en";
  const nf = new Intl.NumberFormat(en ? "en-US" : "vi-VN");
  const specs = formatSpecs(m.specs, nf);
  return {
    slug: m.slug,
    model: m.model,
    category: m.category,
    axes: m.axes,
    controller: m.controller ?? null,
    controllerSlug: m.controllerSlug ?? null,
    tagline: en ? m.taglineEn ?? m.tagline : m.tagline,
    image: m.image,
    heroShots: m.heroShots ?? [],
    specs,
    highlights: specs.slice(0, HIGHLIGHT_COUNT),
    features: m.features.map((f) => ({
      title: en ? f.titleEn ?? f.title : f.title,
      desc: en ? f.descEn ?? f.desc : f.desc,
      img: f.img,
    })),
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
