<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { dispatch } from './state'

export default Vue.extend({
  name: 'App',

  beforeCreate() {
    const payload = { start: '1398-02-10', cycleLength: 18, bleedindLength: 4 }
    dispatch('init', payload)
  }
})
</script>

<style>
</style>
