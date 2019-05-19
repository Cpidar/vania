/* eslint-disable no-unused-vars */
import { LocalDate, ChronoUnit } from 'js-joda'
import jMoment from 'moment-jalaali'
import cycleModule from '../lib/cycle'
import PouchDB from 'pouchdb'
import PouchdbFind from 'pouchdb-find'
import pouchdbUpsert from 'pouchdb-upsert'
import { CycleDaySchema, BleedingSchema } from './schemas';
import { shortSelectedDay } from 'src/state';
import { take } from 'rxjs/operators';
PouchDB.plugin(PouchdbFind)
PouchDB.plugin(pouchdbUpsert)

const miladi = (str: string) => jMoment(str, 'jYYYY-jMM-jDD').format('YYYY-MM-DD')

const db: PouchDB.Database<CycleDaySchema> = new PouchDB('mydb')

export async function getBleedingDaysSortedByDate(): Promise<CycleDaySchema[]> {
  try {
    const doc = await db.createIndex({
      index: {fields: ['bleeding', 'date']}
    }).then(() => db.find({
      selector: {
        bleeding: { $exists: true }
      },
      sort: [{ _id: 'desc' }]
    })
    )
    return doc.docs
  } catch (err) {
    console.log(err)
    return err
  }
}
export async function getTemperatureDaysSortedByDate(): Promise<CycleDaySchema[]> {
  try {
    const doc = await db.find({
      selector: {
        temperature: { $exists: true }
      },
      sort: [{ date: 'desc' }]
    })
    return doc.docs
  } catch (err) {
    console.log(err)
    return err
  }
}
export async function getCycleDaysSortedByDate() {
  try {
    const docs = await db.allDocs({
      include_docs: true,
      startkey: 'cycleday',
      endkey: 'cycleday\uffff'
    })
    return docs.rows.map(doc => doc.doc)
  } catch (err) {
    console.log(err)
    return err
  }
}

export async function getCycleStartsSortedByDate(): Promise<CycleDaySchema[]> {
  try {
    const doc = await db.find({
      selector: {
        isCycleStart: { $eq: true }
      }
    })
    const resp = doc.docs
    return resp
  } catch (err) {
    console.log(err)
    return err
  }
}

export async function saveCycleDay(sdate: string, cycleDay: Partial<CycleDaySchema>) {
  const date = miladi(sdate)
  cycleDay.date = date
  return db.upsert(`cycleday-${date}`, function (doc: any) {
    doc._id = `cycleday-${date}`
    doc = cycleDay
    return doc
  })
}

export async function saveSymptom(symptom: string, sdate: string, val: any) {
  const date = miladi(sdate)
  const cycle = await cycleModule()
  const isMensesStart = cycle.isMensesStart
  const getMensesDaysRightAfter = cycle.getMensesDaysRightAfter

  db.upsert(`cycleday-${date}`, function (cycleDay: any) {
    if (!cycleDay.date) {
      cycleDay.date = date
    }
    if (bleedingValueDeleted(symptom, val)) {
      cycleDay.bleeding = val
      cycleDay.isCycleStart = false
      maybeSetNewCycleStart(cycleDay)
    } else if (bleedingValueAddedOrChanged(symptom, val)) {
      cycleDay.bleeding = val
      cycleDay.isCycleStart = isMensesStart(cycleDay)
      maybeClearOldCycleStarts(cycleDay)
    } else {
      cycleDay[symptom] = val
    }
    return cycleDay
  })

  function maybeSetNewCycleStart(dayWithDeletedBleeding: CycleDaySchema) {
    // if a bleeding value is deleted, we need to check if
    // there are any following bleeding days and if the
    // next one of them is now a cycle start
    const mensesDaysAfter = getMensesDaysRightAfter(dayWithDeletedBleeding)
    if (!mensesDaysAfter.length) return
    const nextOne = mensesDaysAfter[mensesDaysAfter.length - 1]
    if (isMensesStart(nextOne)) {
      nextOne.isCycleStart = true
    }
  }

  function maybeClearOldCycleStarts(cycleDay: CycleDaySchema) {
    // if we have a new bleeding day, we need to clear the
    // menses start marker from all following days of this
    // menses that may have been marked as start before
    const mensesDaysAfter = getMensesDaysRightAfter(cycleDay)
    mensesDaysAfter.forEach((day: CycleDaySchema) => { day.isCycleStart = false })
  }
}

function bleedingValueDeleted(symptom: string, val: any) {
  return symptom === 'bleeding' && !val
}

function bleedingValueAddedOrChanged(symptom: string, val: any) {
  return symptom === 'bleeding' && val
}

export async function updateCycleStartsForAllCycleDays() {
  try {
    const days = await getBleedingDaysSortedByDate()
    const cycle = await cycleModule()
    const isMensesStart = cycle.isMensesStart

    return await Promise.all(days.map((day: CycleDaySchema) => {
      if (isMensesStart(day)) {
        day.isCycleStart = true
      }
      return db.put({
        ...day,
        _id: day._id,
        _rev: day._rev

      })
    })
    )
  } catch (err) {
    console.log(err)
  }
}

