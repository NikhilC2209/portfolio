import rss from '@astrojs/rss';
import sanitizeHtml from 'sanitize-html';
import { useStoryblokApi, renderRichText } from '@storyblok/astro';

const sections = [
    { starts_with: 'blog/', content_type: 'blogPost' },
    { starts_with: 'writeups/', content_type: 'writeupPost' },
    { starts_with: 'thoughts/', content_type: 'thoughtPost' },
];

// Storyblok datetime fields come back as "2024-05-12 00:00", which is not ISO-8601.
// Fall back to the publish timestamp when the field is empty or unparseable.
function pubDateOf(story) {
    const candidates = [story.content?.date, story.first_published_at, story.published_at, story.created_at];

    for (const raw of candidates) {
        if (!raw) continue;
        const date = new Date(typeof raw === 'string' ? raw.replace(' ', 'T') : raw);
        if (!Number.isNaN(date.getTime())) return date;
    }

    return new Date();
}

export async function GET(context) {
    const storyblokApi = useStoryblokApi();

    const responses = await Promise.all(
        sections.map((section) =>
            storyblokApi.get('cdn/stories/', {
                version: import.meta.env.DEV ? 'draft' : 'published',
                is_startpage: 0,
                per_page: 100,
                ...section,
            })
        )
    );

    const items = responses
        .flatMap(({ data }) => data.stories ?? [])
        .map((story) => ({
            title: story.content?.title ?? story.name,
            description: story.content?.description ?? '',
            link: `/${story.full_slug}/`,
            pubDate: pubDateOf(story),
            categories: story.tag_list ?? [],
            content: sanitizeHtml(story.content?.content ? renderRichText(story.content.content) : '', {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
                allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    img: ['src', 'alt'],
                },
            }),
        }))
        .sort((a, b) => b.pubDate - a.pubDate);

    return rss({
        title: 'c0smos.dev',
        description: 'Blog posts, CTF writeups, and thoughts',
        site: context.site,
        items,
        customData: '<language>en-us</language>',
    });
}
