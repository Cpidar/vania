import { model$ } from "src/state";
import { filter, take, map, observeOn, share } from "rxjs/operators";
import jMoment from 'moment-jalaali'
import { range, asapScheduler } from "rxjs";

jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

const moment = (str: string) => jMoment(str, 'jYYYY-jMM-jDD')


export const computeDaysInMonth = (counter: number, m: string) => {
    const jDate = moment(m).clone().add(counter, 'day')
    const day = jDate.jDate()
    // const hDate = add(d, persianTohijri(newMonth))
    //     .map(h => { return { day: h[0], month: h[1], year: h[2] } })[0];
    const isToday = jDate.isSame(new Date(), 'day')
    const currentMonthCond = jDate.jMonth() - moment(m).jMonth()

    return {
        jDate: jDate.format('jYYYY-jMM-jDD'),
        mDate: jDate.format('YYYY-MM-DD'),
        day,
        isToday,
        currentMonthCond
    }
}

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