
import jMoment from 'moment-jalaali'
import { Subject, Observable, of, from } from 'rxjs'
import { map, shareReplay, switchMap, share, filter, tap, catchError } from 'rxjs/operators'

import { getCycleDay } from 'src/db';
import { CycleDaySchema } from 'src/db/schemas';
import { getBadTimeEvents } from 'src/lib/cal-events/event';

jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

const moment = (str: string) => jMoment(str, 'jYYYY-jMM-jDD')
const miladi = (str: string) => jMoment(str, 'jYYYY-jMM-jDD').format('YYYY-MM-DD')

interface Model {
  status: string;
  month: string;
  selectedDay: string;
  today: string;
  events: { type: string, title: string }[];
  PHN: CycleDaySchema;
  currentCycle: { start: string, cycleLength: number, bleedindLength: number };
}

export const initialModel: Model = {
  status: 'INIT',
  month: jMoment().startOf('jMonth').format('jYYYY-jMM-jDD'),
  selectedDay: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  today: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  events: [],
  PHN: {} as any,
  currentCycle: { start: '', cycleLength: 0, bleedindLength: 0 },
}

export const initialCycleDay: CycleDaySchema =  {
  date: miladi(initialModel.today),
  isBleedingDay: false,
  isCycleStart: false,
  bleeding: { value: -1, exclude: false },
  pain: {
    acne: false,
    bodyAche: false,
    backaches: false,
    bloating: false,
    constipation: false,
    cramps: false,
    diarrhea: false,
    dizziness: false,
    headache: false,
    lowerBackPain: false,
    nausea: false,
    neckaches: false,
    ovulationPain: false,
    pms: false,
    shoulderAche: false,
    tender: false,
    migraine: false,
    other: false
  },
  mood: {
    happy: false,
    sad: false,
    stressed: false,
    normal: false,
    swings: false,
    anxious: false,
    frisky: false,
    tired: false,
    angry: false,
    tense: false,
    panicky: false,
    lonely: false
  },
  sex: { value: -1 },
  mucus: {
    feeling: -1,
    texture: -1,
    value: -1,
  },
  cervix: {
    firmness: -1,
    opening: -1,
    position: -1
  },
  desire: {
    value: -1
  },
  temperature: {
    value: -1,
    time: ''
  },
  weight: {
    value: -1,
    time: ''
  },
  note: {
    value: ''
  }
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
      initialModel.currentCycle.bleedindLength = newPerLength
      return initialModel

    case 'changePeriod':
      initialModel.status = 'PERIOD_CHANGE'
      initialModel.currentCycle.bleedindLength = data.payload.periodLength
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



// Wiring

export const action$: Subject<any> = new Subject()

export const model$: Observable<Model> = action$.pipe(
  switchMap(present),
  shareReplay()
)
// no: number of month after or before of current month

  
// export const saveInitialCycleConfig = () => model$.pipe(
//   filter(m => (m.status === 'INIT')),
//   map((m: Model) => {
//     let docs: Partial<CycleDaySchema>[] = []
//     for(let i = 0; i < m.currentCycle.bleedindLength; i++) {
//       let date = moment(m.currentCycle.start).add(i, 'day').format('YYYY-MM-DD')
//       console.log(date)
//       if(date > jMoment().format('YYYY-MM-DD')) break
//       docs.push({
//         _id: `cycleday-${date}`,
//         date: date,
//         isCycleStart: i === 0 ? true : false,
//         isBleedingDay: true
//       })
//     }
//     return docs
//   }),
//   switchMap(c => saveBulkCycleDay(c as Partial<CycleDaySchema>[])),
// )



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
      mDate: jMoment(m.selectedDay, 'jYYYY-jMM-jDD').format('YYYY-MM-DD'),
      day: moment(m.selectedDay).format('jDD'),
      monthName: moment(m.selectedDay).format('jMMMM'),
      fullYear: moment(m.selectedDay).format('jYYYY'),
    }
  }),
  shareReplay()
)

export const getSelectedCycleDay = longSelectedDayObj.pipe(
  switchMap(m => from(getCycleDay(m.mDate)).pipe(catchError((x) => {console.log('not-found'); return of(initialCycleDay)}))),
  tap(console.log),
  shareReplay()
)

export const getSelectedEvents = longSelectedDayObj.pipe(
  switchMap(day => getBadTimeEvents(day.date))
)

export const calendarReloadHook = model$.pipe(
  filter(m => m.status === 'PERIOD_CHANGE'),
  map(() => Math.round(Math.random() * 100000))
)

// بعد اینو اضاف کن که اگر قبل از آخرین پریودی واقعی چیزی وارد کرد روی پریودی پیش بینی تاثیر نذار
//  برای این کار براساس مقدار diff حالتهای مختلف تعریف کن
// export const possibleClosePeriod = model$.pipe(
//   filter(m => (m.status === 'SELECTED_DAY')),
//   map(m => {
//     const diff = moment(m.selectedDay).diff(moment(m.currentCycle.start), 'days')
//     console.log(diff)
//     if (diff > 8 || diff < -m.currentCycle.bleedindLength) {
//       return ({ canPeriod: true, diff })
//     } else {
//       return ({ canPeriod: false, diff })
//     }
//   })
// )

export const dispatch = (type: string, payload?: any) => {
  model$.subscribe()
  action$.next({ type, payload })
}
