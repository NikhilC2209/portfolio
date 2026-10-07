import type { CollectionEntry } from 'astro:content';

export type FeedEntry = CollectionEntry<'feed'>;
export type FeedKind = 'media' | 'link' | 'photo' | 'take';

export const kinds: { id: FeedKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'take', label: 'Takes' },
  { id: 'media', label: 'Media' },
  { id: 'photo', label: 'Photos' },
  { id: 'link', label: 'Links' },
];

export function hasBody(entry: FeedEntry) {
  return entry.body.trim().length > 0;
}

// See the comment on the collection schema (src/content/config.ts).
export function kindOf(entry: FeedEntry): FeedKind {
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
  } else {
    parts.push(kind);
  }
  parts.push(...entry.data.tags);
  return parts.join(' · ');
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function byDateDesc(a: FeedEntry, b: FeedEntry) {
  return b.data.date.getTime() - a.data.date.getTime();
}

// A title for places that need one (RSS, the single-post page): the media title,
// the link title, else the first line of the body, else the date.
export function titleOf(entry: FeedEntry) {
  if (entry.data.media) return entry.data.media.title;
  if (entry.data.link) return entry.data.link.title;
  const firstLine = entry.body.trim().split('\n')[0]?.replace(/^#+\s*/, '').trim();
  if (firstLine) return firstLine.length > 80 ? firstLine.slice(0, 77) + '…' : firstLine;
  return formatDate(entry.data.date);
}
