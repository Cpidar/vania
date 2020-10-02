import { LocalDate } from 'js-joda';
import jMoment from 'moment-jalaali'
import { CycleDaySchema } from 'src/db/schemas';
import { CycleLengthState, getCycleLengthStats } from 'src/lib/cycle-length';
import { getFertilityStatusForDay } from 'src/lib/sympto-adapter';
import { GetterTree } from 'vuex';
import { CycleState } from '../cycle/models';
import { getCycleModule } from './state'
jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

export const CycleGetter: GetterTree<CycleState, any> = {
    currentDayNumber: (state) => {
        const today = LocalDate.now().toString()
        return getCycleModule(state).getCycleDayNumber(today)
    },

    dayNumber: (state) => {
        return getCycleModule(state).getCycleDayNumber(state.date)
    },

    phn: (state) => (state.cycleDays.get(state.date, {} as CycleDaySchema)),

    menses: (state) => state.cycleDays.filter((k, v) => v.isBleedingDay),

    predictedMenses: (state) => getCycleModule(state).getPredictedMenses(),

    isMenseStart: (state) => {
        const d = { date: state.date }
        return getCycleModule(state).isMensesStart(d as CycleDaySchema)
    },

    fertilityStatus: (state) => (selectedDay: string) => {
        return getFertilityStatusForDay(state, selectedDay)
    },

    nextDays: (state) => getCycleModule(state).getMensesDaysRightAfter({ date: state.date } as CycleDaySchema),

    cycleLength: (state) => state.cycleInfo.calculatedCycleLength || state.defaultPeriodSetting.cycleLength,

    temperatureDataset: (state) => state.cycleDays.valuesArray()
    .filter(v => v.temperature)
    .reduce((acc: any, cur: CycleDaySchema, i, arr) => {
        acc.x.push(cur.date)
        acc.y.push(cur.temperature.value)
        acc.m = cur.temperature.value + acc.m
        return acc
    }, {x: [], y: [], m: 0}),

    weightDataset: (state) => state.cycleDays.valuesArray()
    .filter(v => v.weight)
    .reduce((acc: any, cur: CycleDaySchema ) => {
        acc.x.push(cur.date)
        acc.y.push(cur.temperature.value)
        return acc
    }, {x: [], y: []}),

    cycleInfo: (state) => {
        const cycleLengths = getCycleModule(state).getAllCycleLengths()
        const atLeastOneCycle = cycleLengths.length >= 1
        let numberOfCycles
        let cycleInfo = {} as CycleLengthState
        if (atLeastOneCycle) {
            numberOfCycles = cycleLengths.length
            cycleInfo.numberOfCycles = cycleLengths.length
            cycleInfo.mean = cycleLengths[0]
            if (numberOfCycles > 1) {
                cycleInfo = getCycleLengthStats(cycleLengths)
                cycleInfo.numberOfCycles = cycleLengths.length
            }
        } else {
            cycleInfo = {
                mean: state.defaultPeriodSetting.cycleLength,
                median: state.defaultPeriodSetting.cycleLength,
                maximum: state.defaultPeriodSetting.cycleLength,
                minimum: state.defaultPeriodSetting.cycleLength,
                middle: state.defaultPeriodSetting.cycleLength,
                stdDeviation: 0,
                numberOfCycles: 0
            }
        }
        return cycleInfo
    }
}
