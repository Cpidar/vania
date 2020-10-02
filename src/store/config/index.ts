import { LocalDate } from 'js-joda'
import { getSettingFromDB, saveNewSetting } from 'src/db'
import { dispatch } from 'src/state'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { GET_CYCLE_DAYS_FROM_DB } from '../cycle/types'

const NEW_SETTING = 'Add New Setting'

export interface ConfigState {
    username?: string;
    firstName?: string;
    lastName?: string;
    normalPeriodSetting: { lastStart: string, periodLength: number, cycleLength: number};
    isTutorialShown: boolean;
    isAppOpenedBefore: boolean;
    appLock: boolean;
    appPassword?: string;
    tempReminder: boolean;
    tempReminderDetails?: { time: string, message: string };
    periodReminder: boolean;
    periodReminderDetails?: { time: string, message: string }
}

const state: ConfigState = {
    normalPeriodSetting: { lastStart: LocalDate.now().toString(), periodLength: 4, cycleLength: 28},
    isAppOpenedBefore: false,
    isTutorialShown: false,
    appLock: false,
    tempReminder: false,
    periodReminder: false
}

const mutations: MutationTree<ConfigState> = {
    [NEW_SETTING](state, payload: Partial<ConfigState>) {
      state = Object.assign(state, payload)
      return state
    }
}

const actions: ActionTree<ConfigState, any> = {
    async init({ commit, state }) {
       const doc = await getSettingFromDB()
       dispatch('init')
       this.dispatch('cycle/' + GET_CYCLE_DAYS_FROM_DB)
       commit(NEW_SETTING, doc)
       return doc
    },
    setAppOpened({ state, commit }) {
        const newState = {...state, isAppOpenedBefore: true}
        saveNewSetting(newState).then(() => commit(NEW_SETTING, newState))
    },
    setNormalPeriodInfo({ state, commit }, normalPeriodSetting: ConfigState ['normalPeriodSetting']) {
        const periodSetting = Object.assign(state.normalPeriodSetting, normalPeriodSetting)
        const newState: ConfigState = Object.assign(state, periodSetting)
        saveNewSetting(newState).then(() => commit(NEW_SETTING, newState))
    },
    setAppLock({ state, commit }, appPassword: string) {
        const newState: ConfigState = { ...state,  appLock: true, appPassword}
        saveNewSetting(newState).then(() => commit(NEW_SETTING, newState))
    }

}

const getters: GetterTree<ConfigState, any> = {
    appOpenedBefore: (state) => state.isAppOpenedBefore,
    appLock: state => state.appLock
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
