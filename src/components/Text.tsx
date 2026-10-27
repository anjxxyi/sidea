import { useEffect, useRef } from 'react';
import type { Copy } from '@/content/copy';
import { usePrefs } from '@/context/PrefsContext';
import { scramble } from '@/lib/scramble';

type TextProps = { copy: Copy; as?: 'span' | 'p' | 'h2' | 'h3'; className?: string };

/** Localised text that briefly scrambles when the language changes. */
export function Text({ copy, as: Tag = 'span', className }: TextProps) {
  const { lang, motion } = usePrefs();
  const ref = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current || !motion) {
      first.current = false;
      el.textContent = copy[lang];
      return;
    }
    return scramble(el, copy[lang]);
  }, [lang, motion, copy]);

  return (
    <Tag ref={ref as never} className={className} style={{ whiteSpace: 'pre-line' }}>
      {copy.en}
    </Tag>
  );
}
