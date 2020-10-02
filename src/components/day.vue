<template>
  <div
    :class="{
            day: true,
            inactive: inactive,
            'period-pr': period  === 'period-pr',
            'period-pr-start': period === 'period-pr-start',
            'period-pr-end': period ==='period-pr-end',
            'period': period === 'period',
            'period-start': period === 'period-start',
            'period-end': period === 'period-end',
            'fertile': fertility === 'fertile',
            'fertile-start': fertility === 'fertile-start',
            'fertile-end': fertility === 'fertile-end',
        }"
    @click="selectDay"
    :value="date"
  >
    <span
      style="pointer-events: none;"
      :class="{ 
        today: today,
        select: date == selectedDay
        }"
    >
      <slot></slot>
    </span>
    <div style="pointer-events: none;" class="symbol" v-if="hasPHN || hasSex">
      <div style="pointer-events: none;" :class="{ 'q-mx-xs': true,'has-phn': hasPHN }" v-if="hasPHN" />
      <svg style="pointer-events: none;" :class="{ 'q-mx-xs': true, 'has-sex': hasSex }" viewBox="0 0 32 29.6" v-if="hasSex" >
        <path
          d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
	c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"
        />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Model, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { getCycleDay } from '../db';
import { dispatch } from '../state';
import { SET_DATE } from '../store/cycle/types';

const Cycle = namespace('cycle');

@Component({})
export default class Day extends Vue {
  @Prop({ type: String, required: true }) public date: string;
  @Prop({ type: String, required: true }) public mDate: string;
  @Prop({ type: Boolean, default: false }) public today: boolean;
  @Prop() public inactive: any;
  @Prop({ type: Boolean, default: false }) public hasSex: boolean;
  @Prop({ type: Boolean, default: false }) public hasPHN: boolean;
  @Prop() public period: string;
  @Prop() public fertility: string;
  // v-model for class select
  @Model('select', { type: String }) public selectedDay: string;

  @Cycle.Mutation(SET_DATE) private setDate: any;

  @Emit('select')
  public selectDay(ev: any) {
    const selectedDay = this.date
    this.setDate(this.mDate);
    dispatch('selectDay', { selectedDay });
    return ev.target.getAttribute('value');
  }
}
</script>

<style lang="scss" scoped>
@import url('../main.scss');

.day {
  position: relative;
  width: (100% / 7);
  height: var(--cell-height);
  text-align: center;
  line-height: var(--cell-height);
  margin-top: 2px;
}

// .day > span {
// pointer-events: none;
// }
.today  {
  display: block;
  box-sizing: border-box;
  width: var(--cell-height);
  height: var(--cell-height);
  border-radius: 50%;
  border: 1px solid $secondary;
  margin: auto;
}

.inactive {
  opacity: 0.3;
}

.select {
  display: block;
  width: var(--cell-height);
  height: var(--cell-height);
  border-radius: 50%;
  background-color: $warning;
  color: white;
  margin: auto;
}

// .fertile {
//   display: block;
//   width: var(--cell-height);
//   height: var(--cell-height);
//   border-radius: 50%;
//   background-color: $cyan-7;
//   color: white;
//   margin: auto;
// }

.period {
  height: var(--cell-height);
  background-color: $primary;
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

.fertile {
  // height: var(--cell-height);
  // background-color: $blue-3;
  color: $blue-8;
}

.fertile-start {
  @extend .fertile;
  // border-left: 2.5px solid;
  // border-radius: var(--cell-height) 0 0 var(--cell-height);
}

.fertile-end {
  @extend .fertile;
  // border-right: 2.5px solid;
  // border-radius: 0 var(--cell-height) var(--cell-height) 0;
}

.period-pr {
  box-sizing: border-box;
  border-top: 2.5px solid $primary;
  border-bottom: 2.5px solid $primary;
  // color: white;
}

.period-pr-start {
  @extend .period-pr;
  border-left: 2.5px solid $primary;
  border-radius: var(--cell-height) 0 0 var(--cell-height);
}

.period-pr-end {
  @extend .period-pr;
  border-right: 2.5px solid $primary;
  border-radius: 0 var(--cell-height) var(--cell-height) 0;
}

// .has-phn {
//   position: relative;
// }

.symbol {
  display: flex;
  position: absolute;
  width: 100%;
  bottom: 0;
  justify-content: center;
}

.has-sex {
  // position: relative;
  width: 10px;
  height: 10px;
  fill: $primary;
}

.has-phn {
  // content: '';
  // display: block;
  // position: absolute;
  // top: 70%;
  // right: calc(50% - 5px);
  // bottom: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: $secondary;
}
</style>
