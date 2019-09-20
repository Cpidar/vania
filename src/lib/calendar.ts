import jMoment from 'moment-jalaali'
import { animationFrameScheduler, BehaviorSubject, range } from 'rxjs';
import { bufferCount, exhaustMap, observeOn, shareReplay, withLatestFrom } from 'rxjs/operators';

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

export const currentMonth = new BehaviorSubject(jMoment().startOf('jMonth').format('jYYYY-jMM-jDD'))

export const daysPattern = currentMonth.pipe(
    exhaustMap((month) => range(-moment(month).clone().weekday(), 42))
    // share()
    // subscribeOn(asyncScheduler),
)
export const daysInMonth = daysPattern.pipe(
    observeOn(animationFrameScheduler),
    withLatestFrom(currentMonth, (d, m) => computeDaysInMonth(d, m)),
    bufferCount(42),
    shareReplay()
)
