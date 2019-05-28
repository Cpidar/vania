<template>
  <div class="container">
    <calendar-header
      :date="getSelectedDay$"
      @next-month="$refs.carousel.next()"
      @prev-month="$refs.carousel.previous()"
    />
    <q-carousel
      animated
      swipeable
      arrows
      height="100%"
      transition-next="slide-left"
      transition-prev="slide-right"
      v-model="slide"
      ref="carousel"
    >
      <q-carousel-slide
        v-for="(month, index) in monthList"
        :key="month"
        :name="index"
      >
        <Calendar
          :current="month"
          v-if="index - slide < 2 && index - slide > -2"
          :key="calendarKey"
          :period="periodDays"
        />
      </q-carousel-slide>
    </q-carousel>
    <calendar-footer />

    <div class="row justify-center q-py-md q-gutter-sm">
      <bleed-dialog :date="mDate" :data="bleeding"></bleed-dialog>
      <temp-dialog :date="mDate"></temp-dialog>
      <mucus-dialog :date="mDate"></mucus-dialog>
      <phn-modal
        :date="currentDay"
        :phn="phn"
      />
    </div>

    <!-- <q-toggle
        v-model="gotPeriod"
        checked-icon="check"
        color="red"
        label="پریود شدم"
        unchecked-icon="clear"
    /> -->

    <!-- <event-section :event="getSelectedDay$" /> -->
    <phn-section :phn="phn" />

  </div>
</template>

<script lang="ts">
import {
  dispatch,
  longSelectedDayObj,
  calendarReloadHook,
  shortSelectedDay,
  getSelectedCycleDay,
  // getDaysHaveEvents,
} from '../state'

import { getMonthList, } from '../lib/calendar'
import Calendar from '../components/calendar-comp.vue'
import CalendarHeader from '../components/calendar-header.vue'
import CalendarFooter from '../components/calendar-footer.vue'
import PeriodHandler from '../components/period-handler.vue'
import PhnSection from '../components/phn-section.vue'
import PhnModal from '../components/phn-modal.vue'
import TempDialog from '../components/temperature-dialog.vue'
import BleedDialog from '../components/bleeding-dialog.vue'
import MucusDialog from '../components/mucus-dialog.vue'


import { Vue, Component } from 'vue-property-decorator'
import { Observable, of, combineLatest, zip } from 'rxjs';
import { merge, catchError, pluck, switchMap } from 'rxjs/operators';
import { getCycleDay, getCycleDaysInRange } from '../db';
import { CycleDaySchema } from '../db/schemas';
import CycleModule from '../lib/cycle'
import jMoment from 'moment-jalaali'


@Component<CalendarPage>({
  components: {
    Calendar,
    CalendarHeader,
    CalendarFooter,
    PeriodHandler,
    PhnSection,
    PhnModal,
    TempDialog,
    BleedDialog,
    MucusDialog
  },
  subscriptions() {
    const monthList = getMonthList(10)
    const currentDay = longSelectedDayObj.pipe(pluck('date'))
    const isMenseStart = longSelectedDayObj.pipe(switchMap(day => CycleModule().then(m => m.isMensesStart(day.mDate))))
    return {
      getSelectedDay$: longSelectedDayObj,
      mDate: longSelectedDayObj.pipe(pluck('mDate')),
      monthList,
      calendarKey: calendarReloadHook,
      phn: getSelectedCycleDay,
      bleeding: getSelectedCycleDay.pipe(pluck('bleeding')),
      currentDay,
      isMenseStart
    }
  }
})

export default class CalendarPage extends Vue {
  selectedEvents = {}
  loading = false
  slide = 10
  currentDay: string = ''
  monthList: string[] = []
  phn: CycleDaySchema = {} as any
  gotPeriod: boolean = false
  periodDays: Map<string, string> = new Map()


  mounted() {
    CycleModule().then(m => {
      const p = m.getMenses()
      console.log(p)
      this.periodDays = p
    })
  }
  beforeCreate() {
  }


  monthChange() {
  }

  changePeriod(ev: any) {
    console.log(ev)
    this.loading = true
  }
}
</script>

<style lang="stylus" scoped>
@import url('../main.styl');

.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: stretch;
}

.container::before {
  content: '';
  width: 100%;
  height: 100%;
  position: fixed;
  background: url('../assets/Back.jpg');
  background-size: auto 100%;
  filter: blur(1px) opacity(30%);
  z-index: -10;
}

footer {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
  background-color: white;
}

.spacer {
  width: 100%;
  flex-grow: 1;
  justify-items: flex-end;
}

.events :first-child {
  text-decoration: none;
}

.plus {
  font-size: 220%;
}

.sticky {
  top: 0;
  position: fixed;
  background-color: white;
  margin-top: 0;
  animation: all 0.2;
}
</style>
