<template>
  <div>
    <section class="calendarday">
      <div>شنبه</div>
      <div>یکشنبه</div>
      <div>دوشنبه</div>
      <div>سه شنبه</div>
      <div>چهارشنبه</div>
      <div>پنج شنبه</div>
      <div>جمعه</div>
    </section>
    <section class="calendar">
      <Day
        v-for="(day) of month"
        v-model="selectedDay"
        :key="day.jDate"
        :date="day.jDate"
        :mDate="day.mDate"
        :today="day.isToday"
        :inactive="day.currentMonthCond"
        :event-type="events[day.jDate]"
        :period="showPeriod && periodState(day.mDate)"
        :fertility="showFertility && fertility(day.mDate).status"
        :hasPHN="showPHN && hasPHN(day.mDate)"
      >{{day.day}}</Day>
      <!-- <svg width="100vmin" height="40vmin" direction="rtl" lang="fa" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g v-for="(day, i) of month" :key="'r'+i">
            <rect v-if="i>=20 && i <=23" :x="(i%7)*cellW+'%'" :y="(Math.floor(i/7))*cellH+'%'" :width="cellW+'%'" :height="cellH+'%'" stroke="pink" fill="transparent" stroke-width="1">/</rect>
          </g>
          <circle :cx="cx" :cy="cy" :r="cellH/4+'%'" stroke="red" fill="blue" :stroke-width="0"></circle>
          <g v-for="(day, i) of month" :key="'t'+i">
            <text :x="cellW/2+(i%7)*cellW+'%'" :y="cellH/2+(Math.floor(i/7))*cellH+'%'" text-anchor="middle" dy=".3em" @click="log">{{day.day}}</text>
          </g>
      </svg> -->
    </section>
    <q-inner-loading :showing="innerLoading">
      <q-spinner-cube size="50px" color="primary" />
        در حال محاسبه
    </q-inner-loading>
  </div>
</template>

<script lang="ts">
import { mergeDeepRight, reduce } from 'ramda';
import { Subject } from 'rxjs';
import { bufferCount, map, tap, zip } from 'rxjs/operators';
import BTree from 'sorted-btree';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Getter, namespace } from 'vuex-class'
import { getCycleDaysInRange } from '../db';
import { CycleDaySchema } from '../db/schemas';
import { currentMonth, DayInterface, daysInMonth } from '../lib/calendar';
import cycleModule from '../lib/cycle';
import { getFertilityStatusForDay } from '../lib/sympto-adapter';
import { shortSelectedDay } from '../state';
import { FertalityStatus } from '../store/cycle/models';
import Day from './day.vue';

const Cycle = namespace('cycle')
@Component<Calendar>({
  components: { Day },
  subscriptions() {
    const day = daysInMonth.pipe(
      zip(this.controller, (d, n) => d)
    )
    return {
      month: daysInMonth,
      selectedDay: shortSelectedDay,
      day
    }
  }
})
export default class Calendar extends Vue {
  private values = [...Array(42).keys()]
  private cellW = 100 / 7
  private cellH = 100 / 6
  private cx = 0
  private cy = 0
  private bleedingLength =  4

  @Prop({ type: String, required: true }) private current: string;
  @Prop({ default: false }) private showFertility: boolean
  @Prop({ default: false }) private showPeriod: boolean
  @Prop({ default: false }) private showPHN: boolean
  private events: {[key: string]: string} = {};
  private selectedDay = '';
  private month: DayInterface[] = [];
  private innerLoading = true
  private controller = new Subject<number>()

  @Cycle.Getter private menses: BTree<string, CycleDaySchema>
  @Cycle.Getter private predictedMenses: { [key: string]: string }
  @Cycle.State private cycleDays: BTree<string, CycleDaySchema>
  @Getter('fertilityStatus', { namespace: 'cycle' })
  private fertility: (id: string) => FertalityStatus

  @Watch('current', { immediate: true })
  private updateCalendar(m: string) {
    currentMonth.next(m)
  }

  // private created() {
  //   currentMonth.next(this.current)
  // }

  private periodState(date: string) {
    const day = this.menses.get(date)
    const fDay = this.predictedMenses[date]
    if (day && day.isCycleStart) {
      return 'period-start'
    } else if (day && day.isBleedingEnd) {
      return 'period-end'
    } else if (day) {
      return 'period'
    } else if (fDay) {
      return fDay
    }
  }

  private log(e: any) {
    this.cx = e.target.x.baseVal[0].value
    this.cy = e.target.y.baseVal[0].value
  }

  private mounted() {

    this.innerLoading = false
  }

  private hasPHN(date: string): boolean {
    const phn = this.cycleDays.get(date)
    return phn && Boolean(phn.weight || phn.temperature || phn.note || phn.mood || phn.pain)
  }
}
</script>

<style lang="scss" scoped>
@import url('../main.scss');

.calendar {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  margin: 0 auto;
  height: 60vmin;
}

.calendarday > div {
  width: (100% / 7);
  height: 100%;
  float: left;
  font-size: 12px;
  text-align: center;
  line-height: var(--cell-height);
}

.todaycal {
  grid-row: 1 / 3;
  grid-column: 1;
}

.sticky {
  top: 0;
  position: fixed;
  background-color: white;
  margin-top: 0;
  animation: all 0.2;
}
circle {
  transition: all 100ms ease-in-out;
}
</style>
