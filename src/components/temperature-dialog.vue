<template>
  <div>
    <q-btn
      class="glossy"
      round
      :outline="value === -1"
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
            <scroll-picker :options="tempDecList" v-model="temperatureDec"/>
            <scroll-picker :options="tempIntList" v-model="temperatureInt"/>
          </scroll-picker-group>
        </q-card-section>

        <q-card-actions align="left" class="bg-white text-teal">
          <q-btn flat :label="sharedLabels.save" @click="save" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { BleedingSchema, MucusSchema, TemperatureSchema } from "../db/schemas";
import iRadio from "./custom-radio.vue";
import { temperature, sharedDialogs } from "../i18n/fa/cycle-day";
import { saveSymptom } from "../db";
import { headerTitles } from "../i18n/fa/labels";
import { dispatch } from "src/state";

interface PhnIcon {
  key: number | string;
  label: string;
  icon: string;
  checkedIcon?: string;
}

function range(start: number, end: number) {
  var ans = [];
  for (let i = start; i <= end; i++) {
    ans.push({ value: i, name: i });
  }
  return ans;
}

@Component({
  components: { iRadio }
})
export default class TemperatureDialog extends Vue {
  @Prop() data: TemperatureSchema;
  @Prop() date: string;

  showDialog = false;
  sharedLabels = sharedDialogs;
  tempLabels = temperature;
  title = headerTitles.TemperatureEditView;

  exclude = false;
  temperatureInt = 32
  temperatureDec = 0.4

  @Watch('data')
  onDataChange() {
    this.temperatureInt = Math.trunc(this.data.value)
    this.temperatureDec = +(this.data.value - this.temperatureInt).toFixed(2)
    this.exclude = this.data.exclude
  }

  tempIntList: any = [
    ...range(33, 45)
  ];

  tempDecList = [
    ...range(1, 99).map(x => ({ value: x.value / 100, name: x.name /100 }))
  ]

  get value() {
    return this.data && this.data.value;
  }

  save() {
    const temp = this.temperatureInt + this.temperatureDec;
    saveSymptom("temperature", this.date, {
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
