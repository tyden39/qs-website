"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 up to `to` once it scrolls into view (one-shot). Renders the final value
 * on the server / first paint so no-JS and crawlers see the real number; only ramps after
 * hydration. Honors prefers-reduced-motion. `pad` zero-pads the integer (e.g. 6 → "06").
 */
export default function CountUp({
  to,
  suffix = "",
  pad = 0,
  duration = 1600,
  className,
}: {
  to: number;
  suffix?: string;
  pad?: number;
  duration?: number;
  className?: string;
}) {
  const [val, setVal] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    setVal(0);
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          io.disconnect();
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  const text = pad > 0 ? String(val).padStart(pad, "0") : String(val);
  return (
    <span ref={ref} className={className}>
      {text}
      {suffix}
    </span>
  );
}
