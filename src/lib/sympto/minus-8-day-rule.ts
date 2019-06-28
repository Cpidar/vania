import { LocalDate } from 'js-joda'
import getNfpStatus from './index'
import { CycleDaySchema } from 'src/db/schemas';

export default function (previousCycles: any, secondarySymptom: string) {
  const fhms = previousCycles
    .map((cycle: any) => {
      const status = getNfpStatus({ cycle, secondarySymptom })
      if (status.temperatureShift) {
        const day = status.temperatureShift.firstHighMeasurementDay
        const firstCycleDayDate = LocalDate.parse(cycle[0].date)
        const fhmDate = LocalDate.parse(day.date)
        return fhmDate.compareTo(firstCycleDayDate) + 1
      }
      return null
    })
    .filter((val: any) => typeof val === 'number')

  const preOvuLength = Math.min(...fhms) - 8

  // pre ovu length may only be lengthened if we have more than 12 previous fhms
  // if pre ovu length is less than 5, it shortened even with fewer prev fhms
  if (preOvuLength < 5) return preOvuLength
  if (fhms.length >= 12) return preOvuLength

  return null
}
