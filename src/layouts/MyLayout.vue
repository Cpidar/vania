<template>
  <q-layout view="lHh Lpr lFf" class="background">

    <q-page-container>
      <router-view />
    </q-page-container>
        <q-footer>
      <q-tabs switch-indicator no-caps class="bg-grey-1 text-pink shadow-2">
        <!-- Tabs - notice slot="title" -->
        <q-route-tab
          icon="mdi-home"
          to="/"
          exact
        />

        <q-route-tab
          icon="mdi-calendar"
          to="/calendar"
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
  }
})
</script>

<style lang="stylus">
</style>

