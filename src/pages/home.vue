<template>
  <div class="container column justify-center items-center">
    <q-toolbar class="text-primary">
      <q-space />
      <q-toolbar-title>{{labels.title}}</q-toolbar-title>
      <q-space />
      <more-info mode="button" :headerTitle="info.bleeding.title">{{info.bleeding.text}}</more-info>
    </q-toolbar>

    <q-banner class="bg-primary text-white">
      Unfortunately, the credit card did not go through, please try again.
      <template v-slot:action>
        <q-btn flat color="white" label="Dismiss" />
        <q-btn flat color="white" label="Update Credit Card" />
      </template>
    </q-banner>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab color="primary" push icon="eva-plus-outline" direction="left">
        <bleed-dialog :date="mDate" :data="phn.note"></bleed-dialog>
        <temp-dialog :date="mDate" :data="phn.temperature"></temp-dialog>
        <mucus-dialog :date="mDate" :data="phn.mucus"></mucus-dialog>
        <phn-modal :date="getSelectedDay$" :data="phn" />
      </q-fab>
    </q-page-sticky>

    <q-space />

    <Donut :date="todayLabel" />

    <q-space />
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-vars */
import { ChronoUnit, LocalDate } from 'js-joda'
import { map, pluck } from 'rxjs/operators';
import { CycleDaySchema } from 'src/db/schemas';
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class';
import Donut from '../components/home-circle.vue'
import { bleedingPrediction as predictLabels, home as labels } from '../i18n/fa/labels'
import Info from '../i18n/fa/symptom-info'
import { LongDateModel, longSelectedDayObj, longTodayObj } from '../state'

const Cycle = namespace('cycle')

@Component<Home>({
  components: {
    Donut,
    moreInfo: () => import('../components/explainer.vue'),
    PhnModal: () => import('../components/phn-modal.vue'),
    TempDialog: () => import('../components/temperature-dialog.vue'),
    BleedDialog: () => import('../components/note-dialog.vue'),
    MucusDialog: () => import('../components/mucus-dialog.vue'),
  },
  subscriptions() {
    return {
      getSelectedDay$: longSelectedDayObj,
      todayLabel: longTodayObj.pipe(map(d => d.day + ' ' + d.monthName)),
      mDate: longSelectedDayObj.pipe(pluck('mDate'))
    }
  }
})
export default class Home extends Vue {
  @Cycle.Getter private phn: CycleDaySchema

  private getSelectedDay$: LongDateModel
  private mDate: string

  private cycleDayNumber: number | null = 0
  private prediction: string[][]
  private predictionText = ''
  private bleedingPredictionRange = ''
  private fertilityStatus = {}
  private todayLabel = ''
  private info = Info
  private labels = labels
  // getBleedingPrediction = cycleModule().getPredictedMenses

  private created() {

    // cycleModule().then(day => {
    //   this.cycleDayNumber = day.getCycleDayNumber(LocalDate.now().toString())
    //   this.predictionText = determinePredictionText(this.prediction)
    //   this.bleedingPredictionRange = getBleedingPredictionRange(this.prediction)
    // })
    // getFertilityStatusForDay(this.todayDateString).then((status) => {
    //   this.fertilityStatus = status.status
    // })
  }
}

function determinePredictionText(bleedingPrediction: string[][]) {
  if (!bleedingPrediction) return predictLabels.noPrediction
  const todayDate = LocalDate.now()
  const bleedingStart = LocalDate.parse(bleedingPrediction[0][0])
  const bleedingEnd = LocalDate.parse(
    bleedingPrediction[0][bleedingPrediction[0].length - 1]
  )
  if (todayDate.isBefore(bleedingStart)) {
    return predictLabels.predictionInFuture(
      // @ts-ignore
      todayDate.until(bleedingStart, ChronoUnit.DAYS),
      todayDate.until(bleedingEnd, ChronoUnit.DAYS)
    )
  }
  if (todayDate.isAfter(bleedingEnd)) {
    return predictLabels.predictionInPast(
      bleedingStart.toString(), bleedingEnd.toString()
    )
  }
  const daysToEnd = todayDate.until(bleedingEnd, ChronoUnit.DAYS)
  if (daysToEnd === 0) {
    return predictLabels.predictionStartedNoDaysLeft
  } else if (daysToEnd === 1) {
    return predictLabels.predictionStarted1DayLeft
  } else {
    return predictLabels.predictionStartedXDaysLeft(daysToEnd)
  }
}

