import { LocalDate } from 'js-joda'
import { OvuPhaseModel } from 'src/lib/cycle.models';
import apply8DayRule from './minus-8-day-rule'

export default function(cycle: any, previousCycles: any, secondarySymptom: string): OvuPhaseModel {
  let preOvuPhaseLength = 5

  const minus8DayRuleResult = apply8DayRule(previousCycles, secondarySymptom)
  if (minus8DayRuleResult) preOvuPhaseLength = minus8DayRuleResult

  const startDate = LocalDate.parse(cycle[0].date)
  const preOvuEndDate = startDate.plusDays(preOvuPhaseLength - 1).toString()
  const maybePreOvuDays = cycle.slice(0, preOvuPhaseLength).filter((d: any) => {
    return d.date <= preOvuEndDate
  })
  const preOvulatoryDays = getDaysUntilFertileSecondarySymptom(maybePreOvuDays, secondarySymptom)
  // if fertile mucus or cervix occurs on the 1st cycle day, there is no pre-ovu phase
  if (!preOvulatoryDays.length) return null

  let endDate: string
  if (preOvulatoryDays.length === maybePreOvuDays.length) {
    endDate = preOvuEndDate
  } else {
    endDate = preOvulatoryDays[preOvulatoryDays.length - 1].date
  }

  return {
    cycleDays: preOvulatoryDays,
    start: {
      date: preOvulatoryDays[0].date
    },
    end: {
      date: endDate
    }
  }
}

function getDaysUntilFertileSecondarySymptom(days: any, secondarySymptom = 'mucus') {
  const firstFertileSecondarySymptomDayIndex = days.findIndex((day: any): boolean => {
    if (secondarySymptom === 'mucus') {
      return day.mucus && day.mucus > 1
    } else if (secondarySymptom === 'cervix') {
      return (day.cervix && day.cervix.opening > 0) ||
        day.cervix && day.cervix.firmness > 0
    }
    return false
  })

  if (firstFertileSecondarySymptomDayIndex > -1) {
    return days.slice(0, firstFertileSecondarySymptomDayIndex)
  }
  return days
}
