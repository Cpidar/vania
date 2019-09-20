import getTemperatureShift from './temperature'
import getMucusShift from './mucus'
import getCervixShift from './cervix'
import getPreOvulatoryPhase from './pre-ovulatory'
import { LocalDate } from 'js-joda'
import assert from 'assert'
import { CycleDaySchema, BleedingSchema } from 'src/db/schemas';
import { CycleInfo, StatusModel, PhaseModel, SymptomShiftModel } from 'src/lib/cycle.models';
import { getInitialCycleConfig } from 'src/local-storage';

export default function getSymptoThermalStatus(cycleInfo: any) {
  const { cycle, previousCycle, earlierCycles = [], secondarySymptom = 'mucus', excludePreOvu } = cycleInfo
  throwIfArgsAreNotInRequiredFormat([cycle, ...earlierCycles])

  const status: StatusModel = initializeStatus(cycle)
  console.log(status)
  // if there was no first higher measurement in the previous cycle,
  // no infertile pre-ovulatory phase may be assumed
  if (!excludePreOvu && previousCycle) {
    const statusForLast = getSymptoThermalStatus({
      cycle: previousCycle,
      secondarySymptom: secondarySymptom
    })
    if (statusForLast.temperatureShift) {
      const preOvuPhase = getPreOvulatoryPhase(
        cycle,
        [previousCycle, ...earlierCycles],
        secondarySymptom
      )
      if (preOvuPhase) {
        status.phases.preOvulatory = preOvuPhase
        if (status.phases.preOvulatory.cycleDays.length === cycle.length) {
          return status
        }
      }
    }
  }

  // TODO maybe add indicator if there was no preovuphase?
  status.phases.periOvulatory = {
    start: { date: null },
    end: { date: null },
    cycleDays: [] as CycleDaySchema[]
  }
  const periPhase = status.phases.periOvulatory

  if (status.phases.preOvulatory) {
    const prePhase = status.phases.preOvulatory
    const startDate = LocalDate.parse(prePhase.end.date).plusDays(1).toString()
    periPhase.start.date = startDate
    const lastPreDay = prePhase.cycleDays[prePhase.cycleDays.length - 1]
    periPhase.cycleDays = cycle.slice(cycle.indexOf(lastPreDay) + 1)
  } else {
    periPhase.start.date = cycle[0].date
    periPhase.cycleDays = [...cycle]
  }

  const temperatureShift = getTemperatureShift(cycle)

  if (!temperatureShift.detected) return status

  const tempEvalEndIndex = cycle.indexOf(temperatureShift.evaluationCompleteDay)

  let secondaryShift: SymptomShiftModel = {} as SymptomShiftModel
  if (secondarySymptom === 'mucus') {
    secondaryShift = getMucusShift(cycle, tempEvalEndIndex)
  } else if (secondarySymptom === 'cervix') {
    secondaryShift = getCervixShift(cycle, tempEvalEndIndex)
  }

  if (!secondaryShift.detected) return status

  let periOvulatoryEnd = {} as any
  const tempOver = (temperatureShift.evaluationCompleteDay).date
  const secondarySymptomOver = (secondaryShift.evaluationCompleteDay).date

  if (tempOver >= secondarySymptomOver) {
    periOvulatoryEnd = (temperatureShift.evaluationCompleteDay)
  } else if (secondarySymptom > tempOver) {
    periOvulatoryEnd = (secondaryShift.evaluationCompleteDay)
  }

  const previousPeriDays = periPhase.cycleDays
  const previousPeriEndIndex = previousPeriDays.indexOf(periOvulatoryEnd)

  status.phases.postOvulatory = {
    start: {
      date: periOvulatoryEnd.date,
      time: '18:00'
    },
    cycleDays: previousPeriDays.slice(previousPeriEndIndex),
    end: { date: '' }
  }

  periPhase.cycleDays = previousPeriDays.slice(0, previousPeriEndIndex + 1)
  periPhase.end = status.phases.postOvulatory.start

  if (secondarySymptom === 'mucus') {
    status.mucusShift = secondaryShift
  } else if (secondarySymptom === 'cervix') {
    status.cervixShift = secondaryShift
  }

  status.temperatureShift = temperatureShift

  return status
}

function throwIfArgsAreNotInRequiredFormat(cycles: any) {
  cycles.forEach((cycle: any) => {
    assert.ok(Array.isArray(cycle), "Cycles must be arrays.")
    assert.ok(cycle.length > 0, "Cycle must not be empty.")
    assert.equal(typeof cycle[0].isBleedingDay, 'boolean', "First cycle day should have bleeding.")
    cycle.forEach((day: any) => {
      assert.equal(typeof day.date, 'string', "Date must be given as a string.")
      assert.doesNotThrow(() => LocalDate.parse(day.date), "Date must be given in right string format.")
      if (day.temperature) assert.equal(typeof day.temperature, 'number', "Temperature value must be a number.")
      if (day.mucus) assert.equal(typeof day.mucus, 'number', "Mucus value must be a number.")
      if (day.cervix) assert.equal(typeof day.cervix.opening, 'number', "Cervix opening value must be a number.")
      if (day.cervix) assert.equal(typeof day.cervix.firmness, 'number', "Cervix firmness value must be a number.")
      if (day.mucus) assert.ok(day.mucus >= 0, "Mucus value must greater or equal to 0.")
      if (day.mucus) assert.ok(day.mucus <= 4, "Mucus value must be below 5.")
      if (day.cervix) assert.ok(day.cervix.opening >= 0, "Cervix opening value must be 0 or bigger")
      if (day.cervix) assert.ok(day.cervix.opening <= 2, "Cervix opening value must be 2 or smaller")
      if (day.cervix) assert.ok(day.cervix.firmness >= 0, "Cervix firmness value must be 0 or bigger")
      if (day.cervix) assert.ok(day.cervix.firmness <= 1, "Cervix firmness value must be 1 or smaller")
      assert.equal(typeof cycle[0].isBleedingDay, 'boolean', "Bleeding value must be a number")
    })
  })
}

const initializeStatus = (cycle: any) => {
  const status: StatusModel = {
    status: '',
    phases: {} as PhaseModel
  }
  const conf = { cycleLength: 28 }
  const cycleLength = conf.cycleLength
  const periPhaseStart = LocalDate.parse(cycle[0].date).plusDays(cycleLength - 14 -5)
  const periPhaseEnd = LocalDate.parse(cycle[0].date).plusDays(cycleLength - 14 + 1)
  status.phases.preOvulatoryStd = {
    start: { date: cycle[0].date },
    end: { date: periPhaseStart.minusDays(1).toString() },
    cycleDays: []
  }
  status.phases.periOvulatoryStd = {
    start: { date: periPhaseStart.toString() },
    end: { date: periPhaseEnd.toString() },
    cycleDays: []
  }
  status.phases.postOvulatoryStd = {
    start: { date: periPhaseEnd.toString() },
    cycleDays: []
  }

  return status
}
