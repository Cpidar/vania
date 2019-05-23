<template>
  <div>
    <q-btn
      class="glossy"
      round
      color="deep-orange"
      icon="mdi-dots-horizontal"
      @click="showModal = true"
    ></q-btn>
    <q-dialog
      v-model="showModal"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-layout class="bg-white">
        <q-header class="bg-primary">
          <q-toolbar>
            <q-btn
              flat
              round
              dense
              icon="keyboard_arrow_right"
              v-close-popup
            />
            <q-toolbar-title>Header</q-toolbar-title>
          </q-toolbar>
        </q-header>
        <q-page-container>
          <q-page>
            <q-list>
              <q-item-label>حالت روحی</q-item-label>
              <q-item class="q-px-xs">
                <div
                  class="row inline no-wrap q-gutter-lg scroll"
                  style="height: 120px;"
                >
                  <iCheckbox
                    v-for="(mood, i) of moodIcons"
                    :key="i"
                    :value="mood.key"
                    :label="mood.label"
                    :unchecked-icon="mood.icon"
                    checked-color="teal-10"
                    v-model="moods"
                  />
                </div>
              </q-item>
              <q-separator />
              <q-item-label>علائم درد یا بیماری</q-item-label>
              <q-item>
                <div
                  class="row inline no-wrap q-gutter-lg scroll"
                  style="height: 120px;"
                >
                  <iCheckbox
                    v-for="(pain, i) of painIcons"
                    :key="i"
                    :value="pain.key"
                    :label="pain.label"
                    :unchecked-icon="pain.icon"
                    checked-color="purple-10"
                    v-model="pains"
                  />
                </div>
              </q-item>
              <q-separator />
              <q-item-label>رابطه جنسی</q-item-label>
              <q-item>
                <div
                  class="row inline no-wrap q-gutter-lg scroll"
                  style="height: 120px;"
                >
                  <iRadio
                    v-for="(sex, i) of sexIcons"
                    :key="i"
                    :value="sex.key"
                    :label="sex.label"
                    :unchecked-icon="sex.icon"
                    checked-color="pink"
                    v-model="sexes"
                  />
                </div>
              </q-item>
            </q-list>
            <q-page-sticky
              position="bottom"
              :offset="[18, 18]"
            >
              <q-btn
                fab
                icon="add"
                color="accent"
                @click="onSave"
              />
            </q-page-sticky>
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import iCheckbox from './custom-checkbox.vue'
import iRadio from './custom-radio.vue'
import { shortSelectedDay, longSelectedDayObj } from '../state'

import { Component, Vue, Prop } from 'vue-property-decorator'
import { CycleDaySchema, PainSchema, MoodSchema, BleedingSchema, SexSchema } from '../db/schemas'
import { bleeding, pain, mood, sex } from '../i18n/fa/cycle-day';
import { take } from 'rxjs/operators';
import { saveSymptom, saveCycleDay } from '../db';
import { Notify } from 'quasar'
import jMoment from 'moment-jalaali'

let date: string = ''

interface PhnIcon {
  key: number | string;
  label: string;
  icon: string;
  checkedIcon?: string;
}

const initialPHN: Partial<CycleDaySchema> = {
  date,
  bleeding: { value: 10, exclude: false },
  pain: {
    acne: false,
    bodyAche: false,
    backaches: false,
    bloating: false,
    constipation: false,
    cramps: false,
    diarrhea: false,
    dizziness: false,
    headache: false,
    lowerBackPain: false,
    nausea: false,
    neckaches: false,
    ovulationPain: false,
    pms: false,
    shoulderAche: false,
    tender: false,
    migraine: false,
    other: false
  },
  mood: {
    happy: false,
    sad: false,
    stressed: false,
    normal: false,
    swings: false,
    anxious: false,
    frisky: false,
    tired: false,
    angry: false,
    tense: false,
    panicky: false,
    lonely: false
  },
  sex: { value: -1 }
}

@Component({
  components: { iCheckbox, iRadio }
})
export default class PhnModal extends Vue {
  @Prop({ default() { return initialPHN } }) phn: CycleDaySchema
  @Prop() date: string

  bleedIcons: PhnIcon[] = bleeding.labels.map((x, i) => ({ key: i, label: x, icon: `../assets/icons/ic_bl_${i}.png`, checkedIcon: `../assets/icons/ic_bl_${i}_l.png` }))
  painIcons: PhnIcon[] = Object.keys(pain.categories).map((key, index) => ({ key, label: (<any>pain.categories)[key], icon: `../assets/icons/ic_sy_${key}.png` }))
  moodIcons: PhnIcon[] = Object.keys(mood.categories).map((key, index) => ({ key, label: (<any>mood.categories)[key], icon: `../assets/icons/ic_mood_${key}.png` }))
  sexIcons: PhnIcon[] = sex.categories.map((x, i) => ({ key: i, label: x, icon: `../assets/icons/ic_sex_${i}.png`, checkedIcon: `../assets/icons/ic_sex_${i}_l.png` }))

  showModal = false
  currentDate = this.date

  bleeding: number | undefined = this.phn.bleeding ? this.phn.bleeding.value : -1
  pains: PainSchema | undefined = this.phn.pain ? this.phn.pain : initialPHN.pain
  moods: MoodSchema | undefined = this.phn.mood ? this.phn.mood : initialPHN.mood
  sexes: number | undefined = this.phn.sex ? this.phn.sex.value : -1

  onSave() {
    Promise.all([
      saveSymptom('bleeding', this.currentDate, { value: this.bleeding, exclude: false }),
      // saveCycleDay(this.currentDate, { pain: this.pains, mood: this.moods, sex: { value: this.sexes } })
    ]).then(res => {
      this.$emit('close', true)
      this.$q.notify({
        message: 'ثبت دیتا موفق بود'
      })
    })
  }

}
</script>

<style lang="stylus">















/* .bleed-container {















  display: flex;















  flex-wrap: nowrap;















  overflow-x: auto;















} */















/* .bleed-container::-webkit-scrollbar {















  display: none;















} */















</style>
