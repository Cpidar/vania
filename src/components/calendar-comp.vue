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
        :today="day.isToday"
        :inactive="day.currentMonthCond"
        :event-type="events[day.jDate]"
        :period="period.get(day.mDate)"
        :fertility="fertility.get(day.mDate)"
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
import { bufferTime, tap } from 'rxjs/operators';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { getCycleDaysInRange } from '../db';
import { CycleDaySchema } from '../db/schemas';
import { currentMonth, daysInMonth } from '../lib/calendar';
import cycleModule from '../lib/cycle';
import { getFertilityStatusForDay } from '../lib/sympto-adapter';
import Day from './day.vue';

@Component<Calendar>({
  components: { Day },
  subscriptions() {
    return {
      month: daysInMonth
    }
  }
})
export default class Calendar extends Vue {
  public values = [...Array(42).keys()]
  public cellW = 100 / 7
  public cellH = 100 / 6
  public cx = 0
  public cy = 0
  public bleedingLength =  4
  @Prop({ type: String, required: true }) public current: string;
  public events = {};
  public selectedDay = '';
  public month: any = [];
  @Prop({ default: () => new Map<string, string>() }) public period: Map<
    string,
    string
  >;
  public fertility = new Map<string, string>();
  public innerLoading = true

  @Watch('current')
  public updateCalendar(m: string) {
    currentMonth.next(m)
  }

  public created() {
    currentMonth.next(this.current)
    this.selectedDay = this.selectedDay || this.current;
    // this.$subscribeTo(
    //   daysInMonth(this.current),
    //   (d: any) => {
    //     this.month = d;
    //     if (d.isToday) {
    //       this.selectedDay = d.jDate;
    //     }
    //     // getFertilityStatusForDay(d.mDate).then(status => {
    //     //   this.fertility.set(d.mDate, status.status);
    //     // });
    //   },
    //   function(err) {
    //     console.log(err);
    //   },
    //   () => {
    //     this.innerLoading = false
    //   }
    // );
  }

  public log(e: any) {
    console.log(e.target.x.baseVal[0].value)
    this.cx = e.target.x.baseVal[0].value
    this.cy = e.target.y.baseVal[0].value
  }

  public mounted() {

    this.innerLoading = false
  }
}
</script>

<style lang="stylus" scoped>
@import url('../main.styl');

.calendar {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  margin: 0 auto;
  height 60vmin
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
