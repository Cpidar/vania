<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1 full-height">

    <q-page-container class="full-height">
      <router-view />
    </q-page-container>
        <q-footer>
      <q-tabs no-caps indicator-color="transparent" class="bg-grey-1 text-blue-grey-11 shadow-2" active-color="primary">
        <!-- Tabs - notice slot="title" -->
        <q-route-tab
          icon="mdi-home"
          to="/home"
          exact
        />

        <q-route-tab
          icon="mdi-calendar"
          to="/calendar"
          exact
        />
        <q-route-tab
          icon="mdi-chart-bar"
          to="/reports"
          exact
        />
        <q-route-tab
          icon="mdi-account"
          to="/me"
          exact
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import BScroll from '@better-scroll/core'
import { openURL } from 'quasar'

import Vue from 'vue'

export default Vue.extend({
  name: 'MyLayout',
  data() {
    return {
      leftDrawerOpen: false // this.$q.platform.is.desktop
    }
  },
  methods: {
    openURL
  },
  mounted() {
    // console.log(this.$refs)
    // this.$nextTick(() => new BScroll(this.$refs.container as HTMLElement, {
    //   scrollY: true,
    //   click: false
    // }))
  }
})
</script>

<style lang="scss">
</style>

