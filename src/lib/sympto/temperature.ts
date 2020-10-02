import { SymptomShiftModel, TemperatureDaysModel } from 'src/lib/cycle.models';

export default function(cycleDays: any) {
  const temperatureDays: TemperatureDaysModel[] = cycleDays
    .filter((day: any) => day.temperature && !day.temperature.exclude)
    .map((day: any) => {
      return {
        originalCycleDay: day,
        temp: rounded(day.temperature, 0.05)
      }
    })

  function getLtl(i: number) {
    const daysBefore = temperatureDays.slice(0, i).slice(-6)
    const temps = daysBefore.map(day => day.temp)
    return Math.max(...temps)
  }

  for (let i = 0; i < temperatureDays.length; i++) {
    // need at least 6 low temps before we can detect a first high measurement
    if (i < 6) continue

    // is the temp a candidate for a first high measurement?
    const ltl = getLtl(i)
    const temp = temperatureDays[i].temp
    if (temp <= ltl) continue

    const shift: SymptomShiftModel = checkIfFirstHighMeasurement(temp, i, temperatureDays, ltl)

    if (shift.detected) {
      shift.firstHighMeasurementDay = temperatureDays[i].originalCycleDay
      return shift
    }
  }

  return { detected: false }
}

// tslint:disable-next-line:variable-name
function checkIfFirstHighMeasurement(_temp: any, i: number, temperatureDays: any, ltl: any) {
  // need at least 3 high temps to form a high temperature level
  if (i > temperatureDays.length - 3) {
    return { detected: false }
  }
  const nextDaysAfterPotentialFhm = temperatureDays.slice(i + 1, i + 4)

  return (
    getResultForRegularRule(nextDaysAfterPotentialFhm.slice(0, 2), ltl)) ||
    getResultForFirstExceptionRule(nextDaysAfterPotentialFhm, ltl) ||
    getResultForSecondExceptionRule(nextDaysAfterPotentialFhm, ltl) ||
    { detected: false }
}

function getResultForRegularRule(nextDaysAfterPotentialFhm: TemperatureDaysModel[], ltl: number) {
  if (!nextDaysAfterPotentialFhm.every((day: { temp: number; }) => day.temp > ltl)) return false
  const thirdDay = nextDaysAfterPotentialFhm[1]
  if (isLessThan0Point2(thirdDay.temp - ltl)) return false
  return {
    detected: true,
    rule: 0,
    ltl,
    evaluationCompleteDay: thirdDay.originalCycleDay
  }
}

function getResultForFirstExceptionRule(nextDaysAfterPotentialFhm: any[], ltl: number) {
  if (nextDaysAfterPotentialFhm.length < 3) return false
  if (!nextDaysAfterPotentialFhm.every((day: { temp: number; }) => day.temp > ltl)) return false
  const fourthDay = nextDaysAfterPotentialFhm[2]
  if (fourthDay.temp <= ltl) return false
  return {
    detected: true,
    rule: 1,
    ltl,
    evaluationCompleteDay: fourthDay.originalCycleDay
  }
}

function getResultForSecondExceptionRule(nextDaysAfterPotentialFhm: any[], ltl: number) {
  if (nextDaysAfterPotentialFhm.length < 3) return false
  if (secondOrThirdTempIsAtOrBelowLtl(nextDaysAfterPotentialFhm, ltl)) {
    const fourthDay = nextDaysAfterPotentialFhm[2]
    if (isBiggerOrEqual0Point2(fourthDay.temp - ltl)) {
      return {
        detected: true,
        rule: 2,
        ltl,
        evaluationCompleteDay: fourthDay.originalCycleDay
      }
    }
  }
  return false
}

function secondOrThirdTempIsAtOrBelowLtl(nextDaysAfterPotentialFhm: Array<{ temp: number; }>, ltl: number) {
  const secondIsLow = nextDaysAfterPotentialFhm[0].temp <= ltl
  const thirdIsLow = nextDaysAfterPotentialFhm[1].temp <= ltl
  if ((secondIsLow || thirdIsLow) && !(secondIsLow && thirdIsLow)) {
    return true
  } else {
    return false
  }
}

function rounded(val: number, step: number) {
  const inverted = 1 / step
  // we round the difference because of JS decimal weirdness
  return Math.round(val * inverted) / inverted
}

// since we're dealing with floats, there is some imprecision in comparisons,
// so we add an error margin that is definitely much smaller than any possible
// actual difference between values
// see https://floating-point-gui.de/errors/comparison/ for background

const errorMargin = 0.0001

function isLessThan0Point2(val: number) {
  return val < (0.2 - errorMargin)
}

function isBiggerOrEqual0Point2(val: number) {
  return val >= (0.2 - errorMargin)
}