function getBleedingPredictionRange(prediction: string[][]) {
  if (!prediction) return labels.unknown
  const todayDate = LocalDate.now()
  const bleedingStart = LocalDate.parse(prediction[0][0])
  const bleedingEnd = LocalDate.parse(prediction[0][prediction[0].length - 1])
  if (todayDate.isBefore(bleedingStart)) {
    return `${todayDate.until(bleedingStart, ChronoUnit.DAYS)}-${todayDate.until(bleedingEnd, ChronoUnit.DAYS)}`
  }
  if (todayDate.isAfter(bleedingEnd)) {
    return labels.unknown
  }
  return '0'
}
</script>

<style lang="scss" scoped>
@import url('../main.scss');

.container {
  width: 100%;
  // height: 100vh;
}

.month {
  margin-top: 2%;
  height: 5vh;
  right: 1%;
  position: relative;
}

.monthname {
  margin: 0;
  font-family: 'Iransans-bold';
  font-size: 18px;
}

// .week {
// display: grid;
// // grid: repeat(2, 1fr) / repeat(7, 1fr);
// width: var(--calendar-width);
// height: var(--calendar-height) + 5 * 10px;
// grid-column-gap: 0;
// justify-items: center;
// font-size: 15px;
// padding-right: 3%;
// margin-left: 1%;
// font-family: "Iransans-medium";
// margin-bottom: 5vh;
// }
.weekday {
  font-size: 12px;
}

.span {
  width: 80%;
  height: 80%;
  align-self: center;
}

.circle {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-radius: 50%;
  width: 80vmin;
  height: 80vmin;
  background: $pink-1;
  line-height: 0;
  text-align: center;
  background: #DE6262; /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #FFB88C, #DE6262); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to bottom, #FFB88C, #DE6262);
}

.date {
  text-align: center;
}

/* Define the icons */
.icon {
  position: absolute;
  display: block;
  border: 2px solid #000;
  border-radius: 50%;
}

.icon:nth-child(1) {
  width: 95px;
  height: 95px;
  top: 10px;
  left: 0;
}

.icon:nth-child(2) {
  width: 140px;
  height: 140px;
  top: 65px;
  left: 80px;
}

.icon:nth-child(3) {
  width: 70px;
  height: 70px;
  top: 45px;
  left: 218px;
}

/* Define the animations for the icons */
.icon {
  animation-name: floating;
  -webkit-animation-name: floating;
  animation-iteration-count: infinite;
  -webkit-animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  -webkit-animation-timing-function: ease-in-out;
}

.icon:nth-child(1) {
  animation-duration: 4s;
}

.icon:nth-child(2) {
  animation-duration: 5s;
}

.icon:nth-child(3) {
  animation-duration: 3s;
}

@keyframes floating {
  0% {
    transform: translate(0%, 0%);
  }

  25% {
    transform: translate(5%, 15%);
  }

  50% {
    transform: translate(10%, 5%);
  }

  75% {
    transform: translate(0%, 15%);
  }

  100% {
    transform: translate(0%, 0%);
  }
}

@keyframes floating {
  0% {
    -webkit-transform: translate(0%, 0%);
  }

  25% {
    -webkit-transform: translate(5%, 15%);
  }

  50% {
    -webkit-transform: translate(10%, 5%);
  }

  75% {
    -webkit-transform: translate(0%, 15%);
  }

  100% {
    -webkit-transform: translate(0%, 0%);
  }
}
</style>
