<template>
  <div>
    <q-list>
      <q-item>
        <q-item-main>
          <q-field
            icon="local_atm"
            label="طول پریود"
          >
            <q-btn color="primary" @click="changeCycleLength">Pick</q-btn>
          </q-field>
        </q-item-main>
      </q-item>
      <q-item>
        <q-item-main>
          <q-field
            icon="local_atm"
            label="طول دوره"
          >
            <q-slider
              class="dark"
              v-model="cycleLength"
              :min="18"
              :max="38"
              label-always
            />
          </q-field>
        </q-item-main>
      </q-item>
      <q-item>
        <q-item-main>
          <q-item-tile label>قفل ورود</q-item-tile>
        </q-item-main>
        <q-item-side right>
          <q-toggle v-model="lock" />
        </q-item-side>
      </q-item>
    </q-list>
    <cbtn />
    <cbtn />

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { model$ } from '../state'
import { pluck } from 'rxjs/operators'

function range(start: number, end: number) {
  var ans = [];
  for (let i = start; i <= end; i++) {
    ans.push({ description: `${i}` });
  }
  return ans;
}

@Component({})
export default class Me extends Vue {
  periodLength = 5;
  cycleLength = 28;
  lock = false;

  wheelSelectorData = {
    cycleLength: range(18, 42),
    bleedingLength: range(3, 7)
  }

  config = {
      title: "How Many?",
      items: [[this.wheelSelectorData.cycleLength]],
  }


  changeCycleLength() {
    (window as any).SelectorCordovaPlugin.showSelector(this.config, (result: any) => console.log(result), (err: any) => console.error(err))
  }

}
</script>

<style lang="stylus">

</style>
