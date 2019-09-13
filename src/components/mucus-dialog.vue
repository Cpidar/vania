<template>
  <div>
    <q-btn
      class="glossy"
      round
      :outline="value === undefined || value === -1"
      color="teal"
      icon="mdi-weather-rainy"
      @click="showDialogue = true"
    ></q-btn>
    <q-dialog
      v-model="showDialogue"
      position="bottom"
      full-width
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-teal text-white" style="width: 300px">
        <q-card-section>
          <div class="text-h6">{{title}}</div>
        </q-card-section>

        <q-card-section class="row inline no-wrap q-gutter-lg" style="height: 120px;">
          <!-- <div class="text-subtitle2">
          {{mucusLabels.feeling.explainer}}
          </div> -->
          <iRadio
            v-for="(f, i) of mucusFeelingIcons"
            :key="f.key"
            :value="i"
            :label="f.label"
            :unchecked-icon="f.icon()"
            :checked-icon="f.icon()"
            checked-color="pink"
            v-model="feeling"
          />
        </q-card-section>

        <q-card-actions class="row inline no-wrap q-gutter-lg" style="height: 120px;">
          <!-- <div class="text-subtitle2">
          {{mucusLabels.texture.explainer}}
          </div> -->
          <iRadio
            v-for="(f, i) of mucusTextureIcons"
            :key="f.key"
            :value="i"
            :label="f.label"
            :unchecked-icon="f.icon()"
            :checked-icon="f.icon()"
            checked-color="pink"
            v-model="texture"
          />
        </q-card-actions>

        <q-card-actions align="left" class="bg-white text-teal">
          <q-btn flat :label="labels.save" @click="save" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { MucusSchema } from "../db/schemas";
import iRadio from "./custom-radio.vue";
import { mucus, sharedDialogs } from "../i18n/fa/cycle-day";
import { shared, headerTitles } from "../i18n/fa/labels";
import { saveSymptom } from "../db";
import computeNfpValue from '../lib/nfp-mucus'
import { dispatch } from "src/state";

interface PhnIcon {
  key: number | string;
  label: string;
  icon: string;
  checkedIcon?: string;
}

@Component({
  components: { iRadio }
})
export default class MucusDialog extends Vue {
  @Prop() data: MucusSchema;
  @Prop() date: string;

  symptomName = 'mucus'

  showDialogue = false;
  labels = sharedDialogs;
  mucusLabels = mucus;
  title = headerTitles.MucusEditView;

  mucusFeelingIcons = mucusFeelingIcons
  mucusTextureIcons = mucusTextureIcons
  texture: number = -1
  exclude = false
  feeling: number = -1
  value: number = -1

  @Watch('data')
  onDataChange() {
    this.texture = this.data && this.data.texture
    this.exclude = this.data && this.data.exclude
    this.feeling = this.data && this.data.feeling
    this.value = this.data && this.data.value
  }


  save() {
    saveSymptom(this.symptomName, this.date, {
      feeling: this.feeling,
      texture: this.texture,
      value: computeNfpValue(this.feeling, this.texture),
      exclude: this.exclude
    }).then(res => {
      dispatch('ADD_PHN')
      // this.showDialogue = false;
      // this.$emit("save", this.value);
      // this.$q.notify({
      //   message: "انجام شد"
      // });
    });
  }
}

const mucusFeelingIcons = [
  {
    key: 'discharge',
    label: mucus.feeling.categories[0],
    icon() { return require('../assets/icons/ic_mucus_discharge.png') }
  },
  {
    key: 'spotting',
    label: mucus.feeling.categories[1],
    icon() { return require('../assets/icons/ic_mucus_spotting.png') }
  },
  {
    key: 'watery',
    label: mucus.feeling.categories[2],
    icon() { return require('../assets/icons/ic_mucus_watery.png') }
  },
  {
    key: 'sticky',
    label: mucus.feeling.categories[3],
    icon() { return require('../assets/icons/ic_mucus_sticky.png') }
  },
]

const mucusTextureIcons = [
  {
    key: 'nodischarge',
    label: mucus.feeling.categories[1],
    icon() { return require('../assets/icons/ic_mucus_nodischarge.png') }
  },
  {
    key: 'creamy',
    label: mucus.feeling.categories[0],
    icon() { return require('../assets/icons/ic_mucus_creamy.png') }
  },
  {
    key: 'eggwhite',
    label: mucus.feeling.categories[1],
    icon() { return require('../assets/icons/ic_mucus_eggwhite.png') }
  }
]
</script>

<style lang="stylus" scoped></style>

