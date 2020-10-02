<template>
  <div data-value="35" class="doughnut-chart">
    <span class="doughnut-chart__spinner">
      <svg width="100%" height="100%" viewBox="0 0 150 150" class="donut">
        <!--   <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle> -->
        <circle
          class="donut-ring"
          :cx="cx"
          :cy="cy"
          :r="radius"
          fill="transparent"
          stroke="#cfd8dc"
          stroke-width="2"
          stroke-linecap="round"
          :stroke-dasharray="adjustCircumference+' '+(circumference-adjustCircumference)"
          :stroke-dashoffset="AngleOffsetDashOffset"
        />

        <circle
          class="donut-segment"
          :cx="cx"
          :cy="cy"
          :r="radius"
          fill="transparent"
          stroke="#ff4081"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="calculateStrokeDashOffset(periodLength)"
          :transform="returnCircleTransformValue(0)"
        />
        <circle
          class="donut-segment"
          :cx="cx"
          :cy="cy"
          :r="radius"
          fill="transparent"
          stroke="#2196f3"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="calculateStrokeDashOffset(fertalityLength)"
          :transform="returnCircleTransformValue(fertalityStartDayNo)"
        />
      </svg>
    </span>
    <div class="doughnut-chart__inner">
      <div class="doughnut-chart__count">
        <span class="doughnut-chart__number">
          <span class="doughnut-chart__number-inner">
            <div class="text-body1">{{date}}</div>
            <div class="text-h4">روز {{dayNumber}} ام</div>
            <div class="text-body1">شانس بارداری کم</div>
          </span>
        </span>
        <span
          v-if="dayNumber"
          ref="arrow"
          class="doughnut-chart__arrow"
          :style="{ transform: returnArrowTransformValue}"
        ></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const Cycle = namespace('cycle');

@Component({})
export default class HomeCircle extends Vue {
  @Prop() private date: string;
  private angleOffset = 40;
  private colors = ['#6495ED', 'goldenrod', '#cd5c5c', 'thistle', 'lightgray'];
  private cx = 75;
  private cy = 75;
  private radius = 66;
  private strokeWidth = 30;
  private periodLength = 4;
  private fertalityLength = 5;
  private fertalityStartDayNo = 14;
  @Cycle.Getter('currentDayNumber') private dayNumber: number;
  @Cycle.Getter private cycleLength: number;

  get circumference() {
    return 2 * Math.PI * this.radius;
  }

  get adjustCircumference() {
    return this.circumference - (this.angleOffset / 360) * this.circumference;
  }

  get AngleOffsetDashOffset() {
    return this.circumference * ((90 - this.angleOffset / 2) / 360);
  }

  // get periodDashArray() {
  //   const periodLengthPercent = (this.periodLength * 360) / this.cycleLength;
  //   return `${periodLengthPercent} ${360 - periodLengthPercent}`;
  // }

  // get fertilityDashArray() {
  //   const fertalityLengthPercent =
  //     (this.fertalityLength * 360) / this.cycleLength;
  //   return `${fertalityLengthPercent} ${360 - fertalityLengthPercent}`;
  // }
  // get periodOffset() {
  //   const periodLengthPercent = this.periodLength / this.cycleLength;
  //   const strokDiff = periodLengthPercent * this.circumference
  //   return this.circumference - strokDiff;
  // }
  // get fertilityOffset() {
  //   return (this.fertalityStartDayNo * 360) / this.cycleLength + 90 - 20;
  // }

  private calculateStrokeDashOffset(dataVal: number) {
    const strokeDiff = this.dataPercentage(dataVal) * this.adjustCircumference;
    return this.circumference - strokeDiff;
  }

  private dataPercentage(dataVal: number) {
    return dataVal / this.cycleLength;
  }
  private returnCircleTransformValue(start: number) {
    const offset = this.dataPercentage(start) * 360 - 90 + this.angleOffset / 2;
    return `rotate(${offset}, ${this.cx}, ${this.cy})`;
  }
  get returnArrowTransformValue() {
    const offset =
      this.dataPercentage(this.dayNumber) * (360 - this.angleOffset) -
      180;
    return `rotate(${offset}deg)`;
  }
}
</script>

<style lang="scss" scoped>
.doughnut-chart {
  width: 90vmin;
  height: 90vmin;
  flex: none;
  position: relative;

  &__spinner {
    width: 100%;
    height: 100%;
    display: block;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__inner {
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    left: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  &__count {
    text-align: center;
    color: #fff;
    border-radius: 50%;
    background: $blue-grey;
    position: relative;
    width: 65%;

    &:before {
      content: '';
      display: block;
      padding-top: 100%;
    }
  }

  &__number {
    position: absolute;
    // width: 100%
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
    font-family: 'Montserrat', sans-serif;
    white-space: nowrap;
    height: 60%;

    &:after {
      content: '';
      display: inline-block;
      line-height: 2;
    }
  }

  &__number-inner {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  &__arrow {
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    transition: 1s transform;

    &:before {
      content: '';
      margin: 0 auto;
      position: absolute;
      top: 98%;
      right: 0px;
      left: 0px;
      height: 0;
      width: 0;
      border-left: 20px solid transparent;
      border-right: 20px solid transparent;
      border-top: 25px solid $blue-grey;
    }
  }
}
</style>