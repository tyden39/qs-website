import Image from "next/image";
import { LightboxTrigger, type LightboxShot } from "@/components/media/image-lightbox";
import type { SeriesFigureView } from "@/lib/data/series";

/**
 * Datasheet plates from the manufacturer — spec tables whose text is baked into
 * the image, so they cannot be rendered as HTML the way `SeriesModelTable` does.
 *
 * The plates are tall (roughly 900×1200) and unreadable at grid scale, so each
 * tile shows the top of the sheet as a lead-in and defers the actual reading to
 * the lightbox. The whole tile is the zoom target rather than a separate button,
 * since there is nothing else on it to click.
 */
/**
 * The manufacturer's model-code decode diagram, shown in place of the prose
 * breakdown where one exists. It is drawn wide rather than tall, so unlike the
 * spec plates it is legible inline and only needs the lightbox for detail.
 */
export function SeriesNamingFigure({
  figure,
  zoomLabel,
}: {
  figure: SeriesFigureView;
  zoomLabel: string;
}) {
  return (
    <div className="border border-line bg-white p-4 sm:p-6">
      <LightboxTrigger
        group={[{ src: figure.src, w: figure.w, h: figure.h, alt: figure.alt }]}
        index={0}
        ariaLabel={`${zoomLabel} — ${figure.alt}`}
        className="block w-full"
      >
        <Image
          src={figure.src}
          alt={figure.alt}
          width={figure.w}
          height={figure.h}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="w-full h-auto"
        />
      </LightboxTrigger>
    </div>
  );
}

/**
 * A vertical strip of full-width images — the manufacturer's 产品介绍 / 可选配件
 * tab galleries, which are wide promo graphics meant to be read top-to-bottom
 * rather than the tall, croppable spec plates `SeriesFigures` handles. Each
 * image is its own zoom target into a shared lightbox group.
 */
export function SeriesImageStrip({
  images,
  zoomLabel,
}: {
  images: SeriesFigureView[];
  zoomLabel: string;
}) {
  const shots: LightboxShot[] = images.map((im) => ({
    src: im.src,
    w: im.w,
    h: im.h,
    alt: im.alt,
  }));

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {images.map((im, i) => (
        <LightboxTrigger
          key={im.src}
          group={shots}
          index={i}
          ariaLabel={`${zoomLabel} — ${im.alt}`}
          className="block w-full border border-line bg-white"
        >
          <Image
            src={im.src}
            alt={im.alt}
            width={im.w}
            height={im.h}
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="w-full h-auto"
          />
        </LightboxTrigger>
      ))}
    </div>
  );
}

export function SeriesFigures({
  figures,
  eyebrow,
  heading,
  zoomLabel,
}: {
  figures: SeriesFigureView[];
  eyebrow: string;
  heading: string;
  zoomLabel: string;
}) {
  const shots: LightboxShot[] = figures.map((f) => ({
    src: f.src,
    w: f.w,
    h: f.h,
    alt: f.alt,
  }));

  return (
    <div>
      <div className="qs-eyebrow mb-2">{eyebrow}</div>
      <h2 className="qs-h2 mb-8">{heading}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {figures.map((figure, i) => (
          <figure key={figure.src} className="m-0 border border-line bg-white">
            <div className="relative h-[260px] sm:h-[300px] overflow-hidden bg-white">
              <Image
                src={figure.src}
                alt={figure.alt}
                width={figure.w}
                height={figure.h}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="absolute inset-0 w-full h-auto object-cover object-top"
              />
              <LightboxTrigger
                group={shots}
                index={i}
                ariaLabel={`${zoomLabel} — ${figure.alt}`}
                className="absolute inset-0 z-[2]"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16
                           bg-gradient-to-t from-white to-transparent"
                aria-hidden="true"
              />
            </div>
            <figcaption
              className="px-4 py-3 border-t border-line font-mono text-label
                         tracking-[.14em] uppercase text-muted"
            >
              {figure.alt}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
