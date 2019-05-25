import { LocalDate, ChronoUnit } from 'js-joda'
import jMoment from 'moment-jalaali'
import cycleModule from '../lib/cycle'
import PouchDB from 'pouchdb'
import PouchdbFind from 'pouchdb-find'
import pouchdbUpsert from 'pouchdb-upsert'
import { CycleDaySchema } from './schemas';
PouchDB.plugin(PouchdbFind)
PouchDB.plugin(pouchdbUpsert)

const db: PouchDB.Database<CycleDaySchema> = new PouchDB('mydb')

export async function getBleedingDaysSortedByDate(): Promise<CycleDaySchema[]> {
  try {
    const doc = await db.createIndex({
      index: {fields: ['bleeding', 'date']}
    }).then(() => db.find({
      selector: {
        isBleedingDay: { $eq: true }
      },
      sort: [{ _id: 'desc' }]
    })
    )
    return doc.docs.map(day => { delete day._rev; return day })
  } catch (err) {
    console.log(err)
    return null
  }
}
export async function getTemperatureDaysSortedByDate(): Promise<CycleDaySchema[]> {
  try {
    const doc = await db.find({
      selector: {
        temperature: { $exists: true }
      },
      sort: [{ _id: 'desc' }]
    })
    return doc.docs.map(day => { delete day._rev; return day })
  } catch (err) {
    console.log(err)
    return err
  }
}
export async function getCycleDaysSortedByDate() {
  try {
    const docs = await db.allDocs({
      include_docs: true,
      endkey: 'cycleday',
      startkey: 'cycleday\uffff',
      descending: true
    })
    return docs.rows.map(doc => { delete doc.doc._rev; return doc.doc })
  } catch (err) {
    console.log(err)
    return null
  }
}

export async function getCycleStartsSortedByDate(): Promise<CycleDaySchema[]> {
  try {
    const doc = await db.find({
      selector: {
        isCycleStart: { $eq: true }
      },
      sort: [{ _id: 'desc' }]
    }).then(res => res.docs)
    const resp = doc.map(day => { delete day._rev; return day })
    return resp
  } catch (err) {
    console.log(err)
    return null
  }
}

export async function saveCycleDay(date: string, cycleDay: Partial<CycleDaySchema>) {
  cycleDay.date = date
  return db.upsert(`cycleday-${date}`, function (doc: any) {
    doc._id = `cycleday-${date}`
    doc = cycleDay
    return doc
  })
}

export async function saveBulkCycleDay(cycleDays: Partial<CycleDaySchema>[]) {
  return db.bulkDocs(cycleDays as any)
}

export async function saveSymptom(symptom: string, date: string, val: any) {
  const cycle = await cycleModule()
  const isMensesStart = cycle.isMensesStart
  const getMensesDaysRightAfter = cycle.getMensesDaysRightAfter
  console.log(date)

  return db.upsert(`cycleday-${date}`, function (cycleDay: any) {
    if (!cycleDay.date) {
      cycleDay.date = date
    }
    if (bleedingValueDeleted(symptom, val)) {
      cycleDay.bleeding = val
      cycleDay.isCycleStart = false
      cycleDay.isBleedingDay = true
      maybeSetNewCycleStart(cycleDay)
    } else if (bleedingValueAddedOrChanged(symptom, val)) {
      cycleDay.bleeding = val
      cycleDay.isBleedingDay = true
      cycleDay.isCycleStart = isMensesStart(date)
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
    if (isMensesStart(nextOne.date)) {
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
      if (isMensesStart(day.date)) {
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
    return null
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
  console.log(dateString)
  return db.get('cycleday-' + dateString)
}

export const getCycleDaysInRange = (start: string, end?: string) => {
  const startkey = 'cycleday-' + start
  let endkey
  if(!end) {
    endkey = 'cycleday-' + jMoment(start, 'jYYYY-jMM-jDD').add(1, 'jMonth').format('YYYY-MM-DD')
  } else {
    endkey = 'cycleday-' + end
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
    let resp = await db.allDocs({
      endkey: 'cycleday',
      startkey: 'cycleday\uffff'
    }).then( res => {
      return Promise.all(res.rows.map((doc) => {
        return db.remove(doc.id, doc.value.rev)
      })
    )
    })
    
    cycleDays.forEach(doc => doc.isCycleStart = false)
    return await db.bulkDocs(cycleDays)
  } catch (err) {
    // const msg = `Line ${i + 1}(${docs.date}): ${err.message}`
    // throw new Error(msg)
    return null
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
    return resp
  } catch (err) {
    // const msg = `Line ${i + 1}(${day.date}): ${err.message}`
    // throw new Error(msg)
    return null
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
