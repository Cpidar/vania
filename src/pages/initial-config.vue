<template>
  <div class="container q-pa-md">
    <q-stepper v-model="step" vertical color="primary" animated style="height: 95vh;">
      <q-step :name="1" :title="labels.cycleLengthTitle" icon="settings" :done="step > 1">
        <div class="text-body1 q-py-md">{{labels.cyclelengthQuestion}}</div>
        <scroll-picker :options="cycleLengthValues" v-model="cycleLength" style="font-size: 18px;"/>
        <q-stepper-navigation>
          <q-btn @click="step = 2" color="primary" :label="labels.continue"/>
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        :title="labels.bleedingLengthTitle"
        icon="create_new_folder"
        :done="step > 2"
      >
        <div class="text-body1 q-py-md">{{labels.bleedinlengthQuestion}}</div>
        <scroll-picker :options="BleedingLengthValues" v-model="bleedingLength" style="font-size: 18px;"/>
        <q-stepper-navigation>
          <q-btn @click="step = 3" color="primary" :label="labels.continue"/>
          <q-btn flat @click="step = 1" color="primary" :label="labels.back" class="q-ml-sm"/>
        </q-stepper-navigation>
      </q-step>

      <q-step :name="3" :title="labels.lastCycleStartTitle" icon="add_comment">
        <div class="text-body1 q-py-md">{{labels.lastCycleStartQuestion}}</div>
        <q-scroll-area style="height: 45vh;">
          <Calendar :current="month"/>
          <Calendar :current="prevMonth"/>
          <Calendar :current="earlierMonth"/>
        </q-scroll-area>
        <q-stepper-navigation>
          <q-btn color="primary" :label="labels.finish" @click="save"/>
          <q-btn flat @click="step = 2" color="primary" :label="labels.back" class="q-ml-sm"/>
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script lang="ts">
import jMoment from 'moment-jalaali';
import { dispatch, importInitialCycleConfig } from 'src/state';
import { Component, Vue } from 'vue-property-decorator';
import Calendar from '../components/calendar-comp.vue';
import { entryPage as labels } from '../i18n/fa/labels';

function range(start: number, end: number) {
  const ans = [];
  for (let i = start; i <= end; i++) {
    ans.push({ value: i, name: i });
  }
  return ans;
}

@Component<InitialConfigPage>({
  components: { Calendar }
})
export default class InitialConfigPage extends Vue {
  public month = jMoment()
    .startOf('jMonth')
    .format('jYYYY-jMM-jDD');
  public prevMonth = jMoment()
    .startOf('jMonth')
    .clone()
    .subtract(1, 'jMonth')
    .format('jYYYY-jMM-jDD');
  public earlierMonth = jMoment()
    .startOf('jMonth')
    .clone()
    .subtract(2, 'jMonth')
    .format('jYYYY-jMM-jDD');

  public step = 1;
  public cycleLength = 28;
  public bleedingLength = 4;
  public lastCycleStart = '';

  public labels = labels;

  public cycleLengthValues = [...range(18, 42)];

  public BleedingLengthValues = [...range(3, 7)];

  public save() {
    const payload = {
      start: this.lastCycleStart,
      cycleLength: this.cycleLength,
      bleedindLength: this.bleedingLength
    };
    importInitialCycleConfig(payload);
    dispatch('init');
    this.$router.replace('home');
  }
}
</script>

<style lang="stylus" scoped>
.container {
  background: linear-gradient(135deg,#FCDF8A,#F38381);
}
</style>


