// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Update `site` once a real domain is chosen (used for sitemap + canonical/OG URLs).
export default defineConfig({
  site: 'https://josephcalderon.dev',
  integrations: [sitemap()],
  // The site is static content; charts render to SVG at build time and ship zero JS.
  // The only client JS is the Sea Ice scroll island, loaded on its own page.
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
