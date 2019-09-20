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
          :key="calendarKey"
          :period="periodDays"
        />
      </q-carousel-slide>
    </q-carousel>
    <calendar-footer />

    <div class="row justify-center q-py-md q-gutter-sm" v-if="!isAfterToday">
      <bleed-dialog :date="mDate" :data="bleeding" @period="changePeriod"></bleed-dialog>
      <temp-dialog :date="mDate" :data="temperature"></temp-dialog>
      <mucus-dialog :date="mDate" :data="mucus"></mucus-dialog>
      <phn-modal
        :date="getSelectedDay$"
        :data="phn"
      />
    </div>

    <div v-if="isAfterToday" class="q-py-md q-mx-auto">
      <q-btn style="background: #FF0080; color: white" label="Today" @click="goToToday"/>
    </div>

    <phn-section :phn="phn" v-if="phn"/>

  </div>
</template>

<script lang="ts">
import {
  dispatch,
  fertilityStatus,
  getMenses,
  getMonthList,
  getSelectedCycleDay,
  longSelectedDayObj,
  model$
  // getDaysHaveEvents,
} from '../state'

// import Calendar from '../components/calendar-comp.vue'
import CalendarFooter from '../components/calendar-footer.vue'
import CalendarHeader from '../components/calendar-header.vue'
// import PhnSection from '../components/phn-section.vue'
// import PhnModal from '../components/phn-modal.vue'
// import TempDialog from '../components/temperature-dialog.vue'
// import BleedDialog from '../components/bleeding-dialog.vue'
// import MucusDialog from '../components/mucus-dialog.vue'

import jMoment from 'moment-jalaali'
import { combineLatest, Observable, of, zip } from 'rxjs';
import { catchError, filter, map, merge, pluck, switchMap } from 'rxjs/operators';
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getCycleDay, getCycleDaysInRange } from '../db';
import { BleedingSchema, CycleDaySchema, MucusSchema, TemperatureSchema } from '../db/schemas';
import CycleModule from '../lib/cycle'

@Component<CalendarPage>({
  components: {
    Calendar: () => import('../components/calendar-comp.vue'),
    CalendarHeader,
    CalendarFooter,
    PhnSection: () => import('../components/phn-section.vue'),
    PhnModal: () => import('../components/phn-modal.vue'),
    TempDialog: () => import('../components/temperature-dialog.vue'),
    BleedDialog: () => import('../components/bleeding-dialog.vue'),
    MucusDialog: () => import('../components/mucus-dialog.vue')
  },
  subscriptions() {
    const monthList = getMonthList(10)
    const currentDay = longSelectedDayObj.pipe(pluck('date'))
    return {
      getSelectedDay$: longSelectedDayObj,
      mDate: longSelectedDayObj.pipe(pluck('mDate')),
      monthList,
      phn: getSelectedCycleDay,
      currentDay,
      isAfterToday: model$.pipe(map( m => m.selectedDay > m.today)),
      bleeding: getSelectedCycleDay.pipe(pluck('bleeding')),
      mucus: getSelectedCycleDay.pipe(pluck('mucus')),
      temperature: getSelectedCycleDay.pipe(pluck('temperature')),
      periodDays: getMenses,
      fertilityStatus
    }
  }
})

export default class CalendarPage extends Vue {
  public loading = false
  public slide = 10
  public currentDay: string = ''
  public monthList: string[] = []
  public calendarKey = 1
  public periodDays: Map<string, string> = new Map()

  @Watch('slide')
  public onSlideChange() {
    const selectedDay = this.monthList[this.slide]
    dispatch('selectDay', { selectedDay })
  }

  public created() {
    // CycleModule().then(m => {
    //   const p = m.getMenses()
    //   this.periodDays = p
    // })
  }

  public goToToday() {
    this.slide = 10
    dispatch('selectDay', { selectedDay: jMoment().format('jYYYY-jMM-jDD') })
  }

  public changePeriod(ev: any) {
    CycleModule().then(m => {
      const p = m.getMenses()
      this.periodDays = p
    })
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

// .container::before {
//   content: '';
//   width: 100%;
//   height: 100%;
//   position: fixed;
//   background: url('../assets/Back.jpg');
//   background-size: auto 100%;
//   filter: blur(1px) opacity(30%);
//   z-index: -10;
// }

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
