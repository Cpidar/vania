<template>
  <div
    :class="{
            day: true,
            today: today,
            select: date == selectedDay,
            'period-pr': period  === 'period-pr',
            'period-pr-start': period === 'period-pr-start',
            'period-pr-end': period ==='period-pr-end',
            'period': period === 'period',
            'period-start': period === 'period-start',
            'period-end': period === 'period-end',
            'has-note': hasNote
        }"
    @click="selectDay"
    :value="date"
  >
    <span style="pointer-events: none;" :class="{inactive: inactive}">
      <slot></slot>
    </span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model, Emit } from 'vue-property-decorator'
import { dispatch } from '../state'
import { getCycleDay } from '../db';

@Component({})
export default class Day extends Vue {
  @Prop({ type: String, required: true }) date: string
  @Prop({ type: Boolean, default: false }) today: boolean
  @Prop() inactive: any
  @Prop() hasNote: boolean
  @Prop() period: string
  @Prop() fertility: string
  // v-model for class select
  @Model('select', {type: String}) selectedDay: string

  @Emit('select')
  selectDay(ev: any) {
    const selectedDay = ev.target.getAttribute('value')
    dispatch('selectDay', { selectedDay })
    return ev.target.getAttribute('value')
  }
}
</script>

<style lang="stylus" scoped>
@import url("../main.styl");

.day {
  width: (100% / 7);
  height: var(--cell-height);
  text-align: center;
  line-height: var(--cell-height);
}

.day > span {
  pointer-events: none;
}

.today > span {
  display: block;
  box-sizing: border-box;
  width: var(--cell-height);
  height: var(--cell-height);
  border-radius: 50%;
  border: 1px solid #b30d34;
  color: #b30d34;
  margin: auto;
}

.inactive {
  opacity: 0.5;
}

.select > span {
  display: block;
  width: var(--cell-height);
  height: var(--cell-height);
  border-radius: 50%;
  background-color: $amber;
  color: white;
  margin: auto;
}

.period {
  height var(--cell-height);
    background-color: $pink-6;
    color: white;
}

.period-start {
  @extend .period;
  border-left: 2.5px solid;
  border-radius: var(--cell-height) 0 0 var(--cell-height);
}

.period-end {
  @extend .period;
  border-right: 2.5px solid;
  border-radius: 0 var(--cell-height) var(--cell-height) 0;
}

.period-pr {
  box-sizing: border-box;
  border-top: 2.5px solid #6cc4d9;
  border-bottom: 2.5px solid #6cc4d9;
  // color: white;
}

.period-pr-start {
  @extend .period-pr;
  border-left: 2.5px solid #6cc4d9;
  border-radius: var(--cell-height) 0 0 var(--cell-height);
}

.period-pr-end {
  @extend .period-pr;
  border-right: 2.5px solid #6cc4d9;
  border-radius: 0 var(--cell-height) var(--cell-height) 0;
}

.has-note {
  position: relative;
}

.has-note::after {
  content: "";
  display: block;
  position: absolute;
  top: 70%;
  right: calc(50% - 5px);
  bottom: 0;
  width: 10px;
  height: 10px;
  background-color: #865fc1;
  border-radius: 50%;
}
</style>
