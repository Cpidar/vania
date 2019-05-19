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
        />
      </q-carousel-slide>
    </q-carousel>
    <calendar-footer />
    <!-- <period-handler
      :currentDate="getSelectedDay$"
      @period="changePeriod"
    />
    <event-section :event="getSelectedDay$" /> -->
    <phn-section :phn="phn" />
    <q-dialog v-model="showModal" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-layout class="bg-white">
        <q-header class="bg-primary">
          <q-toolbar>
            <q-btn flat round dense icon="keyboard_arrow_right" v-close-popup />
            <q-toolbar-title>Header</q-toolbar-title>
          </q-toolbar>
        </q-header>
        <q-page-container>
          <q-page>
            <phn-modal :date="currentDay" :phn="phn" />
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        round
        icon="add"
        color="primary"
        size="lg"
        @click="showModal = true"
      />
    </q-page-sticky>
  </div>
</template>

<script lang="ts">
import {
  dispatch,
  longSelectedDayObj,
  getMonthList,
  calendarReloadHook,
  shortSelectedDay,
  CycleDaysInCurrentMonth,
  getCycleDateDataForSelected
  // getDaysHaveEvents,
} from '../state'

import Calendar from '../components/calendar-comp.vue'
import CalendarHeader from '../components/calendar-header.vue'
import CalendarFooter from '../components/calendar-footer.vue'
import PeriodHandler from '../components/period-handler.vue'
import PhnSection from '../components/phn-section.vue'
import PhnModal from '../components/phn-modal.vue'
import EventSection from '../components/event-section.vue'

import { Vue, Component } from 'vue-property-decorator'
import { Observable, of, combineLatest, zip } from 'rxjs';
import { merge, catchError, pluck, switchMap } from 'rxjs/operators';
import { getCycleDay, getCycleDaysInRange } from '../db';
import { CycleDaySchema } from '../db/schemas';


@Component<CalendarPage>({
  components: { Calendar, CalendarHeader, CalendarFooter, PeriodHandler, PhnSection, EventSection, PhnModal },
  subscriptions() {
    const monthList = getMonthList(10)
    return {
      getSelectedDay$: longSelectedDayObj,
      monthList,
      calendarKey: calendarReloadHook,
      phn: getCycleDateDataForSelected,
      currentDay: longSelectedDayObj.pipe(pluck('date'))
    }
  }
})

export default class CalendarPage extends Vue {
  showModal = false
  events = []
  selectedEvents = {}
  loading = false
  slide = 10
  currentDay: string = ''
  monthList: string[] = []
  phn: CycleDaySchema = {} as any


  mounted() {
  }

  beforeCreate() {
    const payload = { start: '1397/06/31', cycleLength: 18, periodLength: 4 }
    dispatch('init', payload)
  }

  monthChange() {
    // this.currentDay = this.$observables.monthList[this.slide]
    // this.$nextTick(() => this.activeMonth.push(this.monthList[this.activeIndex - 1], this.monthList[this.activeIndex + 1]))
    dispatch('goToMonth', this.currentDay)
  }

  changePeriod(ev: any) {
    console.log(ev)
    this.loading = true
    // setTimeout(function () { this.loading = false }, 100)
    this.$observables.calendarKey = ev
    // setTimeout(() => { this.loading = false }, 1000)
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
