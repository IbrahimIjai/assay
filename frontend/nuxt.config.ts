// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxtjs/google-fonts',
    '@nuxtjs/seo'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      // General Sans is a Fontshare face and is not served by Google Fonts.
      link: [
        { rel: 'preconnect', href: 'https://api.fontshare.com' },
        { rel: 'preconnect', href: 'https://cdn.fontshare.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://api.fontshare.com/v2/css?f[]=general-sans@400,500&display=swap'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  router: {
    options: {
      // In-page anchors are handled by `scroll-behavior` on <html>; this covers
      // hash targets reached across a route change.
      scrollBehaviorType: 'smooth'
    }
  },

  site: {
    url: 'https://vouch.id',
    name: 'Vouch'
  },

  colorMode: {
    preference: 'system',
    fallback: 'light'
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  googleFonts: {
    families: {
      'Manrope': [400, 500],
      'JetBrains Mono': [400]
    },
    display: 'swap',
    preconnect: true
  },

  // No OG renderer is installed and none is needed; the module otherwise
  // prompts to pull one down at dev-server start.
  ogImage: {
    enabled: false
  }
})
