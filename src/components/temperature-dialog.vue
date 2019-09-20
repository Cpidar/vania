<template>
  <div>
    <q-btn
      class="glossy"
      round
      :outline="value === undefined"
      color="deep-orange"
      icon="mdi-thermometer"
      @click="showDialog = true"
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
          <scroll-picker-group style="display: flex; font-size: 18px;">
            <scroll-picker
              :options="tempDecList"
              v-model="temperatureDec"
            />
            <scroll-picker
              :options="tempIntList"
              v-model="temperatureInt"
            />
          </scroll-picker-group>
        </q-card-section>

        <q-card-actions
          align="left"
          class="bg-white text-teal"
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
import { dispatch } from 'src/state';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { saveSymptom } from '../db';
import { BleedingSchema, MucusSchema, TemperatureSchema } from '../db/schemas';
import { sharedDialogs, temperature } from '../i18n/fa/cycle-day';
import { headerTitles } from '../i18n/fa/labels';
import iRadio from './custom-radio.vue';

interface PhnIcon {
  key: number | string;
  label: string;
  icon: string;
  checkedIcon?: string;
}

function range(start: number, end: number) {
  const ans = [];
  for (let i = start; i <= end; i++) {
    ans.push({ value: i, name: i });
  }
  return ans;
}

@Component({
  components: { iRadio }
})
export default class TemperatureDialog extends Vue {
  @Prop() public data: TemperatureSchema;
  @Prop() public date: string;

  public showDialog = false;
  public sharedLabels = sharedDialogs;
  public tempLabels = temperature;
  public title = headerTitles.TemperatureEditView;

  public exclude = false;
  public temperatureInt = 32
  public temperatureDec = 0.4

  public tempIntList: any = [
    ...range(33, 45)
  ];

  public tempDecList = [
    ...range(1, 99).map(x => ({ value: x.value / 100, name: x.name / 100 }))
  ]

  @Watch('data')
  public onDataChange() {
    const val = this.data && this.data.value
    this.temperatureInt = Math.trunc(val)
    this.temperatureDec = +(val - this.temperatureInt).toFixed(2)
    this.exclude = this.data && this.data.exclude
  }

  get value() {
    return this.data && this.data.value;
  }

  public save() {
    const temp = this.temperatureInt + this.temperatureDec;
    saveSymptom('temperature', this.date, {
      value: temp,
      exclude: this.exclude
    }).then(res => {
      dispatch('ADD_PHN')
      // this.showDialog = false;
      // this.$emit("save", temp);
      // this.$q.notify({
      //   message: "انجام شد"
      // });
    });
  }
}
</script>

<style lang="stylus" scoped>
.row-group {
  background-color: black;
}
</style>
