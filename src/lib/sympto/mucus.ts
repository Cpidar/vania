import { SymptomShiftModel } from 'src/lib/cycle.models';

export default function(cycleDays: any, tempEvalEndIndex: number): SymptomShiftModel {
  const notDetected = { detected: false }
  const mucusDays = cycleDays.filter((day: any) => typeof day.mucus === 'number')
  let currentBestQuality = 0

  for (let i = 0; i < mucusDays.length; i++) {

    let print
    if (i === 13) {
      print = true
    } else {
      // tslint:disable-next-line:no-unused-expression
      print === false
    }
    const day = mucusDays[i]

    if (day.mucus > currentBestQuality) {
      currentBestQuality = day.mucus
    }

    // if mucus only changes from dry to nothing, it doesn't constitute a shift
    if (currentBestQuality < 2) continue

    if (day.mucus !== currentBestQuality) continue

    // the three following days must be of lower quality
    const threeFollowingDays = mucusDays.slice(i + 1, i + 4)
    if (threeFollowingDays.length < 3) continue

    const bestQualityOccursIn3FollowingDays = threeFollowingDays.some((day: any) => {
      return day.mucus >= currentBestQuality
    })
    if (bestQualityOccursIn3FollowingDays) continue

    const cycleDayIndex = cycleDays.indexOf(day)

    // if temperature evaluation has been completed an we still haven't found
    // a candidate, there is no mucus shift
    if (cycleDayIndex > tempEvalEndIndex) return notDetected

    // no best quality day may occur until temperature evaluation has
    // been completed
    const relevantDays = cycleDays
      .slice(cycleDayIndex + 1, tempEvalEndIndex + 1)
      .filter((day: any) => typeof day.mucus === 'number')

    const noBestQualityUntilEndOfTempEval = relevantDays.every((day: any) => {
      return day.mucus < currentBestQuality
    })

    if (noBestQualityUntilEndOfTempEval) {
      return {
        detected: true,
        mucusPeak: day,
        evaluationCompleteDay: threeFollowingDays[threeFollowingDays.length - 1]
      }
    }
  }

  return notDetected
}
