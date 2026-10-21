import type { CollectionEntry } from 'astro:content';

export type FeedEntry = CollectionEntry<'feed'>;
export type FeedKind = 'quote' | 'collage' | 'media' | 'link' | 'photo' | 'take';

// The filter chips on the wall. Collages file under Photos (see filtersOf).
export const kinds: { id: FeedKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'take', label: 'Takes' },
  { id: 'media', label: 'Media' },
  { id: 'photo', label: 'Photos' },
  { id: 'quote', label: 'Quotes' },
  { id: 'link', label: 'Links' },
];

export function hasBody(entry: FeedEntry) {
  return entry.body.trim().length > 0;
}

export type Orientation = 'vertical' | 'horizontal';

// Explicit `orientation` wins; otherwise a clearly landscape picture makes the post
// horizontal (Astro reads the image's dimensions at build time).
// Clearly wider than tall (Astro reads the picture's dimensions at build time).
export function isLandscape(img: { width: number; height: number } | undefined) {
  return !!img && img.width / img.height > 1.2;
}

export function orientationOf(entry: FeedEntry): Orientation {
  if (entry.data.orientation) return entry.data.orientation;
  const kind = kindOf(entry);
  // A quote with a picture spans two columns — picture beside the words, or above
  // them when it's landscape; a collage is a pile of prints, which wants one column.
  if (kind === 'quote') return entry.data.image ? 'horizontal' : 'vertical';
  if (kind === 'collage') return 'vertical';
  if (isLandscape(entry.data.image)) return 'horizontal';
  return 'vertical';
}

// Bodies past this get clamped on the wall, with the full text on the post's own page.
const LONG_BODY = 500;

export function isLong(entry: FeedEntry) {
  return entry.body.trim().length > LONG_BODY;
}

// See the comment on the collection schema (src/content/config.ts).
export function kindOf(entry: FeedEntry): FeedKind {
  if (entry.data.quote) return 'quote';
  if (entry.data.gallery) return 'collage';
  if (entry.data.media) return 'media';
  if (entry.data.link) return 'link';
  if (entry.data.image && !hasBody(entry)) return 'photo';
  return 'take';
}

// The small label over a tile: "game · finished", "take · football", "photo"…
export function labelOf(entry: FeedEntry) {
  const kind = kindOf(entry);
  const parts: string[] = [];
  if (kind === 'media' && entry.data.media) {
    parts.push(entry.data.media.kind);
    if (entry.data.media.status) parts.push(entry.data.media.status);
  } else if (kind === 'collage' && entry.data.gallery) {
    parts.push(kind, `${entry.data.gallery.length} photos`);
  } else {
    parts.push(kind);
  }
  parts.push(...entry.data.tags);
  return parts.join(' · ');
}

// Which filter chips a tile answers to: its kind, plus Photos for a collage.
export function filtersOf(entry: FeedEntry): string[] {
  const kind = kindOf(entry);
  return kind === 'collage' ? ['collage', 'photo'] : [kind];
}

// Headings shrink as they get longer, so a one-line title is big and a paragraph-length
// quote isn't — unless the post sets `size` itself. `from` starts further down the
// scale (tile titles start one step smaller than quotes). Spelled out in full because
// Tailwind only ships classes it sees.
export type HeadingSize = 'xl' | 'lg' | 'md' | 'sm';
const SIZE_NAMES: HeadingSize[] = ['xl', 'lg', 'md', 'sm'];
const SIZE_STEPS = [60, 120, 240];
const TILE_SIZES = ['text-2xl leading-tight', 'text-xl leading-tight', 'text-lg leading-snug', 'text-base leading-snug'];
const PAGE_SIZES = ['text-3xl md:text-4xl leading-tight', 'text-2xl md:text-3xl leading-tight', 'text-xl md:text-2xl leading-snug', 'text-lg md:text-xl leading-snug'];

export function headingSize(text: string, where: 'tile' | 'page', from = 0, size?: HeadingSize) {
  let i: number;
  if (size) {
    i = SIZE_NAMES.indexOf(size);
  } else {
    const step = SIZE_STEPS.findIndex((max) => text.length <= max);
    i = Math.min(3, (step === -1 ? 3 : step) + from);
  }
  return where === 'tile' ? TILE_SIZES[i] : PAGE_SIZES[i];
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function byDateDesc(a: FeedEntry, b: FeedEntry) {
  return b.data.date.getTime() - a.data.date.getTime();
}

// A title for places that need one (RSS, the single-post page): the media title,
// the link title, else the first line of the body, else the date. Headings may hold
// line breaks (YAML `|`), which become spaces here.
export function titleOf(entry: FeedEntry) {
  return rawTitleOf(entry).replace(/\s+/g, ' ').trim();
}

function rawTitleOf(entry: FeedEntry) {
  if (entry.data.media) return entry.data.media.title;
  if (entry.data.title) return entry.data.title;
  if (entry.data.quote) return `“${entry.data.quote.text}” — ${entry.data.quote.by}`;
  if (entry.data.link) return entry.data.link.title;
  const firstLine = entry.body.trim().split('\n')[0]?.replace(/^#+\s*/, '').trim();
  if (firstLine) return firstLine.length > 80 ? firstLine.slice(0, 77) + '…' : firstLine;
  return formatDate(entry.data.date);
}
