import { Plugins } from '@capacitor/core';
import { ActionTree, MutationTree } from 'vuex'
const { Storage } = Plugins

export interface IProps {
    endProcess: (pinCode: string, isErrorValidation?: boolean) => void
    getCurrentLength?: (length: number) => void
    passwordLength: number
    pinCodeStatus?: 'initial' | 'success' | 'failure' | 'locked'
    pinCodeVisible?: boolean
    previousPin?: string
    status: PinStatus
    subtitle: string
    subtitleError: string
    titleAttemptFailed?: string
    titleConfirmFailed?: string
    titleValidationFailed?: string
}

export interface IState {
    status: PinStatus
    pinCodeStatus: PinResultStatus
    password: string
    showError: boolean
    attemptFailed: boolean
    changeScreen: boolean
    locked: boolean
}

export enum PinStatus {
    choose = 'choose',
    confirm = 'confirm',
    enter = 'enter'
}

export enum PinResultStatus {
    initial = 'initial',
    success = 'success',
    failure = 'failure',
    locked = 'locked'
}

export enum ActionEnum {
    INIT_PINE = 'Get Password From DB',
    ENTER = 'Check Pin and Enter',
    NEW_PIN = 'Set New Pin',
    CHOOSE = 'New Pin',
    CONFIRM = 'confirm new pin'
}

enum MutationEnum {
    SET_PASS = 'Set New Password',
    SET_SCREEN = 'Set Screen Status',
    SET_RESULT = 'Set Pin Result Status'
}

export const state: IState = {
    status: PinStatus.enter,
    pinCodeStatus: PinResultStatus.initial,
    password: '',
    showError: false,
    attemptFailed: false,
    changeScreen: false,
    locked: false
}

export const mutations: MutationTree<IState> = {
    [MutationEnum.SET_SCREEN](state, status) {
        state.status = status
    },

    [MutationEnum.SET_PASS](state, pass: string) {
        state.password = pass
        state.showError = false
    },

    [MutationEnum.SET_RESULT](state, status) {
        state.pinCodeStatus = status
        if (status === PinResultStatus.failure) {
            state.showError = true
        } else if (status === PinResultStatus.locked) {
            state.showError = true
            state.locked = true
        } else {
            state.showError = false
        }
    }
}

export const actions: ActionTree<IState, any> = {
    async [ActionEnum.INIT_PINE]({ state, commit }) {
        try {
          const { value } = await Storage.get({ key: 'password' })
          commit(MutationEnum.SET_PASS, value || '')
        } catch {
          commit(MutationEnum.SET_RESULT, PinResultStatus.failure)
        }
    },

    // [ActionEnum.NEW_PIN]({ state, commit }) {
    //     if(state.password) {
    //         commit(MutationEnum.SET_SCREEN, PinStatus.enter)
    //     }
    // }

    // async [ActionEnum.CHOOSE]({ commit }, pass: string) {
    //     commit(MutationEnum.SET_SCREEN, PinStatus.choose)
    //     commit(MutationEnum.SET_PASS, pass)
    // },

    async [ActionEnum.CONFIRM]({ state, commit }, pass: string) {
        const oldPass = state.password
        if (state.password === pass) {
            await Storage.set({ key: 'password', value: pass })
        }
    }
}

export const getters = {}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
