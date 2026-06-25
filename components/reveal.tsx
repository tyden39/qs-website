"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Stagger delay in milliseconds before the reveal transition runs. */
  delay?: number;
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
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
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
