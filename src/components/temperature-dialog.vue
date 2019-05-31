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
      <q-card class="bg-teal text-white" style="width: 300px">
        <q-card-section>
          <div class="text-h6">{{ tempLabels.temperature.header }}</div>
          <div class="text-caption">{{ tempLabels.temperature.explainer }}</div>
        </q-card-section>

        <q-card-section>
          <smooth-picker ref="tempPicker" :data="tempValList" style="color: black;"/>
        </q-card-section>

        <q-card-actions align="left" class="bg-white text-teal">
          <q-btn flat :label="sharedLabels.save" @click="save" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
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
    ans.push(i);
  }
  return ans;
}

@Component({
  components: { iRadio }
})
export default class TemperatureDialog extends Vue {
  @Prop({ default: () => ({
    value: -1,
    time: '',
    exclude: false
  }) }) data: TemperatureSchema;
  @Prop() date: string;

  showDialog = false;
  sharedLabels = sharedDialogs;
  tempLabels = temperature;
  title = headerTitles.TemperatureEditView;

  exclude = this.data.exclude;

  tempValList: any = [
    {
      divider: true,
      flex: 1
    },
    {
      currentIndex: 0,
      flex: 3,
      list: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      textAlign: "center",
      className: "row-group"
    },
    {
      currentIndex: 1,
      flex: 3,
      list: range(33, 45),
      textAlign: "center",
      className: "row-group"
    },
    {
      divider: true,
      flex: 1
    }
  ];

  get value() {
    return this.data.value;
  }

  save() {
    const ciList = (this.$refs.tempPicker as any).getCurrentIndexList();
    const tempInt = this.tempValList[2].list[ciList[2]];
    const tempDec = this.tempValList[1].list[ciList[1]];
    const temp = tempInt + tempDec;
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
