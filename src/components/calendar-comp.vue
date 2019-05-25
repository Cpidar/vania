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
      >
        {{day.day}}
      </Day>
    </section>
  </div>
</template>

<script lang="ts">

import { daysInMonth } from '../state'
import Day from './day.vue'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { reduce, mergeDeepRight } from 'ramda'
import { bufferTime } from 'rxjs/operators'
import { getCycleDaysInRange } from '../db';
import { CycleDaySchema } from '../db/schemas';
import cycleModule from '../lib/cycle'
import { getFertilityStatusForDay } from '../lib/sympto-adapter';

@Component<Calendar>({
  components: { Day }
})
export default class Calendar extends Vue {
  @Prop({ type: String, required: true }) current: string
  events = {}
  selectedDay = ''
  month: any = []
  period = new Map<string, string>()

  mounted() {
    this.$subscribeTo(daysInMonth(this.current),
      (d: any) => {
        this.month = [...this.month, d]
        if (d.isToday) { this.selectedDay = d.jDate }
        getFertilityStatusForDay(d.mDate).then(status => {
          if(status.phase === 2) {
            this.period.set(d.mDate, status.status)
          }
        })
      },
      function (err) { console.log(err) },
      () => { console.log('complete') }
    )
    this.selectedDay = this.selectedDay || this.current
    
    cycleModule().then(m => {
      console.log(m.getMenses())
      this.period = new Map([...m.getMenses(), ...m.getPredictedMenses()])
    })
  }

}

</script>

<style lang="stylus" scoped>
@import url("../main.styl");

.calendar {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  margin: 0 auto;
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
  grid-row: 1/3;
  grid-column: 1;
}

.sticky {
  top: 0;
  position: fixed;
  background-color: white;
  margin-top: 0;
  animation: all 0.2;
}
</style>
