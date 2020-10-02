<template>
  <div>
    <q-btn
      class="glossy"
      round
      outline
      color="blue-grey"
      icon="mdi-dots-horizontal"
      @click="toggle"
    ></q-btn>
    <q-dialog
      v-model="showModal"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      class="bg-orange-1"
    >
      <q-card class="bg-yellow-1 full-height">
        <q-toolbar>
          <q-btn flat round dense icon="keyboard_arrow_right" v-close-popup />
          <q-toolbar-title>{{ dateText }}</q-toolbar-title>
          <explainer headerTitle="hello" class="float-right">hello</explainer>
        </q-toolbar>
        <q-card-section class="q-px-xs">
          <q-list>
            <q-item-label>{{ headerTitles.BleedingEditView }}</q-item-label>
            <q-item>
              <q-item-section>
                <div
                  class="row inline no-wrap q-gutter-lg scroll"
                  style="height: 140px"
                >
                  <iRadio
                    v-for="(bleed, i) of bleedIcons"
                    :key="i"
                    :value="bleed.key"
                    :label="bleed.label"
                    :unchecked-icon="bleed.icon()"
                    :checked-icon="bleed.checkedIcon()"
                    checked-color="primary"
                    v-model="bleeding"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-item-label>{{ headerTitles.MoodEditView }}</q-item-label>
            <q-item>
              <div
                class="row inline no-wrap q-gutter-lg scroll"
                style="height: 140px"
              >
                <iCheckbox
                  v-for="(m, i) of moodIcons"
                  :key="i"
                  :value="m.key"
                  :label="m.label"
                  :unchecked-icon="m.icon()"
                  checked-color="secondary"
                  @change="updateMood"
                  :selected="moodValue.includes(m.key)"
                />
              </div>
            </q-item>
            <!-- <q-separator/> -->
            <q-item-label>{{ headerTitles.PainEditView }}</q-item-label>
            <q-item>
              <div
                class="row inline no-wrap q-gutter-lg scroll"
                style="height: 140px"
              >
                <iCheckbox
                  v-for="(p, i) of painIcons"
                  :key="i"
                  :value="p.key"
                  :label="p.label"
                  :unchecked-icon="p.icon()"
                  checked-color="secondary"
                  @change="updatePain"
                  :selected="painValue.includes(p.key)"
                />
              </div>
            </q-item>
            <!-- <q-separator/> -->
            <q-item-label>{{ headerTitles.SexEditView }}</q-item-label>
            <q-item>
              <div
                class="row inline no-wrap q-gutter-lg scroll no-scroll"
                style="height: 140px"
              >
                <iRadio
                  v-for="(s, i) of sexIcons"
                  :key="i"
                  :value="s.key"
                  :label="s.label"
                  :unchecked-icon="s.icon()"
                  :checked-icon="s.icon()"
                  checked-color="primary"
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
import { LongDateModel, longSelectedDayObj, shortSelectedDay } from "../state";
import iCheckbox from "./custom-checkbox.vue";
import iRadio from "./custom-radio.vue";
import wheel from "./wheel-picker.vue";

import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import {
  BleedingSchema,
  CycleDaySchema,
  MoodSchema,
  PainSchema,
  SexSchema,
} from "../db/schemas";
import { bleeding, mood, pain, sex, sharedDialogs } from "../i18n/fa/cycle-day";
import { headerTitles } from "../i18n/fa/labels";
import { SAVE_PHN } from "../store/cycle/types";
import { TOGGLE_PHN_DIAL } from "../store/ui";

interface PhnIcon {
  key: number | string;
  label: string;
  icon: () => any;
  checkedIcon?: () => any;
}

function range(start: number, end: number) {
  const ans = [];
  for (let i = start; i <= end; i++) {
    ans.push({ value: i, text: i });
  }
  return ans;
}

const Cycle = namespace("cycle");
const Ui = namespace("UiStore");

