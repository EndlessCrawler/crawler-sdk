'use client';

// Small inline SVG icons (replacing the old semantic-ui <Icon>). Zero-dependency.

type IconProps = { size?: number; className?: string };

const base = (size = 16) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function CopyIcon({ content = '', size }: { content: string; size?: number }) {
  const copy = () => navigator?.clipboard?.writeText(content);
  return (
    <button type="button" className="anchor" onClick={copy} aria-label="Copy to clipboard">
      <svg {...base(size)} aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

export function LoadingIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-label="Loading">
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <path
        d="M21 12a9 9 0 1 1-6.219-8.56"
        style={{ transformOrigin: 'center', animation: 'spin 1s linear infinite' }}
      />
    </svg>
  );
}

export function LinkIcon({ url = null, size }: { url?: string | null; size?: number }) {
  const icon = (
    <svg {...base(size)} aria-hidden="true">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
  if (!url) return icon;
  return (
    <a href={url} target="_blank" rel="noreferrer" aria-label="Open URL">
      {icon}
    </a>
  );
}
