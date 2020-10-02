<template>
  <div>
    <q-btn
    v-if="mode === 'button'"
      round
      flat
      color="primary"
      icon="eva-info-outline"
      @click="showModal = true"
    ></q-btn>
    <q-badge color="white" v-if="mode === 'badge'" @click="showModal = true">
      <q-icon name="mdi-information-outline" color="primary" />
    </q-badge>
    <q-dialog
      v-model="showModal"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      class="bg-orange-1"
    >
      <q-card class="full-height">
        <q-toolbar class="bg-grey-3">
          <q-btn flat round dense icon="keyboard_arrow_right" v-close-popup />
          <q-toolbar-title>{{headerTitle}}</q-toolbar-title>
        </q-toolbar>
        <q-card-section>
          <slot />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class Explainer extends Vue {
  @Prop({default: 'توضیحات بیشتر'}) private headerTitle: string
  @Prop({default: 'button'}) private mode: string
  private showModal = false;
}
</script>

<style lang="scss"></style>
