<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Weight Diagram</div>
    </q-card-section>
    <q-card-section>
      <line-chart
        :width="300"
        :height="200"
        :chart-data="weightDataset"
        css-classes="relative-position full-width"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import LineChart from '../components/line-chart';

const Cycle = namespace('cycle');

@Component({
  components: { LineChart }
})
export default class ReportPage extends Vue {
  @Cycle.Getter private weightDataset: { x: string[]; y: number[] };
}
</script>

<style lang="stylus" scoped></style>