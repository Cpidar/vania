import { CycleAction as actions } from './actions'
import { CycleGetter as getters } from './getters'
import { CycleMutations as mutations } from './mutations'
import { cycleState as state } from './state'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
