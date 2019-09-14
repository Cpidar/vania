<template>
  <div class="container column justify-center items-center">
    <!-- <div class="month">
      <h2 class="monthname">فروردین</h2>
    </div> -->
    <!-- <section class="week">
      <div class="weekday">شنبه</div>
      <div class="weekday">یکشنبه</div>
      <div class="weekday">دوشنبه</div>
      <div class="weekday">سه شنبه</div>
      <div class="weekday">چهارشنبه</div>
      <div class="weekday">پنج شنبه</div>
      <div class="weekday">جمعه</div>
      <div><span>1</span></div>
      <div><span>2</span></div>
      <div><span>3</span></div>
      <div><span>4</span></div>
      <div><span>5</span></div>
      <div><span>6</span></div>
      <div><span>7</span></div>
    </section> -->
        <q-space />


    <div class="circle column justify-between items-center q-pt-md shadow-10">
      <div class="text-body1">{{todayLabel}}</div>
      <div class="text-h2">{{ 'روز ' + cycleDayNumber}}</div>
      <div class="text-body1">{{fertilityStatus}}</div>
    </div>


    <div class="q-py-md" style="width: 80vw;">
      <!-- <q-card class="my-card">
        <q-card-section>
          need help
        </q-card-section>
      </q-card> -->

    </div>
    <q-space />

  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-vars */
import cycleModule from '../lib/cycle'
import { Vue, Component } from 'vue-property-decorator'
import { LocalDate, ChronoUnit } from 'js-joda'
import { saveSymptom, getCycleDaysSortedByDate } from '../db'
import { home as labels, bleedingPrediction as predictLabels, shared } from '../i18n/en/labels'
import { getFertilityStatusForDay } from '../lib/sympto-adapter'
import { longSelectedDayObj } from '../state'
import { map } from 'rxjs/operators';

@Component({
  subscriptions() {
    return {
      todayLabel: longSelectedDayObj.pipe(map(d => d.day + ' ' + d.monthName))
    }
  }
})
export default class Home extends Vue {
  today = LocalDate.now()
  todayDateString = this.today.toString()
  cycleDayNumber: number | null = 0
  prediction: string[][]
  predictionText = ''
  bleedingPredictionRange = ''
  fertilityStatus = {}
  // getBleedingPrediction = cycleModule().getPredictedMenses
  
  created() {

    cycleModule().then(day => {
      this.cycleDayNumber = day.getCycleDayNumber(LocalDate.now().toString())
      this.predictionText = determinePredictionText(this.prediction)
      this.bleedingPredictionRange = getBleedingPredictionRange(this.prediction)
      console.log(day.getPreviousCycle(LocalDate.now().toString()))
    })
    getFertilityStatusForDay(this.todayDateString).then((status) => {
      console.log(status)
      this.fertilityStatus = status.status
    })
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

<style lang="stylus" scoped>
@import url('../main.styl');

.container {
  width: 100%;
  height: 100vh;
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

</style>
