<template>
  <header class="month">
    <div class="todaycal">
      <q-btn
        flat
        dense
        no-wrap
        size="sm"
        align="right"
        label="برو به امروز"
      ></q-btn>
    </div>
    <q-btn
      flat
      color="secondary"
      icon="keyboard_arrow_right"
      @click="goToPrevMonth"
    />
    <!-- <h5 v-if="!visible" class="monthname">{{date.day}} {{date.monthName}} {{date.fullYear}}</h5> -->
    <!-- <PoseTransition mode="out-in"> -->
      <div
        class="monthname"
        :key="date.date"
      >{{date.day}} {{date.monthName}} {{date.fullYear}}</div>
    <!-- </PoseTransition> -->
    <q-btn
      flat
      color="secondary"
      icon="keyboard_arrow_left"
      @click="goToNextMonth"
    />
    <div class="chart">
      <q-btn
        flat
        dense
        no-wrap
        rounded
        icon="build"
        size="sm"
        align="right"
        label="ویرایش دوره"
        @click="modal = true"
      ></q-btn>
    </div>
  <period-modal :modal-state="modal" @close="modal = false"/>
  </header>
</template>

<script lang="ts">
import posed, { PoseTransition } from 'vue-pose'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import PeriodModal from './edit-period.vue'

@Component({
  components: {
    PeriodModal,
    PoseTransition,
    Placeholder: posed.div({
      enter: {
        opacity: 1,
        y: 0
      },
      exit: {
        opacity: 0,
        y: '10px'
      }
    })
  }
})
export default class CalendarHeader extends Vue {
  @Prop({ default: () => ({ day: 0, monthName: '', year: 0 }) }) public date: any
  private prevDate = {}
  private newDate = {}
  private isVisible = true
  private modal = false

  @Watch('date')
  private DateChange(newVal: any, oldVal: any) {
    this.isVisible = !this.isVisible
  }

  private goToNextMonth() {
    this.$emit('next-month')
  }

  private goToPrevMonth() {
    this.$emit('prev-month')
  }
}
</script>

<style lang="stylus" scoped>
.month {
  display: flex;
  height: 60px;
  justify-content: center;
  padding: 0 16px;
  margin: 5% 0;
  background-color: rgba(255, 255, 255, 0.8);
  opacity: 70%;
  color: #eb4986;
}

.todaycal {
  width: 30%;
  margin: auto;
}

.left {
  color: #eb4986;
}

.right {
  color: #eb4986;
}

.monthname {
  width: 40%;
  margin: auto;
  text-align: center;
}

.yearname {
  width: 25%;
  margin: auto;
}

.chart {
  width: 30%;
  margin: auto;
}
</style>
