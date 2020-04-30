import colors from 'vuetify/es5/util/colors';

export default {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: 'macha.in',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://cdn.materialdesignicons.com/4.9.95/css/materialdesignicons.min.css',
      },
    ],
    script: [
      {
        src:
          'https://cdnjs.cloudflare.com/ajax/libs/pulltorefreshjs/0.1.20/index.umd.min.js',
        integrity: 'sha256-plfyATLvpJutooJZODIP/uMaXvn8TK229Xa2FVMP/Ks=',
        crossorigin: 'anonymous',
      },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: '~/plugins/notifier' },
    { src: '@/plugins/qrCodeReader', mode: 'client' },
    { src: '~/plugins/sharer.js' },
    { src: '~/plugins/vue-touch', ssr: false },
    { src: '~/plugins/vuelidate' },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxtjs/vuetify'],
  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/pwa', '@nuxtjs/apollo'],
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    defaultAssets: false,
    theme: {
      dark: true,
      themes: {
        light: {
          primary: '#5996ff',
          success: '#2FC64D',
          info: '#1E7CFF',
          warning: '#FFF316',
          error: '#FF4F4C',
        },
        dark: {
          primary: '#6970f1',
          success: '#2FC64D',
          info: '#1E7CFF',
          warning: '#FFF316',
          error: '#FF4F4C',
        },
      },
    },
  },

  apollo: {
    cookieAttributes: {
      expires: 15,
    },
    clientConfigs: {
      default: {
        // required
        httpEndpoint: 'http://localhost:4000',
      },
    },
  },

  /*
   ** PWA Settings
   */
  pwa: {
    manifest: {
      short_name: 'macha',
      name: 'macha.in',
      description: 'Your personal social network',
      display: 'standalone',
    },
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {},
  },
};
