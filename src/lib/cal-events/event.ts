
import { j2d } from 'jalaali-js'

import { from } from 'rxjs'
import { filter, map, tap, reduce, pluck } from 'rxjs/operators'

import { jdToHijri } from '../../state/helper'
import moonInSco from './bad-time.json'

const allevents = moonInSco


export const getBadTimeEvents = (date: string) => {
  const j = date.split('-').map(Number)
  const todayHijri = jdToHijri(j2d(j[0], j[1] + 1, j[2]))
  const todayHijriFormatted = `${('0' + todayHijri[1]).slice(-2)}/${('0' + todayHijri[2]).slice(-2)}`

  // return from(allevents).pipe(
  //   filter((item) => item.date === todayHijriFormatted),
  //   pluck('type'),
  //   reduce((acc: string[], cur: string): any => {
  //     acc.push(cur)
  //     return { [date]: {event: acc} }
  //   }, [])
  // )

  return allevents
  .filter((item) => item.date === todayHijriFormatted)
    .map((x: any) => ({type: x.type, title: x.title}))
  // return await self.isoWeekday() === 2 ? events.concat([{
  //   title: 'شب چهارشنبه',
  //   date: 'WNE',
  //   type: 'WNE',
  //   discription: '',
  //   id: arg1
  // }]) : events
}

// export const checkBadTime = (date, format) => getBadTimeEvents(date, format).then((e) => e.length > 0)

// export const getPHNsFromDB = (start: string, end: string) => {
//   return from(db.allDocs({
//     include_docs: true,
//     startkey: start,
//     endkey: end
//   })
//     .then((docs) => docs.rows))
// }

// export const getPHNFromDB = (id: string) => {
//   return db.get(id).catch(err => {
//     if (err.name === 'not_found') {
//       return {
//         bleedState: '',
//         sexState: '',
//         symptomState: [],
//         moodState: [],
//         period: ''
//       }
//     } else { // hm, some other error
//       throw err
//     }
//   })
// }

// export const putToDB = (id: string, doc: any) => {
//   return db.upsert(id, doc).then((res: any) => res.ok)
// }

// export const putIfNotExists = (id: any, doc: any) => {
//   return db.putIfNotExists(id, doc)
// }

// export const bulkPut = () => {
//   return false
// }

export const edit = () => {
  return false
}

// export const checkHasPHN = async (id: string) => db.get(id).then(() => true).catch(() => false)
