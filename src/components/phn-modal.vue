<template>
  <div>
    <q-btn
      class="glossy"
      round
      outline
      color="blue-grey"
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
      <q-card>
        <q-toolbar>
          <q-btn flat round dense icon="keyboard_arrow_right" v-close-popup/>
          <q-toolbar-title>{{dateText}}</q-toolbar-title>
        </q-toolbar>
        <q-card-section class="bg-orange-1">
          <q-list>
            <q-item-label>{{headerTitles.MoodEditView}}</q-item-label>
            <q-item class="q-px-xs">
              <div class="row inline no-wrap q-gutter-lg scroll" style="height: 120px;">
                <iCheckbox
                  v-for="(m, i) of moodIcons"
                  :key="i"
                  :value="m.key"
                  :label="m.label"
                  :unchecked-icon="m.icon"
                  checked-color="teal-10"
                  v-model="mood"
                />
              </div>
            </q-item>
            <!-- <q-separator/> -->
            <q-item-label>{{headerTitles.PainEditView}}</q-item-label>
            <q-item>
              <div class="row inline no-wrap q-gutter-lg scroll" style="height: 120px;">
                <iCheckbox
                  v-for="(p, i) of painIcons"
                  :key="i"
                  :value="p.key"
                  :label="p.label"
                  :unchecked-icon="p.icon"
                  checked-color="purple-10"
                  v-model="pain"
                />
              </div>
            </q-item>
            <!-- <q-separator/> -->
            <q-item-label>{{headerTitles.SexEditView}}</q-item-label>
            <q-item>
              <div class="row inline no-wrap q-gutter-lg scroll" style="height: 120px;">
                <iRadio
                  v-for="(s, i) of sexIcons"
                  :key="i"
                  :value="s.key"
                  :label="s.label"
                  :unchecked-icon="s.icon"
                  checked-color="pink"
                  v-model="sex"
                />
              </div>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions>
          <q-btn flat :label="labels.save" @click="save" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import iCheckbox from "./custom-checkbox.vue";
import iRadio from "./custom-radio.vue";
import {
  shortSelectedDay,
  longSelectedDayObj,
  initialCycleDay,
  LongDateModel
} from "../state";

import { Component, Vue, Prop } from "vue-property-decorator";
import {
  CycleDaySchema,
  PainSchema,
  MoodSchema,
  BleedingSchema,
  SexSchema
} from "../db/schemas";
import { bleeding, pain, mood, sex, sharedDialogs } from "../i18n/fa/cycle-day";
import { headerTitles } from "../i18n/fa/labels";
import { take } from "rxjs/operators";
import { saveSymptom, saveCycleDay } from "../db";
import { Notify } from "quasar";
import jMoment from "moment-jalaali";

interface PhnIcon {
  key: number | string;
  label: string;
  icon: string;
  checkedIcon?: string;
}

@Component({
  components: { iCheckbox, iRadio }
})
export default class PhnModal extends Vue {
  @Prop() data: CycleDaySchema;
  @Prop() date: LongDateModel;

  painIcons: PhnIcon[] = Object.keys(pain.categories).map((key, index) => ({
    key,
    label: (<any>pain.categories)[key],
    icon: `../assets/icons/ic_sy_${key}.png`
  }));
  moodIcons: PhnIcon[] = Object.keys(mood.categories).map((key, index) => ({
    key,
    label: (<any>mood.categories)[key],
    icon: `../assets/icons/ic_mood_${key}.png`
  }));
  sexIcons: PhnIcon[] = sex.categories.map((x, i) => ({
    key: i,
    label: x,
    icon: `../assets/icons/ic_sex_${i}.png`,
    checkedIcon: `../assets/icons/ic_sex_${i}_l.png`
  }));

  showModal = false;
  currentDate = this.date;

  headerTitles = headerTitles
  labels = sharedDialogs

  painValue = {}
  moodValue = {}
  sexValue: number

  get pain() {
    let attr = this.data && (this.data['pain'] || ([] as PainSchema))
    return attr
  }

  get mood() {
    let attr = this.data && (this.data['mood'] || ([] as MoodSchema))
    return attr
  }
  set pain(val) {
    // this.painValue = val.reduce((acc: any, cur) => {
    //   acc[cur] = true
    //   return acc
    // }, {})
    this.painValue = val
  }

  set mood(val) {
    // this.moodValue = val.reduce((acc: any, cur) => {
    //   acc[cur] = true
    //   return acc
    // }, {})
    this.moodValue = val
  }

  get sex() {
    return this.data && this.data.sex && this.data.sex.value
  }
  set sex(val) {
    this.sexValue = val
  }

  get dateText() {
    return this.date && (this.date.day + ' ' + this.date.monthName)
  }

  save() {
    Promise.all([
      saveSymptom("mood", this.date.mDate, this.moodValue),
      saveSymptom("pain", this.date.mDate, this.painValue),
      saveSymptom("sex", this.date.mDate, { value: this.sexValue })
    ]).then(res => {
      // this.showModal = false
      // this.$q.notify({
      //   message: "ثبت دیتا موفق بود"
      // });
    });
  }
}
</script>

<style lang="stylus"></style>
