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
import { Notify } from 'quasar'
import { switchMap, take } from 'rxjs/operators';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { saveSymptom } from '../db';
// import { putToDB } from '../events/event'
import { dispatch, shortSelectedDay } from '../state'

@Component({})
export default class PeriodHandler extends Vue {
  @Prop() public start: boolean
  public diff = 0
  public gotPeriod = false
  public endPeriod = false
  public startPeriodDate = ''

  @Watch('gotPeriod')
  public Period() {
    if (this.gotPeriod === true) {
      shortSelectedDay.pipe(take(1), switchMap(date => {
        return saveSymptom('bleeding', date, { value: 0, exclude: false });
      })).subscribe( res => {
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
  public changePeriod() {
    return this.diff
  }
}
</script>

<style lang="stylus" scoped>
</style>
