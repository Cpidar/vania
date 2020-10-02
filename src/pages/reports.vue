<template>
  <div class="q-pa-xs">
        <q-header reveal class="bg-grey-1 text-primary no-shadow">
      <q-toolbar>
        <q-toolbar-title class="text-center">
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
          </q-avatar> -->
          آمار
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-list>
      <q-item>
        <q-item-section>
          <q-card>
            <q-card-section>
              <div class="text-h6">{{labels.cycleLengthTitle}}</div>
              <div class="text-subtitle2">{{labels.cycleLengthExplainer}}</div>
            </q-card-section>
            <q-separator inset></q-separator>
            <q-card-section>
              <div v-if="!cycleInfo">
                {{labels.emptyStats}}
              </div>
              <div v-if="cycleInfo.numberOfCycles === 1">
                <div class="text-body1">{{labels.oneCycleStats}}</div>
                <div class="text-body2">{{cycleInfo.mean}}</div>
                <div class="text-body2">{{labels.daysLabel}}</div>
              </div>
              <div v-if="cycleInfo.numberOfCycles > 1">
                <div class="text-body1">{{labels.averageLabel}}: {{cycleInfo.mean}} {{labels.daysLabel}}</div>
                <div class="text-body2">{{labels.minLabel}}: {{cycleInfo.minimum}} {{labels.daysLabel}}</div>
                <div class="text-body2">{{labels.maxLabel}}: {{cycleInfo.maximum}} {{labels.daysLabel}}</div>
                <div class="text-body2">{{labels.stdLabel}}: {{cycleInfo.stdDeviation}} {{labels.daysLabel}}</div>
              </div>
              <div>
                <div class="text-caption">{{labels.basisOfStatsBeginning}}: {{cycleInfo.numberOfCycles}} {{labels.basisOfStatsEnd}}</div>
              </div>
            </q-card-section>
          </q-card>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <cycle-chart />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <temperature-chart />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <weight-chart />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CycleChart from '../components/cycle-chart.vue';
import TemperatureChart from '../components/temperature-chart.vue';
import WeightChart from '../components/weight-chart.vue';
import { stats } from '../i18n/fa/labels';
import { CycleLengthState } from '../lib/cycle-length';

const Cycle = namespace('cycle');

@Component({
  components: { TemperatureChart, WeightChart, CycleChart }
})
export default class ReportPage extends Vue {
  @Cycle.Getter private cycleInfo: CycleLengthState;

  private labels = stats
}
</script>

<style lang="scss" scoped></style>