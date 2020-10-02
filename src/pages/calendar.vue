<template>
  <div class="container">

  
    <calendar />

    <period-handler :date="mDate" :isStart="phn.isCycleStart" :isEnd="phn.isBleedingEnd" v-if="!isAfterToday"/>

    <div class="row justify-center q-py-md q-gutter-sm" v-if="!isAfterToday">
      <bleed-dialog :date="mDate" :data="phn.note"></bleed-dialog>
      <temp-dialog :date="mDate" :data="phn.temperature"></temp-dialog>
      <mucus-dialog :date="mDate" :data="phn.mucus"></mucus-dialog>
      <phn-modal :date="getSelectedDay$" :data="phn" />
    </div>

    <div v-if="isAfterToday" class="q-py-md q-mx-auto">
      <q-btn style="background: #FF0080; color: white" label="برگرد به امروز" @click="goToToday"/>
    </div>

    <event :events="['قمر در عقرب', 'عید فطر']"/>

    <phn-section :phn="phn" v-if="phn"/>

  </div>
</template>

<script lang="ts">
import {
  dispatch,
  getMonthList,
  LongDateModel,
  longSelectedDayObj,
  model$
  // getDaysHaveEvents,
} from '../state'


import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { CycleDaySchema } from '../db/schemas';
import { FertalityStatus } from '../store/cycle/models';
import { map, pluck } from 'rxjs/operators';

const Cycle = namespace('cycle')

@Component<CalendarPage>({
  components: {
    Calendar: () => import('../components/calendar-carousel.vue'),
    PeriodHandler: () => import('../components/period-handler.vue'),
    PhnSection: () => import('../components/phn-section.vue'),
    PhnModal: () => import('../components/phn-modal.vue'),
    TempDialog: () => import('../components/temperature-dialog.vue'),
    BleedDialog: () => import('../components/note-dialog.vue'),
    MucusDialog: () => import('../components/mucus-dialog.vue'),
    Event: () => import('../components/event-section.vue')
  },
    subscriptions() {
    return {
      getSelectedDay$: longSelectedDayObj,
      mDate: longSelectedDayObj.pipe(pluck("mDate")),
      isAfterToday: model$.pipe(map((m) => m.selectedDay > m.today)),
    };
  },
})

export default class CalendarPage extends Vue {

  @Cycle.Getter private phn: CycleDaySchema
  @Cycle.Getter private fertilityStatus: FertalityStatus

}
</script>

<style lang="scss" scoped>
@import url('../main.scss');

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
