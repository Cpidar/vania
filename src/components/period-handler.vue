<template>
  <section>
        <q-btn-toggle
          v-model="model"
          push
          rounded
          unelevated
          toggle-color="purple"
          :options="[
            {value: 'one', slot: 'one'},
            {value: 'two', slot: 'two'},
          ]"
        >
          <template v-slot:one>
            <div class="row items-center no-wrap">
              <div class="text-center">
                Pick
              </div>
              <q-icon right name="directions_boat" ></q-icon>
            </div>
          </template>
  
          <template v-slot:two>
            <div class="row items-center no-wrap">
              <div class="text-center">
                Pick
              </div>
              <q-icon right name="directions_car" ></q-icon>
            </div>
          </template>

        </q-btn-toggle>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Watch, Emit, Prop } from 'vue-property-decorator'
// import { putToDB } from '../events/event'
import { dispatch, shortSelectedDay } from '../state'
import { saveSymptom } from '../db';
import { take, switchMap } from 'rxjs/operators';
import { Notify } from 'quasar'

@Component({})
export default class PeriodHandler extends Vue {
  @Prop() start: boolean
  diff = 0
  gotPeriod = false
  endPeriod = false
  startPeriodDate = ''

  created() {
  }

  @Watch('gotPeriod')
  Period() {
    if (this.gotPeriod === true) {
      shortSelectedDay.pipe(take(1), switchMap(date => saveSymptom('bleeding', date, { value: 0, exclude: false }))).subscribe( res => {
        Notify({
          message: 'success',
          color: 'purpel'
        })
      })
    } else {
      dispatch('removePeriod')
    }
  }

  @Emit('period')
  changePeriod() {
    return this.diff
  }
}
</script>

<style lang="stylus" scoped>
</style>
