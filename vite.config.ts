import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, loadEnv } from 'vite'
import { seoFiles } from './src/seo/vitePlugin.ts'
import { staticPages } from './src/seo/ghPages.ts'
import { normalizeSiteUrl } from './src/seo/seo.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const siteUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL
  const host = normalizeSiteUrl(siteUrl)?.replace(/^https?:\/\//, '')
  return {
    plugins: [
      seoFiles(siteUrl),
      staticPages(host),
      // Must come before the React plugin
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons.svg'],
        workbox: {
          // Everything the app needs offline: code (incl. the lazy GLPK chunk that embeds the
          // WASM + worker), About-page images and KaTeX fonts.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,wasm,webmanifest}'],
          navigateFallback: '/index.html',
          // crawlers and people opening these must get the real file, not the app shell
          navigateFallbackDenylist: [/^\/(robots\.txt|sitemap\.xml|ads\.txt)$/],
          cleanupOutdatedCaches: true,
        },
        manifest: {
          name: 'Otimização',
          short_name: 'Otimização',
          description: 'Métodos de otimização: Simplex, Transporte e Branch and Bound',
          lang: 'pt-BR',
          theme_color: '#1565c0',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
  }
})
