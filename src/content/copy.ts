import type { BracketWord } from '@/lib/lettering';
import type { Lang } from '@/lib/runtime';

/**
 * All visible copy. English is the default; Korean is a loose translation.
 * Keep it plain and short. Use \n for a line break.
 */
export type Copy = Record<Lang, string>;

export const copy = {
  tagline: { en: 'Ideas, on the side.', kr: 'Ideas, on the side.' },
  scroll: { en: '( scroll )', kr: '( scroll )' },
  aboutLabel: { en: 'About sidea', kr: 'About sidea' },
  statement: { en: 'Side by side.\nIdea by idea.', kr: '나란히, 하나씩.' },
  programsLabel: { en: 'On the side', kr: 'On the side' },
  programsTitle: { en: 'What we do on the side', kr: '우리가 옆에서 하는 일' },
  soon: { en: 'Soon', kr: 'Soon' },
  nowLabel: { en: 'Now', kr: 'Now' },
  nowTitle: { en: 'Project 01', kr: 'Project 01' },
  nowStatus: { en: 'In progress · since Nov 2026', kr: '진행 중 · 2026년 11월부터' },
  nowLede: {
    en: 'Just one project for now.\nMore coming soon',
    kr: '지금은 프로젝트 하나뿐이에요.\n곧 더 보여드릴게요',
  },
  notYet: { en: 'Not ready yet', kr: '아직 준비 중이에요' },
  copied: { en: 'Copied!', kr: '복사했어요' },
  rights: { en: '© 2026 Sidea', kr: '© 2026 Sidea' },
} satisfies Record<string, Copy>;

export const programs: { word: BracketWord; text: Copy }[] = [
  { word: 'fter', text: { en: 'After work', kr: '퇴근 후' } },
  { word: 'ngle', text: { en: 'How we see things', kr: '우리의 시선' } },
  { word: 'rchive', text: { en: 'Looking back on our work', kr: '작업 돌아보기' } },
  { word: 'telier', text: { en: 'Our workspace', kr: '우리 작업실' } },
];

/** Contact address comes from the environment so it stays out of the repository. */
export const contactEmail: string = import.meta.env.VITE_CONTACT_EMAIL ?? '';
