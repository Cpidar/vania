import jMoment from 'moment-jalaali'
import { Observable, Subject } from 'rxjs'
import { map, share, shareReplay, switchMap, take } from 'rxjs/operators'
import { getBadTimeEvents } from 'src/lib/cal-events/event';

jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

const moment = (str: string) => jMoment(str, 'jYYYY-jMM-jDD')

export interface Model {
  status: string;
  month: string;
  monthSlide: number;
  selectedDay: string;
  today: string;
  events: any[];
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
  monthSlide: 10,
  selectedDay: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  today: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  events: []
}

export const present = async (data: { type: string, payload: any}) => {
  switch (data.type) {
    case 'init':
      initialModel.status = 'INIT'
      return initialModel

    case 'selectDay':
      initialModel.status = 'SELECTED_DAY'
      initialModel.selectedDay = data.payload.selectedDay
      initialModel.events = data.payload.events
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

export const longTodayObj: Observable<LongDateModel> = model$.pipe(
  // distinctUntilKeyChanged('selectedDay'),
  // filter(m => (m.status === ('INIT' || 'SELECTED_DAY'))),
  map((m) => {
    return {
      date: m.today,
      mDate: jMoment(m.today, 'jYYYY-jMM-jDD').format('YYYY-MM-DD'),
      day: moment(m.today).format('jDD'),
      monthName: moment(m.today).format('jMMMM'),
      fullYear: moment(m.today).format('jYYYY'),
    }
  }),
  shareReplay()
)

export const getSelectedEvents = longSelectedDayObj.pipe(
  switchMap(day => getBadTimeEvents(day.date))
)

export const dispatch = (type: string, payload?: any) => {
  model$.subscribe()
  action$.next({ type, payload })
}
