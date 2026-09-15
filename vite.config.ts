import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, type Plugin } from 'vite'

// Injected only into the production HTML (apply: 'build'), so local dev /
// `netlify dev` keeps the inline React preamble script. The CSP omits
// 'unsafe-inline' from script-src, which stops Netlify's auto-injected
// "Powered by Netlify" badge script from rendering (see Netlify docs).
const CSP_META_TAG: Plugin = {
  name: 'inject-csp-meta',
  apply: 'build',
  transformIndexHtml() {
    return [
      {
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content:
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:; object-src 'none'; base-uri 'none'",
        },
        injectTo: 'head-prepend',
      },
    ]
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), babel({ presets: [reactCompilerPreset()] }), CSP_META_TAG],
})
