// Configuration for your app

module.exports = function (ctx) {
  return {
    // Quasar looks for *.js files by default
    sourceFiles: {
      router: 'src/router/index.ts',
      store: 'src/store/index.ts'
    },
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    boot: [
      'rx',
      'picker'
    ],

    css: [
      'app.styl'
    ],

    extras: [
      'roboto-font',
      'material-icons', // optional, you are not bound to it
      // 'ionicons-v4',
      'mdi-v3',
      // 'fontawesome-v5',
      // 'eva-icons'
    ],

    framework: {
      all: true, // --- includes everything; for dev only!

      // components: [
      //   'QLayout',
      //   'QHeader',
      //   'QFooter',
      //   'QDrawer',
      //   'QPageContainer',
      //   'QPage',
      //   'QToolbar',
      //   'QToolbarTitle',
      //   'QBtn',
      //   'QIcon',
      //   'QList',
      //   'QItem',
      //   'QItemLabel',
      //   'QItemSection',
      //   'QSeparator',
      //   'QTabs',
      //   'QTab',
      //   'QTabPanels',
      //   'QTabPanel',
      //   'QRouteTab',
      //   'QDialog',
      //   'QField',
      //   'QInput',
      //   'QSlider',
      //   'QToggle',
      //   'QExpansionItem',
      //   'QPageSticky',
      //   'QCheckbox',
      //   'QCard',
      //   'QCardSection',
      //   'QCardActions',
      //   'QCarousel',
      //   'QCarouselSlide',
      //   'QCarouselControl',
      //   'QInnerLoading',
      //   'QSpinnerGears',
      //   'QCarousel',
      //   'QCarouselControl',
      //   'QCarouselSlide'
      // ],

      directives: [
        'Ripple',
        'TouchSwipe',
        'ClosePopup'
      ],

      // Quasar plugins
      plugins: [
        'Notify',
        'Dialog',
        'LocalStorage',
        'SessionStorage'
      ],

      // iconSet: 'ionicons-v4'
      lang: 'fa-ir' // Quasar language
    },

    supportIE: false,

    build: {
      scopeHoisting: true,
      rtl: true,
      // vueRouterMode: 'history',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack (cfg) {
      }
    },

    devServer: {
      // https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },

    animations: 'all', // --- includes all animations
    // animations: [],

    ssr: {
      pwa: false
    },

    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {}, // only for NON InjectManifest
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            'src': 'statics/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    },

    cordova: {
      // id: 'org.cordova.quasar.app'
      // noIosLegacyBuildFlag: true // uncomment only if you know what you are doing
    },

    electron: {
      // bundler: 'builder', // or 'packager'

      extendWebpack (cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      },

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        // appId: 'quasar-app'
      }
    }
  }
}