export function createCycleDay(dateString: string) {
  return db.upsert(`cycleday-${dateString}`, (cycleday: any) => {
    cycleday.date = dateString
    cycleday.isCycleStart = false
    return cycleday
  })
}

export function getCycleDay(dateString: string) {
  const mDate = miladi(dateString)
  console.log(mDate)
  return db.get('cycleday-' + mDate)
}

export const getCycleDaysInRange = (start: string, end?: string) => {
  const startkey = 'cycleday-' + miladi(start)
  let endkey
  if(!end) {
    endkey = 'cycleday-' + jMoment(start, 'jYYYY-jMM-jDD').add(1, 'jMonth').format('YYYY-MM-DD')
  } else {
    endkey = 'cycleday-' + miladi(end)
  }
  console.log(startkey, endkey)
  return db.allDocs({
    include_docs: true,
    startkey,
    endkey
  })
    .then((docs) => docs.rows)
}

export async function getPreviousTemperature(date: string) {
  const targetDate = LocalDate.parse(date)
  const days = await getTemperatureDaysSortedByDate()
  const winner: any = days.find(candidate => {
    return LocalDate.parse(candidate.date).isBefore(targetDate)
  })
  if (!winner) return
  return winner.temperature.value
}

// async function tryToCreateCycleDayFromImport(days) {
//   try {
//     // we cannot know this yet, gets detected afterwards
//     const newDays = days.map(day => {
//       day._id = `cycleday-${day.date}`
//       day.isCycleStart = false
//       return day
//     })
//     let resp = await db.bulkDocs(newDays)
//   } catch (err) {
//     // const msg = `Line ${i + 1}(${day.date}): ${err.message}`
//     throw new Error(msg)
//   }
// }

export async function getAmountOfCycleDays() {
  const cycleDaysSortedByDate = await getCycleDaysSortedByDate()
  const amountOfCycleDays = cycleDaysSortedByDate.length
  if (!amountOfCycleDays) return 0
  const earliest = cycleDaysSortedByDate[amountOfCycleDays - 1]
  const today = LocalDate.now()
  const earliestAsLocalDate = LocalDate.parse(earliest.date)
  return earliestAsLocalDate.until(today, ChronoUnit.DAYS)
}

// export function getSchema() {
//   return db.schema.reduce((acc, curr) => {
//     acc[curr.name] = curr.properties
//     return acc
//   }, {})
// }

export async function tryToImportWithDelete(cycleDays: CycleDaySchema[]) {
  let i = 0
  try {
    var docs = await getCycleDaysSortedByDate()
    let resp = await Promise.all(docs.rows.forEach((doc: any, index: number) => {
      i = index
      db.remove(doc)
    })
    )
    cycleDays.forEach(doc => doc.isCycleStart = false)
    return await db.bulkDocs(cycleDays)
  } catch (err) {
    // const msg = `Line ${i + 1}(${docs.date}): ${err.message}`
    // throw new Error(msg)
  }
}

export async function tryToImportWithoutDelete(cycleDays: CycleDaySchema[]) {
  let i = 0
  try {
    let resp = await Promise.all(cycleDays.map((day, i) => {
      // index = i
      db.upsert(<string>day._id, function(doc: any) {
        doc.isCycleStart = false
        return doc
      })
    })
    )
  } catch (err) {
    // const msg = `Line ${i + 1}(${day.date}): ${err.message}`
    // throw new Error(msg)
  }
}

// export function requestHash(type, pw) {
//   nodejs.channel.post('request-SHA512', JSON.stringify({
//     type: type,
//     message: pw
//   }))
// }

// export async function changeEncryptionAndRestartApp(hash) {
//   let key
//   if (hash) key = hashToInt8Array(hash)
//   const defaultPath = db.path
//   const dir = db.path.split('/')
//   dir.pop()
//   dir.push('copied.realm')
//   const copyPath = dir.join('/')
//   const exists = await fs.exists(copyPath)
//   if (exists) await fs.unlink(copyPath)
//   // for some reason, realm complains if we give it a key with value undefined
//   if (key) {
//     db.writeCopyTo(copyPath, key)
//   } else {
//     db.writeCopyTo(copyPath)
//   }
//   db.close()
//   await fs.unlink(defaultPath)
//   await fs.moveFile(copyPath, defaultPath)
//   restart.Restart()
// }

// export async function isDbEmpty() {
//   const resp = await db.info()
//   return resp.doc_count === 0
// }

// export async function deleteDbAndOpenNew() {
//   const exists = await fs.exists(Realm.defaultPath)
//   if (exists) await fs.unlink(Realm.defaultPath)
//   await openDb()
// }

// export async function clearDb() {
//   await db.destroy()
// }

// function hashToInt8Array(hash) {
//   const key = new Uint8Array(64)
//   for (let i = 0; i < key.length; i++) {
//     const twoDigitHex = hash.slice(i * 2, i * 2 + 2)
//     key[i] = parseInt(twoDigitHex, 16)
//   }
//   return key
// }
