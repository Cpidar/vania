import { LocalDate } from 'js-joda';
import jMoment from 'moment-jalaali'
import { getCycleDay, getCycleDaysSortedByDate, saveBulkCycleDay, saveCycleDay } from 'src/db'
import { BleedingSchema, CycleDaySchema } from 'src/db/schemas';
import { ActionTree } from 'vuex'
import { CycleState } from '../cycle/models'
import {
    ADD_CYCLE_DAY,
    ADD_PR_MENS,
    DEL_CYCLE_DAY,
    DEL_PERIOD,
    END_PERIOD,
    GET_CYCLE_DAYS_FROM_DB,
    GET_PR_MENS,
    GET_SYMPTOM,
    SAVE_PHN,
    SET_CYCLE_DAY,
    START_PERIOD
} from '../cycle/types'
import { RELOAD, SHOW_ERROR_TOAST, SHOW_SUCCESS_TOAST } from '../ui';
import { getCycleModule } from './state'

jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

export const CycleAction: ActionTree<CycleState, any> = {
    [GET_SYMPTOM]({ commit, dispatch }, date: string) {
        getCycleDay(date)
            .then((cycleDay: any) => commit(SET_CYCLE_DAY, cycleDay))
            .catch(() => dispatch('UiStore/' + SHOW_ERROR_TOAST, 'some message', { root: true }))
    },

    [SAVE_PHN]({ commit, state, dispatch }, symptom: CycleDaySchema) {
        commit(ADD_CYCLE_DAY, symptom)
        const newSymptom = state.cycleDays.get(symptom.date)
        saveCycleDay(newSymptom)
            .then(() => dispatch('UiStore/' + SHOW_SUCCESS_TOAST, 'some message', { root: true }))
            .catch((e) => {
                console.log(e)
                commit(DEL_CYCLE_DAY, symptom)
                dispatch('UiStore/' + SHOW_ERROR_TOAST, 'some message', { root: true })
            })
    },

    [GET_CYCLE_DAYS_FROM_DB]({ commit, dispatch }) {
        getCycleDaysSortedByDate()
            .then(days => days.forEach(day => commit(ADD_CYCLE_DAY, day)))
            .catch(() => {
                dispatch('UiStore/' + SHOW_ERROR_TOAST, 'some message', { root: true })
                commit(ADD_CYCLE_DAY, {})
            })
    },

    [START_PERIOD]({ commit, state, dispatch, rootState  }, startDate) {
        const start = LocalDate.parse(startDate)
        const length = rootState.Config.normalPeriodSetting.periodLength
        
        for (let i = 0; i < length; i++) {
            const date = start.plusDays(i)
            if (date.isAfter(LocalDate.now())) {
                state.predictedMenses[date.toString()] = i === length - 1 ? 'period-pr-end' : 'period-pr'
            } else {
                const day = state.cycleDays.get(date.toString(), {} as CycleDaySchema)
                // day._id = `cycleday-${date.toString()}`
                day.date = date.toString()
                day.isCycleStart = i === 0 ? true : false
                day.isBleedingEnd = (i === length - 1 && !day.isBleedingDay) ? true : false
                day.isBleedingDay = true
                dispatch(SAVE_PHN, day)
            }
        }
        // newBleedingDays.forEach(day => saveCycleDay(day)
        //     .then(() => dispatch('UiStore/' + RELOAD, { root: true }))
        //     .catch(() => {
        //             day.isBleedingDay = false
        //             day.isBleedingEnd = false
        //             day.isCycleStart = false
        //             day.bleeding = {} as BleedingSchema
        //             commit(ADD_CYCLE_DAY, day)
        //             dispatch('UiStore/' + SHOW_ERROR_TOAST, 'some message', { root: true })
        //     })
        // )
    },

    [END_PERIOD]({ commit, state, dispatch }, payload: { dayNumber: number, endDate: string }) {      
        const endDate = payload.endDate
        const localDate = LocalDate.parse(endDate)
        const currentBleedingDay = state.cycleDays.get(endDate, {date: endDate} as CycleDaySchema)

            if(currentBleedingDay.isBleedingDay) {
                currentBleedingDay.isBleedingEnd = true
                dispatch(SAVE_PHN, currentBleedingDay)

                let i = 1
                while(true) {
                    const date = localDate.plusDays(i)
                    const bleedingDay = state.cycleDays.get(date.toString(), {} as CycleDaySchema)
                    if (bleedingDay.isBleedingDay){
                        bleedingDay.isBleedingEnd = false
                        bleedingDay.isBleedingDay = false
                        bleedingDay.isCycleStart = false
                        bleedingDay.isBleedingEnd = false
                        bleedingDay.bleeding = {} as BleedingSchema
                        dispatch(SAVE_PHN, bleedingDay)
                    } else {
                        break
                    }
                    i++
                } 
            } else {
                // currentBleedingDay.date = endDate
                currentBleedingDay.isCycleStart = false
                currentBleedingDay.isBleedingDay = true
                currentBleedingDay.isBleedingEnd = true
                dispatch(SAVE_PHN, currentBleedingDay)

                let i = 1
                while(true) {
                    const date = localDate.minusDays(i)
                    const bleedingDay = state.cycleDays.get(date.toString(), {date: date.toString()} as CycleDaySchema)
                    if (bleedingDay.isBleedingEnd){
                        bleedingDay.isBleedingEnd = false
                        dispatch(SAVE_PHN, bleedingDay)
                        break
                    } else {
                        bleedingDay.isBleedingDay = true
                        bleedingDay.isCycleStart = false
                        bleedingDay.isBleedingEnd = false
                        bleedingDay.bleeding = {} as BleedingSchema
                        dispatch(SAVE_PHN, bleedingDay)
                    }
                    i++
                }
            }
        // const dayNo = payload.dayNumber - 1
        // const start = localDate.minusDays(dayNo)
        // for (let i = 0; i <= dayNo; i++) {
        //     const date = start.plusDays(i)
        //     const newBleedingDay = {
        //         date: date.toString(),
        //         isCycleStart: i === 0 ? true : false,
        //         isBleedingDay: true,
        //         isBleedingEnd: i === dayNo ? true : false
        //     }
        //     dispatch(SAVE_PHN, newBleedingDay)
        // }

        // const cycle = getCycleModule(state)
        // const nextBleedingDay = cycle.getMensesDaysRightAfter({ date: endDate } as CycleDaySchema)
        // console.log(nextBleedingDay)
        // nextBleedingDay.forEach(bleedingDay => {
        //     bleedingDay.isBleedingDay = false
        //     bleedingDay.isCycleStart = false
        //     bleedingDay.isBleedingEnd = false
        //     bleedingDay.bleeding = {} as BleedingSchema
        //     dispatch(SAVE_PHN, bleedingDay)
        // })
    },

    [DEL_PERIOD]({ commit, state, dispatch }, startDate: string) {
        const start = LocalDate.parse(startDate)
        let i = 0
        while (true) {
            const date = start.plusDays(i)
            if (date.isAfter(LocalDate.now())) break
            const bleedingDay = state.cycleDays.get(date.toString())
            if (bleedingDay.isBleedingEnd) {
                bleedingDay.isBleedingDay = false
                bleedingDay.isCycleStart = false
                bleedingDay.bleeding = {} as BleedingSchema
                bleedingDay.isBleedingEnd = false
                dispatch(SAVE_PHN, bleedingDay)
                break
            } else {
                bleedingDay.isBleedingDay = false
                bleedingDay.isCycleStart = false
                bleedingDay.bleeding = {} as BleedingSchema
                dispatch(SAVE_PHN, bleedingDay)
            }
            i++
        }
    },

    [GET_PR_MENS]({ commit, state }) {
        const pr = getCycleModule(state).getPredictedMenses()
        commit(ADD_PR_MENS, pr)
    }

}
