import * as joda from 'js-joda'
import { CycleDaySchema } from 'src/db/schemas';
import { CycleLengthState, getCycleLengthStats } from './cycle-length'
const LocalDate = joda.LocalDate
const DAYS = joda.ChronoUnit.DAYS

interface Opt {
  bleedingDaysSortedByDate: CycleDaySchema[];
  cycleStartsSortedByDate: CycleDaySchema[];
  cycleDaysSortedByDate: CycleDaySchema[];
  maxBreakInBleeding: number;
  maxCycleLength: number;
  minCyclesForPrediction: number;
}

export default function config(opts: Opt) {

  const bleedingDaysSortedByDate = opts.bleedingDaysSortedByDate || []
  const cycleStartsSortedByDate = opts.cycleStartsSortedByDate || []
  const cycleDaysSortedByDate = opts.cycleDaysSortedByDate || []
  const maxBreakInBleeding = opts.maxBreakInBleeding || 1
  const maxCycleLength = opts.maxCycleLength || 99
  const minCyclesForPrediction = opts.minCyclesForPrediction || 3

  function getLastMensesStartForDay(targetDateString: string) {
    return cycleStartsSortedByDate.find(start => start.date <= targetDateString)
  }

  function getMensesStartWithinRange(start: string, end: string): CycleDaySchema[] {
    return cycleStartsSortedByDate.filter(cycle => cycle.date <= end && cycle.date >= start)
  }

  function getMenses() {
    const starts = cycleStartsSortedByDate
    const m = new Map<string, string>()
    if (starts.length === 0) return m
    for (const cycle of starts) {
      const start = LocalDate.parse(cycle.date)
      const nextCycles = getMensesDaysRightAfter(cycle)
      const end = nextCycles.length ? nextCycles[0].date : ''
      m.set(cycle.date, 'period-start')
      if (!end) continue
      m.set(end, 'period-end')
      let i = 1
      while (true) {
        const date = start.plusDays(i++)
        if (date.equals(LocalDate.parse(end))) { break }
        m.set(date.toString(), 'period')
      }
    }
    return m
  }

  function getCycleDayNumber(targetDateString: string) {
    const lastMensesStart = getLastMensesStartForDay(targetDateString)
    if (!lastMensesStart) return null
    const targetDate = LocalDate.parse(targetDateString)
    const lastMensesLocalDate = LocalDate.parse(lastMensesStart.date)
    const diffInDays = lastMensesLocalDate.until(targetDate, DAYS)
    // take maxCycleLength into account (we don't display cycle day numbers higher than 99 at the moment)
    if (diffInDays >= maxCycleLength) return null
    // cycle starts at day 1
    return diffInDays + 1
  }

  function getPreviousCycle(dateString: string) {
    const cycleStart = getLastMensesStartForDay(dateString)
    if (!cycleStart) return null
    const i = cycleStartsSortedByDate.indexOf(cycleStart)
    const earlierCycleStart = cycleStartsSortedByDate[i + 1]
    if (!earlierCycleStart) return null
    return getCycleForCycleStartDay(earlierCycleStart)
  }

  function getCyclesBefore(targetCycleStartDay: CycleDaySchema) {
    const startFromHere = cycleStartsSortedByDate.findIndex(start => {
      return (start.date < targetCycleStartDay.date)
    })
    if (startFromHere < 0) return null
    return cycleStartsSortedByDate
      .slice(startFromHere)
      .map(start => getCycleForCycleStartDay(start))
      // filter the ones exceeding maxCycleLength, those are null
      .filter(cycle => cycle)
  }

  function getCycleForCycleStartDay(startDay?: CycleDaySchema, todayDate?: string) {
    const todayAsLocalDate = todayDate ? LocalDate.parse(todayDate) : LocalDate.now()
    const cycleStartIndex = cycleDaysSortedByDate.findIndex(x => x.date === startDay.date)
    const i = cycleStartsSortedByDate.findIndex(x => x.date === startDay.date)
    const startLocalDate = LocalDate.parse((startDay).date)
    const nextMensesStart = cycleStartsSortedByDate[i - 1]
    let cycle: CycleDaySchema[]
    let cycleLength
    if (nextMensesStart) {
      cycle = cycleDaysSortedByDate.slice(
        cycleDaysSortedByDate.indexOf(nextMensesStart) + 1,
        cycleStartIndex + 1
      )
      const nextLocalDate = LocalDate.parse(nextMensesStart.date)
      cycleLength = startLocalDate.until(nextLocalDate, DAYS)
    } else {
      cycle = cycleDaysSortedByDate.slice(0, cycleStartIndex + 1)
      cycleLength = startLocalDate.until(todayAsLocalDate, DAYS)
    }
    return cycleLength > maxCycleLength ? null : cycle
  }

  function getCycleForDay(dayOrDate: any, todayDate?: string) {
    const dateString = typeof dayOrDate === 'string' ? dayOrDate : dayOrDate.date
    const cycleStart = getLastMensesStartForDay(dateString)
    if (!cycleStart) return null
    return getCycleForCycleStartDay(cycleStart, todayDate)
  }

  function isMensesStart(cycleDay: CycleDaySchema) {
    if (noBleedingDayWithinThresholdBefore(cycleDay)) return true
    if (!cycleDay.isBleedingDay
      //  || (cycleDay.bleeding as BleedingSchema).exclude
    ) return false
    return false

    // checks that there are no relevant bleeding days before
    // the input cycleDay (returns boolean)
    // tslint:disable-next-line:no-shadowed-variable
    function noBleedingDayWithinThresholdBefore(cycleDay: CycleDaySchema) {
      const localDate = LocalDate.parse(cycleDay.date)
      const threshold = localDate.minusDays(maxBreakInBleeding + 1).toString()
      const bleedingDays = [cycleDay, ...bleedingDaysSortedByDate].sort((a, b) => a.date > b.date ? -1 : 1)
      const index = bleedingDays.findIndex(day => day.date === cycleDay.date)
      const candidates = bleedingDays.slice(index + 1)
      return !candidates.some(day => {
        return day.date >= threshold
        // && !(day.bleeding as BleedingSchema).exclude
      })
    }
  }

  // returns all bleeding days that belong to one menses directly following
  // the cycle day. used to set or clear new cycle starts when the target day
  // changes
  function getMensesDaysRightAfter(cycleDay: CycleDaySchema) {
    const bleedingDays = bleedingDaysSortedByDate
      // .filter(d => !((d.bleeding as BleedingSchema).exclude))
      .reverse()
    const firstFollowingBleedingDayIndex = bleedingDays.findIndex(day => {
      return day.date > cycleDay.date
    })
    return recurse(cycleDay, firstFollowingBleedingDayIndex, [])

    // we look at the current bleeding day as well as the next, and decide
    // whether they belong to one menses. if they do, we collect them, once
    // they don't, we're done
    function recurse(day: CycleDaySchema, nextIndex: number, mensesDays: CycleDaySchema[]): CycleDaySchema[] {
      const next = bleedingDays[nextIndex]
      if (!next) return mensesDays
      if (!isWithinThreshold(day, next)) return mensesDays
      mensesDays.unshift(next)
      return recurse(next, nextIndex + 1, mensesDays)
    }

    // checks whether the two days belong to one menses episode
    function isWithinThreshold(bleedingDay: CycleDaySchema, nextBleedingDay: CycleDaySchema) {
      const localDate = LocalDate.parse(bleedingDay.date)
      const threshold = localDate.plusDays(maxBreakInBleeding + 1).toString()
      return nextBleedingDay.date <= threshold
    }
  }

  function getAllCycleLengths() {
    return cycleStartsSortedByDate
      .map(day => LocalDate.parse(day.date))
      .map((cycleStart, i, startsAsLocalDates) => {
        if (i === cycleStartsSortedByDate.length - 1) return null
        const prevCycleStart = startsAsLocalDates[i + 1]
        return prevCycleStart.until(cycleStart, DAYS)
      })
      .filter(length => length && length <= maxCycleLength)
  }

  function getPredictedMenses() {

    const cycleLengths = getAllCycleLengths()

    if (cycleLengths.length < minCyclesForPrediction) {
      // normal period prediction in here ...
      return claculatePredictedMense({
        mean: 28,
        maximum: 28,
        minimum: 28,
        middle: 28,
        median: 28,
        stdDeviation: null
      })
    }

    const cycleInfo = getCycleLengthStats(cycleLengths as number[])

    return claculatePredictedMense(cycleInfo)

    function claculatePredictedMense(cycleInfo: CycleLengthState) {

      const periodDistance = Math.round(cycleInfo.mean)
      let periodStartVariation: number

      if (cycleInfo.stdDeviation === null) {
        periodStartVariation = 2
      } else if (cycleInfo.stdDeviation < 1.5) { // threshold is chosen a little arbitrarily
        periodStartVariation = 1
      } else {
        periodStartVariation = 2
      }
      if (periodDistance - 5 < periodStartVariation) { // otherwise predictions overlap
        return {}
      }

      const allMensesStarts = cycleStartsSortedByDate
      if (allMensesStarts.length === 0) return {}
      let lastStart = LocalDate.parse(allMensesStarts[0].date)
      const predictedMenses: { [key: string]: string } = {}
      for (let i = 0; i < 3; i++) {
        lastStart = lastStart.plusDays(periodDistance)
        predictedMenses[lastStart.toString()] = 'period-pr'
        for (let j = 0; j < periodStartVariation; j++) {
          if (j === periodStartVariation - 1) {
            predictedMenses[lastStart.minusDays(j + 1).toString()] = 'period-pr-start'
            predictedMenses[lastStart.plusDays(j + 1).toString()] = 'period-pr-end'
          } else {
            predictedMenses[lastStart.minusDays(j + 1).toString()] = 'period-pr'
            predictedMenses[lastStart.plusDays(j + 1).toString()] = 'period-pr'
          }
        }
      }
      return predictedMenses
    }
  }

  return {
    getCycleDayNumber,
    getCycleForDay,
    getPreviousCycle,
    getCyclesBefore,
    getAllCycleLengths,
    getPredictedMenses,
    isMensesStart,
    getMensesDaysRightAfter,
    getMensesStartWithinRange,
    getMenses,
    getLastMensesStartForDay
  }
}
