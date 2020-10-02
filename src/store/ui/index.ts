import { Dialog, Notify } from 'quasar';
import { ActionTree, MutationTree } from 'vuex';

export const SHOW_SUCCESS_TOAST = 'Show Success Notify'
export const SHOW_ERROR_TOAST = 'Show Error Notify'
export const SHOW_DIALOG = 'Show Dialog'
export const LOADING = 'Start Loading'
export const LOADING_END = 'End Loading'
export const RELOAD = 'Reload Vue Component'
export const TOGGLE_NOTE_DIAL = 'Toggle Note Dialog'
export const TOGGLE_TEMP_DIAL = 'Toggle Temperature Dialog'
export const TOGGLE_MUCUS_DIAL = 'Toggle Mucus Dialog'
export const TOGGLE_PHN_DIAL = 'Toggle PHN Dialog'

interface UiModel {
    reloadKey: number;
    loading: boolean;
    innerLoading: boolean;
    noteDialog: boolean;
    temperatureDialog: boolean;
    mucusDialog: boolean;
    phnDialog: boolean;
    showPeriodOnCalendar: boolean;
    showFertilityOnCalendar: boolean;
    showPhnOnCalendar: boolean;
}

const uiState: UiModel = {
    reloadKey: 1,
    loading: false,
    innerLoading: false,
    noteDialog: false,
    temperatureDialog: false,
    mucusDialog: false,
    phnDialog: false,
    showPeriodOnCalendar: true,
    showFertilityOnCalendar: true,
    showPhnOnCalendar: true
}

const UiMutations: MutationTree<UiModel> = {
    mutateLoading(state) {
        state.loading = !state.loading
    },
    changeReloadKey(state, key) {
        state.reloadKey = key
    },
    mutateCalendarSigns(state, payload: {period: boolean, phn: boolean, fertility: boolean}) {
        state.showFertilityOnCalendar = payload.fertility
        state.showPeriodOnCalendar = payload.period
        state.showPhnOnCalendar = payload.phn
    }
}

const UiAction: ActionTree<UiModel, any> = {
    [SHOW_SUCCESS_TOAST]({}, message) {
        Notify.create({
            message
        })
    },
    [SHOW_ERROR_TOAST]({}, message) {
        Notify.create({
            message
        })
    },
    [SHOW_DIALOG]({}, message) {
        Dialog.create({
            message: message.message,
            title: message.title
        })
    },
    [LOADING]({ commit }) {
        commit('mutateLoading')
    },
    [LOADING_END]({ commit }) {
        commit('mutateLoading')
    },
    [RELOAD]({ commit }) {
        const key = Math.random()
        commit('changeReloadKey', key)
    },
    [TOGGLE_NOTE_DIAL]({ state }) {
        state.noteDialog = !state.noteDialog
    },
    [TOGGLE_TEMP_DIAL]({ state }) {
        state.temperatureDialog = !state.temperatureDialog
    },
    [TOGGLE_MUCUS_DIAL]({ state }) {
        state.mucusDialog = !state.mucusDialog
    },
    [TOGGLE_PHN_DIAL]({ state }) {
        state.phnDialog = !state.phnDialog
    }
}

export default {
    namespaced: true,
    state: uiState,
    actions: UiAction
}
