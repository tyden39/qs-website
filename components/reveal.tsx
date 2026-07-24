"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Stagger delay in milliseconds before the reveal transition runs. */
  delay?: number;
  /**
   * Reveal as soon as the top edge enters the viewport instead of waiting for
   * 15% of the block to show. Use for tall blocks (e.g. a full catalogue list)
   * where 15% of the element's own height only intersects after a deep scroll,
   * leaving the block hidden long enough to read as empty.
   */
  eager?: boolean;
};

/**
 * Reveals its children on scroll into view. The element always renders with the
 * `qs-reveal` class so server and client markup match; the hidden→visible state is
 * driven entirely by CSS (see app/globals.css). One-shot: the observer disconnects
 * after the first reveal. `prefers-reduced-motion` is handled in CSS, and a
 * <noscript> guard in the root layout keeps content visible without JS.
 */
export default function Reveal({
  children,
  as,
  className,
  delay = 0,
  eager = false,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already on screen at mount (e.g. a list sitting just below the hero):
    // reveal straight away so it animates on load instead of waiting for a
    // scroll. `threshold: 0.15` can't be met by a tall block that's only
    // peeking in, which otherwise leaves it stuck hidden until the user scrolls.
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.disconnect();
          }
        }
      },
      // Eager blocks fire the moment their top edge crosses into view; the
      // default nudges reveal to when ~15% of a normal-height block shows.
      eager
        ? { threshold: 0, rootMargin: "0px" }
        : { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className ? `qs-reveal ${className}` : "qs-reveal"}
      style={delay ? { ["--reveal-delay" as string]: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
