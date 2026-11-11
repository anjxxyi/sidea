import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/** Injects site values into index.html and emits robots.txt + sitemap.xml at build time. */
function seo(siteUrl: string, email: string): Plugin {
  const url = siteUrl.replace(/\/$/, '');
  return {
    name: 'sidea-seo',
    transformIndexHtml: (html) =>
      html.replaceAll('__SITE_URL__', url).replaceAll('__CONTACT_EMAIL__', email),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          `  <url><loc>${url}/</loc><changefreq>monthly</changefreq></url>\n` +
          `</urlset>\n`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [
      react(),
      seo(env.VITE_SITE_URL || 'https://sidea.example.com', env.VITE_CONTACT_EMAIL || ''),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  };
});
