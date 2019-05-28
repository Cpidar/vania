// @ts-nocheck

import getFertilityStatus from './sympto'
import cycleModule from 'src/lib/cycle'
import { useCervixObservable } from 'src/local-storage'
import { fertilityStatus as labels } from 'src/i18n/fa/labels'
import { CycleDaySchema } from 'src/db/schemas';
import { CycleInfo, StatusModel, OvuPhaseModel, FertalityStatus } from './cycle.models'

export async function getFertilityStatusForDay(dateString: string) {
  const status = await getCycleStatusForDay(dateString)
  if (!status) {
    return {
      status: labels.fertile,
      phase: null
    }
  }

  const phases = Object.keys(status.phases)
  const phaseNameForDay = phases.find(phaseName => {
    const phase = status.phases[phaseName]
    const dayIsAfterPhaseStart = dateString >= phase.start.date
    let dayIsBeforePhaseEnd
    if (phase.end) {
      dayIsBeforePhaseEnd = dateString <= phase.end.date
    } else {
      dayIsBeforePhaseEnd = true
    }
    return dayIsAfterPhaseStart && dayIsBeforePhaseEnd
  })

  // if there's only cycle data for the pre phase and the target day is after its end,
  // the day is in the peri phase
  if (phases.length === 1 && phases[0] === 'preOvulatory' && !phaseNameForDay) {
    return formatStatus('periOvulatory', dateString, {phases: {periOvulatory: {} as OvuPhaseModel}})
  }

  return formatStatus(phaseNameForDay, dateString, status)
}

export async function getCycleStatusForDay(dateString: string, opts?: any) {
  let options = opts || { excludeEarlierCycles: false }
  const {
    getCycleForDay,
    getCyclesBefore,
    getPreviousCycle
  } = await cycleModule()

  const cycle = getCycleForDay(dateString)
  if (!cycle) return null

  const cycleInfo:  CycleInfo = {cycle: formatCycleForSympto(cycle), secondarySymptom: ''}

  const previousCycle = getPreviousCycle(dateString)

  if (previousCycle) {
    cycleInfo.previousCycle = formatCycleForSympto(previousCycle)
  }
  if (previousCycle && !options.excludeEarlierCycles) {
    const earlierCycles = getCyclesBefore(previousCycle[0])
    if (earlierCycles) {
      cycleInfo.earlierCycles = (earlierCycles as CycleDaySchema[][]).map(formatCycleForSympto)
    }
  }

  cycleInfo.secondarySymptom = useCervixObservable.value ? 'cervix' : 'mucus'

  return getFertilityStatus(cycleInfo)
}

function formatStatus(phaseNameForDay: string, dateString: string, status: StatusModel): FertalityStatus {
  const mapping: { [key: string]: any } = {
    preOvulatory: () => {
      return {
        status: labels.infertile,
        phase: 1,
        statusText: labels.preOvuText
      }
    },
    periOvulatory: (dateString: string, status: StatusModel) => {
      // there might not actually be any data for the phase
      const peri = status.phases.periOvulatory
      const phaseEnd = peri && peri.end
      let s: string
      if (phaseEnd && phaseEnd.date === dateString) {
        s = labels.fertileUntilEvening
      } else {
        s = labels.fertile
      }
      return {
        status: s,
        phase: 2,
        statusText: labels.periOvuText
      }
    },
    postOvulatory: (dateString: string, status: StatusModel) => {
      return {
        status: labels.infertile,
        phase: 3,
        statusText: labels.postOvuText(status.temperatureShift.rule)
      }
    }
  }

  return mapping[phaseNameForDay](dateString, status)
}

function formatCycleForSympto(cycle: CycleDaySchema[]): CycleDaySchema[] {
  const formatted = cycle.reduce((acc: CycleDaySchema[], oldDay) => {
    // deep clone
    const day = JSON.parse(JSON.stringify(oldDay));
    // remove excluded symptoms
    ['bleeding', 'temperature', 'mucus', 'cervix'].forEach(symptomName => {
      if (day[symptomName] && day[symptomName].exclude) {
        delete day[symptomName]
      }
    })
    // remove days with incomplete cervix values
    if (hasIncompleteCervixValue(day)) {
      delete day.cervix
    }
    // remove days with incomplete mucus value (because nfp-mucus returns null when that's the case)
    if (day.mucus && day.mucus.value === null) {
      delete day.mucus
    }
    // change format
    ['bleeding', 'temperature', 'mucus'].forEach(symptomName => {
      if (day[symptomName]) day[symptomName] = day[symptomName].value
    })
    acc.push(day)
    return acc
  }, [])
  // we get earliest last, but sympto wants earliest first
  formatted.reverse()
  return formatted
}

function hasIncompleteCervixValue(day: CycleDaySchema) {
  return day.cervix && (typeof day.cervix.opening != 'number' || typeof day.cervix.firmness != 'number')
}

