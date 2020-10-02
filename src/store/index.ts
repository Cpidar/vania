import Vue from 'vue'
import Vuex from 'vuex'

// we first import the module
import Config, { ConfigState } from './config'
import cycle from './cycle'
import PinCode from './pincode'
import UiStore from './ui'

Vue.use(Vuex)

export default function(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      cycle,
      UiStore,
      Config,
      PinCode
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.MODE === 'DEV'
  })

  /*
    if we want some HMR magic for it, we handle
    the hot update like below. Notice we guard this
    code with "process.env.DEV" -- so this doesn't
    get into our production build (and it shouldn't).
  */
// @ts-ignore
  if (process.env.DEV && module.hot) {
// @ts-ignore
    module.hot.accept(['./cycle'], () => {
      const newShowcase = require('./cycle').default
      Store.hotUpdate({ modules: { cycle: newShowcase } })
    })
  }

  return Store
}
