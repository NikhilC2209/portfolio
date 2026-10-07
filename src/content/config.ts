import { defineCollection, z } from 'astro:content';

// The activity feed: one markdown file per post in src/content/feed/, named by date
// (2026-10-06-anything.md). Every field is optional except the date — a post is
// whatever was filled in. The body is the post text and may be empty (a photo).
//
// The tile's kind is derived, never chosen:
//   media  has `media`                         game / film / show / book / album card
//   link   has `link`                          a link with a note under it
//   photo  has `image` and no body text        just the picture and a caption
//   take   everything else                     text
const feed = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      // Picture next to the markdown file, e.g. ./2026-10-03-skate.jpg
      image: image().optional(),
      alt: z.string().default(''),
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
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { feed };
