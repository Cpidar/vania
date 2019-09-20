// import * as jMoment from 'moment-jalaali'
import jMoment from 'moment-jalaali'
import { Moment } from 'moment-jalaali'

jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

const moment = (str: string) => jMoment(str, 'jYYYY-jMM-jDD')

const calcuteCycle = (date: Moment, start: string, cycle: number, period: number) => {
  const diffDay = date.diff(jMoment(start, 'jYYYY-jMM-jDD'), 'days')
  if (diffDay >= 0) {
    const cycleMode = diffDay % cycle
    const ovulation = cycle - 14
    if (cycleMode < period) {
      if (cycleMode === 0) {
        return 'period-start-pr'
      } else if (cycleMode < period && cycleMode === period - 1) {
        return 'period-end-pr'
      } else {
        return 'period-pr'
      }
    } else if (cycleMode >= ovulation - 5 && cycleMode <= ovulation + 1) {
      return cycleMode === ovulation ? 'ovulation-point' : 'ovulation'
    }
  }
}

export const dayState = (date: string, cycleInfo: any) => {
  const jDate = moment(date)
  // console.log(cycleInfo)
  const cycleState = calcuteCycle(jDate, cycleInfo.start, cycleInfo.cycleLength, cycleInfo.periodLength)
  // const periodStart = cycleState === 'period-start'
  // const periodEnd = cycleState === 'period-end'
  // const isPeriod = cycleState === 'period'
  // const isOvulPeriod = cycleState === 'ovulation'
  // const isOvulPoint = cycleState === 'ovulation point'
  if (cycleState) {
    return { [date]: {cycle: cycleState} }
  }
}

// export const savePerData = (start: string, length: number) => {
//   for (let i = 0; i <= length; i++) {
//     const id = moment(start).clone().add(i, 'day').format('jYYYY-jMM-jDD')
//     if (i === 0) {
//       putToDB(id, (doc: any) => {
//         doc.period = 'period-start'
//         return doc
//       })
//     } else if (i === length) {
//       putToDB(id, (doc: any) => {
//         doc.period = 'period-end'
//         return doc
//       })
//     } else {
//       putToDB(id, (doc: any) => {
//         doc.period = 'period'
//         return doc
//       })
//     }
//   }
// }
