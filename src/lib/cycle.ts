import * as joda from 'js-joda'
import jMoment from 'moment-jalaali'
import { getCycleLengthStats } from './cycle-length'
import { getBleedingDaysSortedByDate, getCycleStartsSortedByDate, getCycleDaysSortedByDate } from '../db'
import { CycleDaySchema, BleedingSchema } from '../db/schemas';
const LocalDate = joda.LocalDate
const DAYS = joda.ChronoUnit.DAYS

const toJalali = (date: string) => jMoment(date, 'YYYY-MM-DD').format('jYYYY-jMM-jDD')

export default async function config(opts?: any) {
  let bleedingDaysSortedByDate: CycleDaySchema[]
  let cycleStartsSortedByDate: CycleDaySchema[]
  let cycleDaysSortedByDate: CycleDaySchema[]
  let maxBreakInBleeding: number
  let maxCycleLength: number
  let minCyclesForPrediction: number

  if (!opts) {
    // we only want to require (and run) the db module
    // when not running the tests
    bleedingDaysSortedByDate = await getBleedingDaysSortedByDate()
    cycleStartsSortedByDate = await getCycleStartsSortedByDate()
    cycleDaysSortedByDate = await getCycleDaysSortedByDate()
    // maximum day break between bleeding
    maxBreakInBleeding = 1
    maxCycleLength = 99
    minCyclesForPrediction = 1
  } else {
    bleedingDaysSortedByDate = opts.bleedingDaysSortedByDate || []
    cycleStartsSortedByDate = opts.cycleStartsSortedByDate || []
    cycleDaysSortedByDate = opts.cycleDaysSortedByDate || []
    maxBreakInBleeding = opts.maxBreakInBleeding || 1
    maxCycleLength = opts.maxCycleLength || 99
    minCyclesForPrediction = opts.minCyclesForPrediction || 3
  }

  function getLastMensesStartForDay(targetDateString: string) {
    return cycleStartsSortedByDate.find(start => start.date <= targetDateString)
  }

  function getMensesStartWithinRange(start: string, end: string): CycleDaySchema[] {
    return cycleStartsSortedByDate.filter(cycle =>  cycle.date <= end && cycle.date >= start)
  }

  function getMenses() {
    const starts = cycleStartsSortedByDate
    let m = new Map<string, string>()
    for( let cycle of starts) {
      const start = LocalDate.parse(cycle.date)
      const nextCycles = getMensesDaysRightAfter(cycle)
      const end = nextCycles[0].date
      m.set(toJalali(cycle.date), 'period-start')
      m.set(toJalali(end), 'period-end')
      let i = 1
      while(true) {
        let date = start.plusDays(i++)
        if(date.equals(LocalDate.parse(end))) { break }
        m.set(toJalali(date.toString()), 'period')
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
      return start.date < targetCycleStartDay.date
    })
    if (startFromHere < 0) return null
    return cycleStartsSortedByDate
      .slice(startFromHere)
      .map(start => getCycleForCycleStartDay(start))
      // filter the ones exceeding maxCycleLength, those are null
      .filter(cycle => cycle)
  }

  function getCycleForCycleStartDay(startDay?: any, todayDate?: string) {
    const todayAsLocalDate = todayDate ? LocalDate.parse(todayDate) : LocalDate.now()
    const cycleStartIndex = cycleDaysSortedByDate.indexOf(startDay)
    const i = cycleStartsSortedByDate.indexOf(startDay)
    const startLocalDate = LocalDate.parse((startDay).date)
    const nextMensesStart = cycleStartsSortedByDate[i - 1]
    let cycle
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

  function getCycleForDay(dayOrDate: any, todayDate: string) {
    const dateString = typeof dayOrDate === 'string' ? dayOrDate : dayOrDate.date
    const cycleStart = getLastMensesStartForDay(dateString)
    if (!cycleStart) return null
    return getCycleForCycleStartDay(cycleStart, todayDate)
  }

  function isMensesStart(cycleDay: CycleDaySchema) {
    if (!cycleDay.bleeding || cycleDay.bleeding.exclude) return false
    if (noBleedingDayWithinThresholdBefore(cycleDay)) return true
    return false

    // checks that there are no relevant bleeding days before
    // the input cycleDay (returns boolean)
    function noBleedingDayWithinThresholdBefore(cycleDay: CycleDaySchema) {
      const localDate = LocalDate.parse(cycleDay.date)
      const threshold = localDate.minusDays(maxBreakInBleeding + 1).toString()
      const bleedingDays = bleedingDaysSortedByDate
      const index = bleedingDays.findIndex(day => day.date === cycleDay.date)
      const candidates = bleedingDays.slice(index + 1)
      return !candidates.some(day => {
        return day.date >= threshold && !(day.bleeding as BleedingSchema).exclude
      })
    }
  }

  // returns all bleeding days that belong to one menses directly following
  // the cycle day. used to set or clear new cycle starts when the target day
  // changes
  function getMensesDaysRightAfter(cycleDay: CycleDaySchema) {
    const bleedingDays = bleedingDaysSortedByDate
      .filter(d => !(d.bleeding as BleedingSchema).exclude)
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
      return new Map<string, string>()
    }
    const cycleInfo = getCycleLengthStats(cycleLengths as number[])
    const periodDistance = Math.round(cycleInfo.mean)
    let periodStartVariation
    if (cycleInfo.stdDeviation === null) {
      periodStartVariation = 2
    } else if (cycleInfo.stdDeviation < 1.5) { // threshold is chosen a little arbitrarily
      periodStartVariation = 1
    } else {
      periodStartVariation = 2
    }
    if (periodDistance - 5 < periodStartVariation) { // otherwise predictions overlap
      return []
    }
    const allMensesStarts = cycleStartsSortedByDate
    let lastStart = LocalDate.parse(allMensesStarts[0].date)
    const predictedMenses = new Map<string, string>()
    for (let i = 0; i < 3; i++) {
      lastStart = lastStart.plusDays(periodDistance)
      const nextPredictedDates = predictedMenses.set(toJalali(lastStart.toString()), 'period-pr')
      for (let j = 0; j < periodStartVariation; j++) {
        if(j === periodStartVariation -1) {
          predictedMenses.set(toJalali(lastStart.minusDays(j + 1).toString()), 'period-pr-end')
          predictedMenses.set(toJalali(lastStart.plusDays(j + 1).toString()), 'period-pr-end')
        } else {
          predictedMenses.set(toJalali(lastStart.minusDays(j + 1).toString()), 'period-pr')
          predictedMenses.set(toJalali(lastStart.plusDays(j + 1).toString()), 'period-pr')
        }
      }
    }
    return predictedMenses
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
    getMenses
  }
}
