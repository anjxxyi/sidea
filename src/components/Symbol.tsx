import { lettering as L } from '@/lib/lettering';

const sPath = L.sA
  .map((c) => c.reduce((d, v, i) => d + (i % 2 ? ` ${v}` : `${i ? 'L' : 'M'}${v}`), '') + 'Z')
  .join('');

/** The (s) symbol — brackets around the master s. */
export function Symbol({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-6 22 112 100" aria-hidden="true">
      <path d={L.static['('].d} transform="translate(0 27.32)" style={{ fill: 'var(--fg)' }} />
      <path d={sPath} transform="translate(22 0)" style={{ fill: 'var(--pt)' }} />
      <path d={L.static[')'].d} transform="translate(84 27.32)" style={{ fill: 'var(--fg)' }} />
    </svg>
  );
}
