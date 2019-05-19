/* eslint-disable no-unused-vars */
// @ts-nocheck

// import * as jMoment from 'moment-jalaali'
import jMoment from 'moment-jalaali'

jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

import { Subject, range, asyncScheduler, merge, asapScheduler, from, Observable } from 'rxjs'
import { map, shareReplay, switchMap, switchMapTo, tap, mergeMap, share, filter, observeOn, bufferCount, pluck, take, toArray, concatMap, flatMap, startWith, distinctUntilKeyChanged, first, mapTo, combineLatest, reduce } from 'rxjs/operators'
import { getBadTimeEvents } from '../events/event'
import { dayState } from './cycle'
import { getCycleDay, getCycleDaysInRange } from 'src/db';
import { CycleDaySchema } from 'src/db/schemas';

import cycleModue from '../lib/cycle'
const moment = (str: string) => jMoment(str, 'jYYYY-jMM-jDD')
const miladi = (str: string) => jMoment(str, 'jYYYY-jMM-jDD').format('YYYY-MM-DD')

interface Model {
  status: string;
  month: string;
  selectedDay: string;
  today: string;
  events: { type: string, title: string }[];
  PHN: CycleDaySchema;
  currentCycle: any;
  calculatedCycle: any
}

export const initialModel: Model = {
  status: 'INIT',
  month: jMoment().startOf('jMonth').format('jYYYY-jMM-jDD'),
  selectedDay: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  today: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  events: [],
  PHN: {} as any,
  currentCycle: { start: '', cycleLength: 0, periodLength: 0 },
  calculatedCycle: { start: '', cycleLength: 0, periodLength: 0 }
}

export const present = async (data: { type: string, payload: any}) => {
  switch (data.type) {
    case 'init':
      initialModel.status = 'INIT'
      initialModel.currentCycle = data.payload
      return initialModel

    case 'selectDay':
      initialModel.status = 'SELECTED_DAY'
      initialModel.selectedDay = data.payload.selectedDay
      initialModel.events = data.payload.events
      initialModel.PHN = data.payload.phn
      return initialModel

    case 'goToNextMonth':
      const nextMonth = moment(initialModel.month).add(+1, 'jMonth').format('jYYYY-jMM-jDD')
      const s = moment(initialModel.selectedDay).add(+1, 'jMonth').format('jYYYY-jMM-jDD')
      initialModel.status = 'NEXT_MONTH'
      initialModel.month = nextMonth
      initialModel.selectedDay = s
      return initialModel

    case 'goToPrevMonth':
      const prevMonth = moment(initialModel.month).subtract(+1, 'jMonth').format('jYYYY-jMM-jDD')
      const p = moment(initialModel.selectedDay).subtract(+1, 'jMonth').format('jYYYY-jMM-jDD')
      initialModel.status = 'NEXT_MONTH'
      initialModel.month = prevMonth
      initialModel.selectedDay = p
      return initialModel

    case 'goToMonth':
      const month = moment(data.payload).format('jYYYY-jMM-jDD')
      initialModel.status = 'CHANGE_MONTH'
      initialModel.month = month
      initialModel.selectedDay = month
      return initialModel

    case 'gotPeriod':
      initialModel.status = 'PERIOD_STARTS'
      initialModel.currentCycle.start = initialModel.selectedDay
      return initialModel

    case 'endPeriod':
      const newPerLength = moment(data.payload).diff(moment(initialModel.currentCycle.start), 'days')

      initialModel.status = 'PERIOD-ENDS'
      initialModel.currentCycle.periodLength = newPerLength
      return initialModel

    case 'changePeriod':
      initialModel.status = 'PERIOD_CHANGE'
      initialModel.currentCycle.periodLength = data.payload.periodLength
      initialModel.currentCycle.cycleLength = data.payload.cycleLength
      return initialModel

    case 'addEvent':
      initialModel.status = 'EVENT_ADD'
      initialModel.events.push(data.payload)
      return initialModel

    default:
      return initialModel
  }
}

export const computeDaysInMonth = (counter: number, m: string) => {
  const jDate = moment(m).clone().add(counter, 'day')
  const day = jDate.jDate()
  // const hDate = add(d, persianTohijri(newMonth))
  //     .map(h => { return { day: h[0], month: h[1], year: h[2] } })[0];
  const isToday = jDate.isSame(new Date(), 'day')
  const currentMonthCond = jDate.jMonth() - moment(m).jMonth()

  return {
    jDate: jDate.format('jYYYY-jMM-jDD'),
    day,
    isToday,
    currentMonthCond
  }
}

// Wiring

export const action$: Subject<any> = new Subject()

