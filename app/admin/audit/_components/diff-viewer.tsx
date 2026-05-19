"use client";

interface DiffViewerProps {
  diff: unknown;
  entityId?: string | null;
}

export function DiffViewer({ diff, entityId }: DiffViewerProps) {
  if (diff == null) {
    return (
      <span className="font-mono text-[11px] text-muted">
        {entityId ?? "—"}
      </span>
    );
  }

  const json = JSON.stringify(diff, null, 2);

  return (
    <details className="group">
      <summary className="cursor-pointer font-mono text-[11px] text-gold-1 hover:text-ink select-none list-none flex items-center gap-1">
        <span className="group-open:hidden">▶</span>
        <span className="hidden group-open:inline">▼</span>
        <span>diff</span>
        {entityId ? (
          <span className="text-muted ml-1">({entityId})</span>
        ) : null}
      </summary>
      <pre className="mt-2 p-3 bg-paper border border-line text-[11px] font-mono text-ink overflow-x-auto whitespace-pre-wrap break-all max-h-48 leading-relaxed">
        {json}
      </pre>
    </details>
  );
}
