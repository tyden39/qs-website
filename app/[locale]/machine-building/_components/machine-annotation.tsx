import Image from "next/image";
import { LightboxTrigger } from "@/components/media/image-lightbox";

/**
 * Machine photo framed like an engineering figure: a blueprint scan beam sweeps
 * the render and corner registration ticks echo the showreel screen.
 * Pure CSS — the scan beam respects prefers-reduced-motion.
 */
export default function MachineAnnotation({
  img,
  alt,
  zoomLabel,
}: {
  img: string;
  alt: string;
  zoomLabel: string;
}) {
  return (
    <div className="relative aspect-[1672/941] overflow-hidden border border-[#2a2620] bg-ink-2">
      <Image
        src={img}
        alt={alt}
        fill
        priority
        sizes="(max-width:1024px) 100vw, 60vw"
        className="object-cover"
      />
      <LightboxTrigger
        group={[{ src: img, alt }]}
        index={0}
        ariaLabel={zoomLabel}
        className="absolute inset-0 z-[6]"
      />
      {/* blueprint scan beam reading the machine */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-[2px] qs-scan" aria-hidden="true"></div>
      {/* registration frame — same corner ticks as the showreel screen */}
      <div className="pointer-events-none absolute inset-3 border border-white/10" aria-hidden="true">
        <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t border-l border-gold-2"></span>
        <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t border-r border-gold-2"></span>
        <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b border-l border-gold-2"></span>
        <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b border-r border-gold-2"></span>
      </div>
    </div>
  );
}