@Component({
  components: {
    iCheckbox,
    iRadio,
    wheel,
    explainer: () => import("./explainer.vue"),
  },
})
export default class PhnModal extends Vue {
  @Prop() public data: CycleDaySchema;
  @Prop() public date: LongDateModel;

  @Cycle.Action(SAVE_PHN) private savePHN: (
    phn: Partial<CycleDaySchema>
  ) => null;
  @Ui.State private phnDialog: boolean;
  @Ui.Action(TOGGLE_PHN_DIAL) private toggle: any;

  private bleedIcons: PhnIcon[] = bleeding.labels.map((x, i) => ({
    key: i,
    label: x,
    icon() {
      return require(`../assets/icons/ic_bl_${i}.png`);
    },
    checkedIcon() {
      return require(`../assets/icons/ic_bl_${i}_l.png`);
    },
  }));

  private painIcons: PhnIcon[] = Object.keys(pain.categories).map(
    (key, index) => ({
      key,
      label: (pain.categories as any)[key],
      icon() {
        return require(`../assets/icons/ic_sy_${key}.png`);
      },
    })
  );
  private moodIcons: PhnIcon[] = Object.keys(mood.categories).map(
    (key, index) => ({
      key,
      label: (mood.categories as any)[key],
      icon() {
        return require(`../assets/icons/ic_mood_${key}.png`);
      },
    })
  );
  private sexIcons: PhnIcon[] = sex.categories.map((x, i) => ({
    key: i,
    label: x,
    icon() {
      return require(`../assets/icons/ic_sex_${i}.png`);
    },
    checkedIcon() {
      return require(`../assets/icons/ic_sex_${i}_l.png`);
    },
  }));

  private get currentDate() {
    return this.date;
  }

  private headerTitles = headerTitles;
  private labels = sharedDialogs;

  private exclude: boolean = false;
  private bleeding = -1;
  private sex: number = -1;
  private painValue: PainSchema[] = [];
  private moodValue: MoodSchema[] = [];
  private sexValue: number;

  private weightIntList = [
    ...range(20, 200)
  ];

  private weightDecList = [
    ...range(1, 9).map(x => ({ value: x.value / 10, text: x.text / 10 }))
  ]

  updateMood(newMood: { selected: boolean; value: MoodSchema }) {
    const selected = newMood.selected;
    const value = newMood.value;
    selected
      ? this.moodValue.push(value)
      : this.moodValue.splice(this.moodValue.indexOf(value), 1);
  }

  updatePain(newPain: { selected: boolean; value: PainSchema }) {
    const selected = newPain.selected;
    const value = newPain.value;
    selected
      ? this.painValue.push(value)
      : this.painValue.splice(this.painValue.indexOf(value), 1);
  }

  // get mood() {
  //   const attr = this.data && (this.data.mood || ([] as MoodSchema));
  //   return attr;
  // }
  // set mood(val) {
  //   console.log(val);
  //   this.moodValue = [...this.moodValue, ...val];
  // }

  // get pain() {
  //   const attr = this.data && (this.data.pain || ([] as PainSchema));
  //   return attr;
  // }
  // set pain(val) {
  //   this.painValue = val;
  // }

  get dateText() {
    return this.date && this.date.day + " " + this.date.monthName;
  }

  @Watch("data", { deep: true })
  private onDataChange() {
    this.sex = this.data && this.data.sex;
    this.bleeding = this.data && this.data.bleeding && this.data.bleeding.value;
    this.exclude =
      this.data && this.data.bleeding && this.data.bleeding.exclude;
    // this.moodValue = this.data && this.data.mood || []
  }

  get showModal() {
    return this.phnDialog;
  }

  set showModal(val) {
    this.toggle();
  }

  select() {}

  private save() {
    const phn: Partial<CycleDaySchema> = {
      date: this.date.mDate,
      bleeding: {
        value: this.bleeding,
        exclude: this.exclude,
      },
      pain: this.painValue,
      mood: this.moodValue,
      sex: this.sex,
    };

    this.savePHN(phn);
  }
}
</script>

<style lang="scss"></style>
