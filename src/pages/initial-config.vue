<template>
  <div class="icontainer q-pa-md">
    <q-carousel
      animated
      v-model="slide"
      fullscreen.sync
      transition-next="slide-left"
      transition-prev="slide-right"
      class="full-height"
    >
      <q-carousel-slide :name="1" class="column">
          <div class="text-body1 q-py-md">
            {{ labels.cyclelengthQuestion }}
          </div>
          <q-space />
            <wheel :data="[cycleLengthValues]" @change="setCycleLength" />
          <q-space />
          <q-space />
          <q-carousel-control
            position="bottom-right"
            :offset="[18, 18]"
            class="q-gutter-xs"
          >
            <q-btn
              @click="slide = 2"
              color="primary"
              :label="labels.continue"
            />
          </q-carousel-control>
      </q-carousel-slide>

      <q-carousel-slide :name="2" class="column">
        <div class="text-body1 q-py-md">{{ labels.bleedinlengthQuestion }}</div>
        <q-space />
        <wheel :data="[BleedingLengthValues]" @change="setBleedingLength" />
        <q-space />
        <q-space />
        <q-carousel-control
          position="bottom-right"
          :offset="[18, 18]"
          class="q-gutter-xs"
        >
          <q-btn @click="slide = 3" color="primary" :label="labels.continue" />
          <q-btn
            flat
            @click="slide = 1"
            color="primary"
            :label="labels.back"
            class="q-ml-sm"
          />
        </q-carousel-control>
      </q-carousel-slide>

      <q-carousel-slide :name="3" class="column">
        <div class="text-body1 q-py-md">
          {{ labels.lastCycleStartQuestion }}
        </div>

        <calendar :footer="false" />
        <q-carousel-control
          position="bottom-right"
          :offset="[18, 18]"
          class="q-gutter-xs"
        >
          <q-btn color="primary" :label="labels.finish" @click="save" />
          <q-btn
            flat
            @click="slide = 2"
            color="primary"
            :label="labels.back"
            class="q-ml-sm"
          />
        </q-carousel-control>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script lang="ts">
import { longSelectedDayObj, model$ } from "src/state";
import { Component, Vue } from "vue-property-decorator";
import { pluck, map } from 'rxjs/operators'
import { namespace } from "vuex-class";
import Calendar from "../components/calendar-carousel.vue";
import Wheel from "../components/wheel-picker.vue";
import { entryPage as labels } from "../i18n/fa/labels";
import { ConfigState } from "../store/config";
import { START_PERIOD } from "src/store/cycle/types";

function range(start: number, end: number) {
  const ans = [];
  for (let i = start; i <= end; i++) {
    ans.push({ value: i, text: i });
  }
  return ans;
}

const Config = namespace("Config");
const Cycle = namespace('cycle')

@Component<InitialConfigPage>({
  components: { Calendar, Wheel },
      subscriptions() {
    return {
      getSelectedDay$: longSelectedDayObj,
      mDate: longSelectedDayObj.pipe(pluck("mDate")),
      isAfterToday: model$.pipe(map((m) => m.selectedDay > m.today)),
    };
  },
})
export default class InitialConfigPage extends Vue {
  private slide = 1;
  private currentDay: string = "";
  private mDate: string = '';

  @Config.Action private setNormalPeriodInfo: (
    normalPeriodSetting: ConfigState["normalPeriodSetting"]
  ) => null;
  @Cycle.Action(START_PERIOD) private startPeriod: any

  private step = 1;
  private cycleLength = 28;
  private bleedingLength = 4;
  private lastCycleStart = "";

  private labels = labels;

  private cycleLengthValues = [...range(18, 42)];

  private BleedingLengthValues = [...range(3, 7)];

  private setCycleLength(val1: any, val2: any) {
    this.cycleLength = this.cycleLengthValues[val2].value

  }

  private setBleedingLength(val1: any, val2: any) {
    this.bleedingLength = this.BleedingLengthValues[val2].value
  }

  private save() {
    const payload: ConfigState["normalPeriodSetting"] = {
      lastStart: this.mDate,
      cycleLength: this.cycleLength,
      periodLength: this.bleedingLength,
    };
    this.setNormalPeriodInfo(payload);
    this.$router.replace("home");
    this.startPeriod(this.mDate)
  }
}
</script>

<style lang="scss" scoped>
.icontainer {
  background: linear-gradient(135deg, #fcdf8a, #f38381);
  height: 100vh;
}
</style>
