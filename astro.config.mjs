import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import storyblok from '@storyblok/astro';
import { loadEnv } from 'vite';
import react from "@astrojs/react";
import robotsTxt from "astro-robots-txt";
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';

import basicSsl from '@vitejs/plugin-basic-ssl'

const env = loadEnv("", process.cwd(), 'STORYBLOK');

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({

  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://shiki.style/themes
      theme: 'dracula',
      // Alternatively, provide multiple themes
      // https://shiki.style/guide/dual-themes
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://shiki.style/languages
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
      // Add custom transformers: https://shiki.style/guide/transformers
      // Find common transformers: https://shiki.style/packages/transformers
      transformers: [],
    },
  },

  // markdown: {
  //   // Can be 'shiki' (default), 'prism' or false to disable highlighting
  //   syntaxHighlight: 'prism',
  // },

  vite: {
    plugins: [basicSsl()],
    server: {
      https: true,
    },
  },
  markdown: {
    rehypePlugins: [rehypeAccessibleEmojis],
  },
  site: 'https://astro-portfolio-template.pages.dev',
  integrations: [
      storyblok({
        accessToken: env.STORYBLOK_TOKEN,
        components: {
          codeBlock: 'storyblok/CodeBlock', 
          blogPost: 'storyblok/BlogPost',
          blogPostList: 'storyblok/BlogPostList',
          page: 'storyblok/Page',
          feature: "storyblok/Feature",
          grid: "storyblok/Grid",
          teaser: "storyblok/Teaser",
          // Add your components here
      },
      apiOptions: {
        // Choose your Storyblok space region
        region: 'us', // optional,  or 'eu' (default)
      },  
    }),
      tailwind(), 
      react(), 
      robotsTxt(), 
      sitemap()
    ]
});