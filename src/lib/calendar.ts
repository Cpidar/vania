import { map, observeOn, share } from "rxjs/operators";
import jMoment from 'moment-jalaali'
import { range, asapScheduler, asyncScheduler } from "rxjs";

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



export const daysInMonth = (month: string) => range(-moment(month).clone().weekday(), 42).pipe(
    // observeOn(asyncScheduler),
    map((m) => computeDaysInMonth(m, month)),
    // tap(console.log),
    observeOn(asyncScheduler),
    share()
)
