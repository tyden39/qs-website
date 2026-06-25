"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 up to `to` once it scrolls into view. Renders the final value on the
 * server / first paint so no-JS and crawlers see the real number; only ramps after
 * hydration. With `repeatEvery` (ms) it re-runs the ramp periodically while on screen,
 * so the figures stay alive. Honors prefers-reduced-motion. `pad` zero-pads the integer.
 */
export default function CountUp({
  to,
  suffix = "",
  pad = 0,
  duration = 1600,
  repeatEvery = 0,
  className,
}: {
  to: number;
  suffix?: string;
  pad?: number;
  duration?: number;
  repeatEvery?: number;
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

    let raf = 0;
    let interval = 0;
    let visible = false;
    let hasRun = false;

    const ramp = () => {
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible && !hasRun) {
          hasRun = true;
          setVal(0);
          ramp();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    if (repeatEvery > 0) {
      interval = window.setInterval(() => {
        if (visible) ramp();
      }, repeatEvery);
    }

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      if (interval) clearInterval(interval);
    };
  }, [to, duration, repeatEvery]);

  const text = pad > 0 ? String(val).padStart(pad, "0") : String(val);
  return (
    <span ref={ref} className={className}>
      {text}
      {suffix}
    </span>
  );
}
