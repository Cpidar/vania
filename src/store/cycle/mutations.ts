import { CycleDaySchema } from 'src/db/schemas';
import { MutationTree } from 'vuex'
import { CycleState } from './models';
import { ADD_CYCLE_DAY, ADD_PR_MENS, CHANGE_PERIOD_SETTING, DEL_CYCLE_DAY, INIT, SET_CYCLE_DAY, SET_DATE } from './types';

const sortedSet = (array: CycleDaySchema[], value: CycleDaySchema) => {
    for (let i = 0, len = array.length; i < len; i++) {
        if (value.date > array[i].date) {
            array.splice(i, 0, value);
            break;
        } else if (i === len - 1) {
            array.push(value)
        }
    }
    if (array.length === 0) array.push(value)
    return array;
}

export const CycleMutations: MutationTree<CycleState> = {
    [INIT](state, payload) {
        state.cycleDays = payload.cycleDays
    },

    [SET_DATE](state, date: string) {
        state.date = date
    },

    [CHANGE_PERIOD_SETTING](state, payload: any) {
        state.defaultPeriodSetting = {
            cycleLength: payload.cycleLength,
            periodLength: payload.periodLength,
            start: payload.start
        }
        state.cycleInfo.calculatedCycleLength = payload.cycleLength
    },

    [ADD_CYCLE_DAY](state, day: CycleDaySchema) {
        const cycleDay = state.cycleDays.get(day.date, {} as CycleDaySchema)
        state.cycleDays.set(day.date, Object.assign(cycleDay, day), true)
    },

    [ADD_PR_MENS](state, mesnes) {
        state.predictedMenses = mesnes
    },

    [DEL_CYCLE_DAY](state, day: CycleDaySchema) {
        state.cycleDays.delete(day.date)
    },

    [SET_CYCLE_DAY](state, cycleDay) {
        state.currentCycle = cycleDay
    }

}
