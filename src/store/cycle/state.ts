import { LocalDate } from 'js-joda';
import BTree, { ISortedMap } from 'sorted-btree'
import { CycleDaySchema } from 'src/db/schemas';
import CycleModule from '../../lib/cycle'
import { CycleState } from './models';

const today = LocalDate.now().toString()

export const cycleState: CycleState = {
  date: today,
  defaultPeriodSetting: { start: '', periodLength: 4, cycleLength: 28},
  cycleDays: new BTree(),
  predictedMenses: {},
  menses: new Map(),
  cycleInfo: {},
  maxBreakInBleeding: 3,
  maxCycleLength: 45,
  minCyclesForPrediction: 3,
  maxBleedingLength: 8,
  currentCycleDay: {} as CycleDaySchema,
  currentCycle: [],
}

export const getCycleModule = (state: CycleState) => {
  return CycleModule({
      bleedingDaysSortedByDate: [...state.cycleDays.filter((k, v) => v.isBleedingDay).values()].reverse(),
      cycleDaysSortedByDate: [...state.cycleDays.values()].reverse(),
      cycleStartsSortedByDate: [...state.cycleDays.filter((k, v) => v.isCycleStart).values()].reverse(),
      maxBreakInBleeding: state.maxBreakInBleeding,
      maxCycleLength: state.maxCycleLength,
      minCyclesForPrediction: state.minCyclesForPrediction
  })
}
