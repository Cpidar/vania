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
import { pluck } from 'rxjs/operators'
import Vue from 'vue'
import Component from 'vue-class-component'
import { model$ } from '../state'

function range(start: number, end: number) {
  const ans = [];
  for (let i = start; i <= end; i++) {
    ans.push({ description: `${i}` });
  }
  return ans;
}

@Component({})
export default class Me extends Vue {
  public periodLength = 5;
  public cycleLength = 28;
  public lock = false;

  public wheelSelectorData = {
    cycleLength: range(18, 42),
    bleedingLength: range(3, 7)
  }

  public config = {
      title: 'How Many?',
      items: [[this.wheelSelectorData.cycleLength]],
  }

  public changeCycleLength() {
    window.SelectorCordovaPlugin.showSelector(this.config, result => console.log(result), err => console.error(err))
  }

}
</script>

<style lang="stylus">

</style>
