import { defineCollection, z } from 'astro:content';

// The activity feed: one markdown file per post in src/content/feed/, named by date
// (2026-10-06-anything.md). Every field is optional except the date — a post is
// whatever was filled in. The body is the post text and may be empty (a photo).
//
// The tile's kind is derived, never chosen:
//   quote    has `quote`                       someone else's words, picture beside them
//   collage  has `gallery` (2+ pictures)       a pile of prints that shuffles on hover
//   media    has `media`                       game / film / show / book / album card
//   link     has `link`                        a link with a note under it
//   photo    has `image` and no body text      just the picture and a caption
//   take     everything else                   text
const feed = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      // Optional heading, mainly so a text-only tile has an anchor. Media posts take
      // theirs from media.title instead.
      title: z.string().optional(),
      // Picture next to the markdown file, e.g. ./2026-10-03-skate.jpg
      image: image().optional(),
      // How the tile sits on the wall: a horizontal post spans two columns with the
      // picture beside the text. Left out, it follows the picture's shape — landscape
      // → horizontal, anything else → vertical (src/components/feed/feed.ts).
      orientation: z.enum(['vertical', 'horizontal']).optional(),
      alt: z.string().default(''),
      // Size of the heading (title, media title, quote, or a one-line take). Left out,
      // it follows the text's length: short → xl, paragraph-length → sm
      // (headingSize in src/components/feed/feed.ts).
      size: z.enum(['xl', 'lg', 'md', 'sm']).optional(),
      // Caption under a photo; ignored when the post has body text
      caption: z.string().optional(),
      media: z
        .object({
          title: z.string(),
          kind: z.enum(['game', 'film', 'show', 'book', 'album']),
          // playing, finished, dropped, rewatch, reading… free text
          status: z.string().optional(),
          // 0–5 in half steps
          rating: z.number().min(0).max(5).multipleOf(0.5).optional(),
          // Platform, runtime, hours — shown after the rating, e.g. "PC · 38 h"
          meta: z.string().optional(),
        })
        .optional(),
      link: z
        .object({
          url: z.string().url(),
          title: z.string(),
        })
        .optional(),
      // Several pictures in one post (a trip, a match, a day out). The tile shows them
      // as a pile of prints; the post page shows all of them with a lightbox.
      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string().default(''),
            // Short line under the print, e.g. "89' · the winner"
            caption: z.string().optional(),
          }),
        )
        .min(2)
        .optional(),
      // Someone else's words. `image` (if any) sits beside the quote; the body is
      // your own comment under it.
      quote: z
        .object({
          text: z.string(),
          // Who said it — a person or a character
          by: z.string(),
          // Where: the film, book, game, episode, year…
          source: z.string().optional(),
        })
        .optional(),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { feed };
