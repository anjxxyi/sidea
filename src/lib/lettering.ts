import raw from '@/data/lettering.json';

/**
 * Outline data for the sidea lettering (exported from the Figma Lettering Lab).
 * - sA/sB, aA/aB: resampled contours for the s and a weight transfer (rest → open)
 * - static: hand-drawn glyphs (i, d, e, brackets) placed in lockup space
 * - W: bracket words, built from the lettering glyphs
 * Coordinates share one space where the wordmark's s is 51.7 units tall.
 */
type Placed = { d: string; x: number; y: number };
type WordPart = Placed & { font?: number };
type Lettering = {
  sA: number[][];
  sB: number[][];
  aA: number[][];
  aB: number[][];
  static: Record<'i' | 'd' | 'e' | '(' | ')', Placed>;
  W: Record<string, { parts: WordPart[]; close: number }>;
  delta: number;
  brW: [number, number];
  brY: number;
};

export const lettering = raw as unknown as Lettering;

export type BracketWord = 'fter' | 'ngle' | 'rchive' | 'telier' | 'rtifact' | 'bout' | 'board';

/** x of the opening bracket in the rest lockup, and its baseline offset. */
export const BRACKET_X = 233.68;
export const BRACKET_Y = 27.32;
/** Gap between the a and the opening bracket. */
export const A_GAP = 7.17;

/** Inner width a word needs between the brackets. */
export const wordSpan = (w: BracketWord) => lettering.W[w].close - BRACKET_X;

/** Width of a full lockup (sidea + bracket word), for sizing viewBoxes. */
export const lockupWidth = (w: BracketWord) => lettering.W[w].close + 20 + lettering.delta;

/** Interpolates between two contour sets and returns an SVG path plus its right edge. */
export function morph(A: number[][], B: number[][], t: number, dx: number) {
  let d = '';
  let xmax = -Infinity;
  for (let c = 0; c < A.length; c++) {
    const a = A[c];
    const b = B[c];
    for (let i = 0; i < a.length; i += 2) {
      const x = a[i] + (b[i] - a[i]) * t + dx;
      const y = a[i + 1] + (b[i + 1] - a[i + 1]) * t;
      if (x > xmax) xmax = x;
      d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += 'Z';
  }
  return { d, xmax };
}
