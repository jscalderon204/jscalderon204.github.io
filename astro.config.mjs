// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `site` is the GitHub Pages user-site root (used for sitemap + canonical/OG URLs).
// Served at the domain root, so no `base` path is needed; root-absolute links work as-is.
export default defineConfig({
  site: 'https://jscalderon204.github.io',
  integrations: [sitemap()],
  // The site is static content; charts render to SVG at build time and ship zero JS.
  // The only client JS is the Sea Ice scroll island, loaded on its own page.
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
