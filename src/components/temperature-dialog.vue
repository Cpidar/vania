<template>
  <div>
    <q-btn
      class="glossy"
      round
      :outline="value === undefined"
      color="deep-orange"
      icon="eva-thermometer-outline"
      @click="toggle"
    ></q-btn>
    <q-dialog
      v-model="showDialog"
      position="bottom"
      full-width
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">{{ tempLabels.temperature.header }}</div>
          <div class="text-caption">{{ tempLabels.temperature.explainer }}</div>
        </q-card-section>

        <q-card-section>
          <wheel :data="[tempDecList, tempIntList]" @change="select"/>
        </q-card-section>

        <q-card-actions
          align="left"
          class="bg-deep-orange text-white"
        >
          <q-btn
            flat
            :label="sharedLabels.save"
            @click="save"
            v-close-popup
          ></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { LocalTime } from 'js-joda';
import { dispatch } from 'src/state';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class'
import { saveSymptom } from '../db';
import { BleedingSchema, CycleDaySchema, MucusSchema, TemperatureSchema } from '../db/schemas';
import { sharedDialogs, temperature } from '../i18n/fa/cycle-day';
import { headerTitles } from '../i18n/fa/labels';
import { SAVE_PHN } from '../store/cycle/types';
import { TOGGLE_TEMP_DIAL } from '../store/ui';
import iRadio from './custom-radio.vue';

const Cycle = namespace('cycle')
const Ui = namespace('UiStore')

interface PhnIcon {
  key: number | string;
  label: string;
  icon: string;
  checkedIcon?: string;
}

function range(start: number, end: number) {
  const ans = [];
  for (let i = start; i <= end; i++) {
    ans.push({ value: i, text: i });
  }
  return ans;
}

@Component({
  components: { wheel: () => import('./wheel-picker.vue') }
})
export default class TemperatureDialog extends Vue {
  @Prop() public data: TemperatureSchema;
  @Prop() public date: string;

  @Cycle.Action(SAVE_PHN) private savePHN: any
  @Ui.State private temperatureDialog: boolean
  @Ui.Action(TOGGLE_TEMP_DIAL) private toggle: any

  private sharedLabels = sharedDialogs;
  private tempLabels = temperature;
  private title = headerTitles.TemperatureEditView;

  private exclude = false;
  private temperatureInt = 32;
  private temperatureDec = 0.4;

  private tempIntList = [
    ...range(33, 45)
  ];

  private tempDecList = [
    ...range(1, 99).map(x => ({ value: x.value / 100, text: x.text / 100 }))
  ]

  @Watch('data', { immediate: true })
  private onDataChange() {
    const val = this.data && this.data.value
    this.temperatureInt = Math.trunc(val)
    this.temperatureDec = +(val - this.temperatureInt).toFixed(2)
    this.exclude = this.data && this.data.exclude
  }

  get showDialog() {
    return this.temperatureDialog
  }
  set showDialog(val) {
    this.toggle()
  }

  get value() {
    return this.data && this.data.value;
  }

  private select(val: number, val2: number) {
    console.log(val , val2)
    if(val == 0) {
      this.temperatureDec = this.tempDecList[val2].value
    } else if(val === 1) {
      this.temperatureInt = this.tempIntList[val2].value
    }
  }

  private save() {
    const value = this.temperatureInt + this.temperatureDec;
    const time = LocalTime.now().toString()
    const symptom: Partial<CycleDaySchema> = {
      date: this.date,
      temperature: {
        value,
        time
      }
      }
    this.savePHN(symptom)
    }
  }
</script>

<style lang="scss" scoped>
.row-group {
  background-color: black;
}
</style>
