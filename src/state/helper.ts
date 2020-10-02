import jMoment from 'moment-jalaali'
import { add, findIndex, identity, last, memoizeWith, prepend, scan, tail } from 'ramda'
// for unit testing
// import * as jMoment from 'moment-jalaali'
jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

export const toPersianDigit = (a: any) => {
  if (typeof a === 'number') {
    a = a.toString()
  }
  // tslint:disable-next-line:only-arrow-functions
  return a.replace(/\d+/g, function(digit: any) {
    const enDigitArr = []

    const peDigitArr = []

    for (let i = 0; i < digit.length; i++) {
      enDigitArr.push(digit.charCodeAt(i))
    }

    // tslint:disable-next-line:prefer-for-of
    for (let j = 0; j < enDigitArr.length; j++) {
      peDigitArr.push(
        String.fromCharCode(enDigitArr[j] + (!!a && a === true ? 1584 : 1728))
      )
    }
    return peDigitArr.join('')
  })
}

const jdStart = 2453766
const startYear = 1427

const hijriMonth = [
  [1427, 30, 29, 29, 30, 29, 30, 30, 30, 30, 29, 29, 30],
  [1428, 29, 30, 29, 29, 29, 30, 30, 29, 30, 30, 30, 29],
  [1429, 30, 29, 30, 29, 29, 29, 30, 30, 29, 30, 30, 29],
  [1430, 30, 30, 29, 29, 30, 29, 30, 29, 29, 30, 30, 29],
  [1431, 30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29],
  [1432, 30, 30, 29, 30, 30, 30, 29, 29, 30, 29, 30, 29],
  [1433, 29, 30, 29, 30, 30, 30, 29, 30, 29, 30, 29, 30],
  [1434, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29],
  [1435, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30, 29, 30],
  [1436, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30],
  [1437, 29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30],
  [1438, 29, 30, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30],
  [1439, 29, 30, 30, 30, 30, 29, 30, 29, 29, 30, 29, 29],
  [1440, 30, 29, 30, 30, 30, 29, 30, 29, 30, 29, 30, 30]
]

const g2d = (gy: number, gm: number, gd: number) => (div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd - 34840408 -
    div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) +
    752)

// tslint:disable-next-line:no-bitwise
const div = (a: number, b: number) => ~~(a / b)
// tslint:disable-next-line:no-bitwise
const mod = (a: number, b: number) => a - ~~(a / b) * b

const getJdHijri: any = (months: number[][], start: any) => {
  const [h, ...t] = months
  const jdHead = scan(add, start, tail(h))

  return t.length === 0 ? [jdHead] : prepend(jdHead, getJdHijri(t, last(jdHead)))
}

// @ts-ignore
const jdHijriMonth = memoizeWith(identity, getJdHijri)(hijriMonth, jdStart)

// @ts-ignore
export const jdToHijri = (jd) => {
  const jdHijriTable = jdHijriMonth
  const start = startYear

  // @ts-ignore
  const yearIndex = jdHijriTable.map((x) => x[0]).filter((x) => x < jd).length - 1
  const year = start + yearIndex
  const month = findIndex((x) => x >= jd, jdHijriTable[yearIndex])
  const day = jd - jdHijriTable[yearIndex][month - 1]
  return [year, month, day]
}

// @ts-ignore
export const plus = (day, start) => jdToHijri(g2d(start[0], start[1], start[2]) + day)

// tslint:disable-next-line:max-line-length
// export const persianTohijri = (g) => R.compose(jdToHijri, g2d)(gy, gm, gd)

// const persionToJd = (y, m, d) => {
//     const PERSIAN_EPOCH = 1948321;

//     let epBase = y >= 0 ? y - 474 : y - 473;
//     let epYear = 474 + (epBase % 2820);

//     let mDays = m <= 7 ? (m - 1) * 31 : (m - 1) * 30 + 6;

//     return d + mDays + ((epYear * 682) - 110) / 2816 + (epYear - 1) * 365
//     + (epBase / 2820) * 1029983 + (PERSIAN_EPOCH - 1);
// }
