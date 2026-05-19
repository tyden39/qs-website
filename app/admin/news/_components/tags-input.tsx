"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
};

export function TagsInput({ value, onChange, suggestions }: Props) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s),
  );

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
    setOpen(false);
  }

  function removeTag(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 border border-line bg-white rounded focus-within:ring-1 focus-within:ring-ink">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-paper px-2 py-0.5 text-xs font-mono border border-line rounded"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted hover:text-ink ml-0.5"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? "Add tags…" : ""}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-line shadow-md max-h-48 overflow-auto">
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                className="w-full text-left px-3 py-2 text-sm font-mono hover:bg-paper"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
