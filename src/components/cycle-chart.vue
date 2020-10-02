<template>
  <q-card style="background-color: #13222d">
    <q-card-section>
      <div class="text-h6 text-grey-12">{{title}}</div>
      <div class="text-caption text-grey-12">{{caption}}</div>
    </q-card-section>
    <q-card-section class="q-px-none">
      <bar-chart
        :width="300"
        :height="200"
        :chart-data="temperatureDataset"
        css-classes="relative-position full-width"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { ChartData, ChartOptions } from 'chart.js';
import jMoment from 'moment-jalaali'
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import BarChart from '../components/bar-chart';
import { charts as labels} from '../i18n/fa/labels'

const Cycle = namespace('cycle');

@Component({
  components: { BarChart }
})
export default class CycleChart extends Vue {
  @Cycle.Getter private temperatureDataset: { x: string[]; y: number[], m: number };
  private title = labels.temperatureChartTitle

  get average() {
    const sum = this.temperatureDataset.y.reduce((acc, cur) => (acc + cur), 0)
    const avg = sum / this.temperatureDataset.y.length
    return avg
  }
  get caption() {
    return labels.caption(this.average)
  }
}
</script>

<style lang="scss" scoped></style>