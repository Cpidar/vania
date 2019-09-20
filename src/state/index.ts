
import jMoment from 'moment-jalaali'
import { from, Observable, of, Subject } from 'rxjs'
import { catchError, map, share, shareReplay, switchMap, take } from 'rxjs/operators'

import { getCycleDay, saveBulkCycleDay } from 'src/db';
import { CycleDaySchema } from 'src/db/schemas';
import { getBadTimeEvents } from 'src/lib/cal-events/event';
import CycleModule from 'src/lib/cycle'
import { getFertilityStatusForDay } from 'src/lib/sympto-adapter';
import { saveInitialCycleConfig } from 'src/local-storage';

jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

const moment = (str: string) => jMoment(str, 'jYYYY-jMM-jDD')

export interface Model {
  status: string;
  month: string;
  selectedDay: string;
  today: string;
  events: Array<{ type: string, title: string }>;
  PHN: CycleDaySchema;
  lazyMonthList: string[];
  menses: Map<string, string>;
  currentCycle: CycleDaySchema[];
  // currentCycle: { start: string, cycleLength: number, bleedindLength: number };
}

export interface LongDateModel {
  date: string;
  mDate: string;
  day: string;
  monthName: string;
  fullYear: string;
}

export const initialModel: Model = {
  status: 'INIT',
  month: jMoment().startOf('jMonth').format('jYYYY-jMM-jDD'),
  selectedDay: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  today: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  events: [],
  PHN: {} as CycleDaySchema,
  lazyMonthList: [],
  menses: new Map(),
  currentCycle: []
}

export const present = async (data: { type: string, payload: any}) => {
  switch (data.type) {
    case 'init':
      initialModel.status = 'INIT'
      // const bleedingDays = await getBleedingDaysSortedByDate().then(days => days.map(day => day.date))
      // initialModel.bleedingDaysSortedByDate = new Set(bleedingDays)
      const menses = await CycleModule().then(cycle => cycle.getMenses())
      const predictedMenses = await CycleModule().then(cycle => cycle.getPredictedMenses())
      initialModel.menses = new Map([...menses, ...predictedMenses])
      return initialModel

    case 'selectDay':
      initialModel.status = 'SELECTED_DAY'
      initialModel.selectedDay = data.payload.selectedDay
      initialModel.events = data.payload.events
      initialModel.PHN = data.payload.phn
      return initialModel

    case 'ADD_PHN':
      initialModel.status = 'PHN_ADDED'

    default:
      return initialModel
  }
}

export const importInitialCycleConfig = (m: any) => {
  saveInitialCycleConfig(m)
  const docs: Array<Partial<CycleDaySchema>> = []
  for (let i = 0; i < m.bleedindLength; i++) {
    const date = moment(m.start).add(i, 'day').format('YYYY-MM-DD')
    if (date > jMoment().format('YYYY-MM-DD')) break
    docs.push({
      _id: `cycleday-${date}`,
      date,
      isCycleStart: i === 0 ? true : false,
      isBleedingDay: true
    })
  }
  return saveBulkCycleDay(docs)
}

// Wiring

export const action$: Subject<any> = new Subject()

export const model$: Observable<Model> = action$.pipe(
  switchMap(present),
  shareReplay()
)

// no: number of month after or before of current month
export const getMonthList = (no: number) => model$.pipe(
  take(1),
  map((m: Model) => {
      const ar = Array.from({ length: 2 * no + 1 }, (v, i) => i - no)
      return ar.map(v => moment(m.month).clone().add(v, 'jMonth').format('jYYYY-jMM-jDD'))
  })
)

export const shortSelectedDay = model$.pipe(
  // filter(m => (m.status === ('INIT' || 'SELECTED_DAY'))),
  // distinctUntilKeyChanged('selectedDay'),
  map((m) => moment(m.selectedDay).format('jYYYY-jMM-jDD')),
  share()
)

export const longSelectedDayObj: Observable<LongDateModel> = model$.pipe(
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

export const fertilityStatus = longSelectedDayObj.pipe(
  switchMap(m => getFertilityStatusForDay(m.mDate)),
)

export const getSelectedCycleDay = longSelectedDayObj.pipe(
  switchMap(m => from(getCycleDay(m.mDate)).pipe(catchError(() => {console.log('not-found'); return of({})}))),
  shareReplay()
)

export const getSelectedEvents = longSelectedDayObj.pipe(
  switchMap(day => getBadTimeEvents(day.date))
)

export const getMenses = from(
  CycleModule().then(cm => new Map([...cm.getMenses(), ...cm.getPredictedMenses()]))
).pipe(shareReplay())

export const dispatch = (type: string, payload?: any) => {
  model$.subscribe()
  action$.next({ type, payload })
}
