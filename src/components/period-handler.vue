<template>
  <section>
    <q-item v-if="isStart || isMenseStart">
      <q-item-section>
        <q-item-label>{{isPeriodStartLabel}}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn-group rounded unelevated>
          <q-btn
            :label="yesLabel"
            :color="isStartModel ? 'pink' : 'white'"
            :text-color="isStartModel ? 'white' : 'black'"
            @click="onStartPeriod"
            :disable="isStartModel"
            rounded
            glossy 
          ></q-btn>
          <q-btn
            :label="noLabel"
            :color="!isStartModel ? 'pink' : 'white'"
            :text-color="!isStartModel ? 'white' : 'black'"
            @click="onDelPeriod"
            :disable="!isStartModel"
            rounded
            glossy 
          ></q-btn>
        </q-btn-group>
      </q-item-section>
    </q-item>

    <q-item v-if="!isStart && !isMenseStart">
      <q-item-section>
        <q-item-label>{{isPeriodEndLabel}}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn-group rounded unelevated>
          <q-btn
            :label="yesLabel"
            :color="isEndModel ? 'pink' : 'white'"
            :text-color="isEndModel ? 'white' : 'black'"
            @click="changePeriodEnd"
            :disable="isEndModel"
            rounded
            glossy 
          ></q-btn>
          <q-btn
            :label="noLabel"
            :color="!isEndModel ? 'pink' : 'white'"
            :text-color="!isEndModel ? 'white' : 'black'"
            @click="changePeriodEnd"
            :disable="!isEndModel"
            rounded
            glossy 
          ></q-btn>
        </q-btn-group>
      </q-item-section>
    </q-item>
  </section>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { CycleDaySchema } from '../db/schemas';
import { periodLabels, shared as labels } from '../i18n/fa/labels';
import { DEL_PERIOD, END_PERIOD, START_PERIOD } from '../store/cycle/types';
import { SHOW_DIALOG } from '../store/ui';

const Cycle = namespace('cycle');
const ui = namespace('UiStore');

@Component({})
export default class PeriodHandler extends Vue {
  @Prop({ default: () => false }) public isStart: boolean;
  @Prop({ default: () => false }) public isEnd: boolean;
  @Prop({ required: true }) public date: string;

  private isStartModel: boolean = false;
  private isEndModel: boolean = false;
  private isPeriodStartLabel = ''
  private isPeriodEndLabel = ''
  private yesLabel = ''
  private noLabel = ''

  @Cycle.State private maxBleedingLength: number;
  @Cycle.Getter private isMenseStart: boolean;
  @Cycle.Getter private dayNumber: number;
  @Cycle.Action(START_PERIOD) private startPeriod: any;
  @Cycle.Action(END_PERIOD) private endPeriod: any;
  @Cycle.Action(DEL_PERIOD) private remPeriod: any;
  @ui.Action(SHOW_DIALOG) private dialoge: any;

  @Watch('isStart', { immediate: true })
  private onIsStartChange(val: boolean) {
    this.isStartModel = val;
  }

  @Watch('isEnd', { immediate: true })
  private onIsEndChange(val: boolean) {
    this.isEndModel = val;
  }

  private mounted() {
    this.yesLabel = labels.yes
    this.noLabel = labels.no
    this.isPeriodStartLabel = periodLabels.startPeriod
    this.isPeriodEndLabel = periodLabels.endPeriod
  }

  private onStartPeriod() {
    this.isStartModel = true;
    this.startPeriod(this.date);
  }
  private onDelPeriod() {
    this.isStartModel = false;
    this.remPeriod(this.date);
  }

  private changePeriodEnd() {
    if (this.isEndModel) {
      this.dialoge({
        title: labels.warning,
        message: periodLabels.endPeriodInAnotherDay
      });
    } else {
      this.isEndModel = true;
      this.endPeriod({endDate: this.date, dayNumber: this.dayNumber});
    }
  }
}
</script>

<style lang="scss" scoped></style>