export const model$: Observable<Model> = action$.pipe(
  switchMap(present),
  tap(console.log),
  shareReplay()
)
// no: number of month after or before of current month
export const getMonthList = (no: number) => model$.pipe(
  filter(m => (m.status === 'INIT')),
  take(1),
  map(m => {
    const ar = Array.from({ length: 2 * no + 1 }, (v, i) => i - no)
    return ar.map(v => moment(m.month).clone().add(v, 'jMonth').format('jYYYY-jMM-jDD'))
  })
)

export const daysInMonth = (month: string) => range(-moment(month).clone().weekday(), 42).pipe(
  // observeOn(asyncScheduler),
  map((m) => computeDaysInMonth(m, month)),
  // tap(console.log),
  observeOn(asapScheduler),
  share()
)

export const shortSelectedDay = model$.pipe(
  // filter(m => (m.status === ('INIT' || 'SELECTED_DAY'))),
  // distinctUntilKeyChanged('selectedDay'),
  map((m) => moment(m.selectedDay).format('jYYYY-jMM-jDD')),
  share()
)

export const longSelectedDayObj = model$.pipe(
  // distinctUntilKeyChanged('selectedDay'),
  // filter(m => (m.status === ('INIT' || 'SELECTED_DAY'))),
  map((m) => {
    return {
      date: m.selectedDay,
      day: moment(m.selectedDay).format('jDD'),
      monthName: moment(m.selectedDay).format('jMMMM'),
      fullYear: moment(m.selectedDay).format('jYYYY'),
    }
  }),
  share()
)

export const getCycleDateDataForSelected = model$.pipe(
  tap(console.log),
  pluck('PHN')
)

export const getEventsForSelectedDay = model$.pipe(
  pluck('events')
)

// export const futurePeriodDays = (month: string) => daysInMonth(month).pipe(
//   pluck('jDate'),
//   combineLatest(model$.pipe(pluck('currentCycle')), (d, c) => dayState(d, c)),
//   filter(x => x !== undefined)
// )
// export const badTimeEvents = (month: string) => daysInMonth(month).pipe(
//   mergeMap((day) => getBadTimeEvents(day.jDate))
// )
export const getDaysHavePHN = (month:string) => {
  return from(getCycleDaysInRange(month)).pipe(
    tap(console.log),
    mergeMap(d => from(d)),
    pluck('doc'),
    filter((doc: any) => doc.hasOwnProperty('bleeding')),
    reduce((acc, doc: any) => {
      const date = jMoment(doc.date, 'YYYY-MM-DD').format('jYYYY-jMM-jDD')
      acc[date] = doc.isCycleStart ? {cycle: 'period-start'} : {cycle: 'period'}
      return acc
    }, {})
  )
  // map(phn => [phn.bleedState, phn.sexState, phn.moodState, phn.symptomState].flat().filter(x => x !== ''))
}

export const bleedingDaysForCal = (month: string) => cycleModue().then(m => {
  const start = miladi(month)
  const end = jMoment(start, 'YYYY-MM-DD').add(1, 'month').format('YYYY-MM-DD')
  const mensesStartWithinRange = m.getMensesStartWithinRange(start, end)
  mensesStartWithinRange.reduce((acc: CycleDaySchema[], cycle: CycleDaySchema) => {
    acc.push(cycle)
    acc.concat(m.getMensesDaysRightAfter(cycle))
    return acc
  }, [])
})

export const bleedingDay = () => cycleModue().then(m => {
  console.log(m.getMenses())
})

// export const getDaysHaveEvents = (month:string) => merge(
//   futurePeriodDays(month),
//   getDaysHavePHN(month),
//   badTimeEvents(month)
// )


// export const getPHNValuesArray = getSelectedPHN.pipe(
//   map(phn => [phn.bleedState, phn.sexState, phn.moodState, phn.symptomState].flat().filter(x => x !== ''))
// )

export const calendarReloadHook = model$.pipe(
  filter(m => m.status === 'PERIOD_CHANGE'),
  map(() => Math.round(Math.random() * 100000))
)

// بعد اینو اضاف کن که اگر قبل از آخرین پریودی واقعی چیزی وارد کرد روی پریودی پیش بینی تاثیر نذار
//  برای این کار براساس مقدار diff حالتهای مختلف تعریف کن
export const possibleClosePeriod = model$.pipe(
  filter(m => (m.status === 'SELECTED_DAY')),
  map(m => {
    const diff = moment(m.selectedDay).diff(moment(m.currentCycle.start), 'days')
    console.log(diff)
    if (diff > 8 || diff < -m.currentCycle.periodLength) {
      return ({ canPeriod: true, diff })
    } else {
      return ({ canPeriod: false, diff })
    }
  })
)

export const dispatch = (type: string, payload?: any) => {
  model$.subscribe()
  action$.next({ type, payload })
}
