<template>
  <div>
    <q-btn
      class="glossy"
      round
      :outline="value === undefined || value === -1"
      color="teal"
      icon="mdi-weather-rainy"
      @click="toggle"
    ></q-btn>
    <q-dialog
      v-model="showDialog"
      position="bottom"
      full-width
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-teal-1 text-white" style="width: 300px">
        <q-card-section>
          <div class="text-h6">{{title}}</div>
        </q-card-section>

        <q-card-section class="row inline no-wrap q-gutter-lg" style="height: 120px;">
          <!-- <div class="text-subtitle2">
          {{mucusLabels.feeling.explainer}}
          </div>-->
          <iRadio
            v-for="(f, i) of mucusFeelingIcons"
            :key="f.key"
            :value="i"
            :label="f.label"
            :unchecked-icon="f.icon()"
            :checked-icon="f.icon()"
            checked-color="pink"
            v-model="feeling"
          />
        </q-card-section>

        <q-card-actions class="row inline no-wrap q-gutter-lg" style="height: 120px;">
          <!-- <div class="text-subtitle2">
          {{mucusLabels.texture.explainer}}
          </div>-->
          <iRadio
            v-for="(f, i) of mucusTextureIcons"
            :key="f.key"
            :value="i"
            :label="f.label"
            :unchecked-icon="f.icon()"
            :checked-icon="f.icon()"
            checked-color="pink"
            v-model="texture"
          />
        </q-card-actions>

        <q-card-actions align="left" class="bg-teal text-white">
          <q-btn flat :label="labels.save" @click="saveMucus" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { dispatch } from 'src/state';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { saveSymptom } from '../db';
import { CycleDaySchema, MucusSchema } from '../db/schemas';
import { mucus, sharedDialogs } from '../i18n/fa/cycle-day';
import { headerTitles, shared } from '../i18n/fa/labels';
import computeNfpValue from '../lib/nfp-mucus';
import { SAVE_PHN } from '../store/cycle/types';
import { TOGGLE_MUCUS_DIAL } from '../store/ui';
import iRadio from './custom-radio.vue';

interface PhnIcon {
  key: number | string;
  label: string;
  icon: string;
  checkedIcon?: string;
}

const Cycle = namespace('cycle');
const Ui = namespace('UiStore');

@Component({
  components: { iRadio }
})
export default class MucusDialog extends Vue {
  @Prop() public data: MucusSchema;
  @Prop() public date: string;

  @Cycle.Action(SAVE_PHN) public save: (phn: Partial<CycleDaySchema>) => null;
  @Ui.State private mucusDialog: boolean
  @Ui.Action(TOGGLE_MUCUS_DIAL) private toggle: any

  private symptomName = 'mucus';

  private labels = sharedDialogs;
  private mucusLabels = mucus;
  private title = headerTitles.MucusEditView;

  private mucusFeelingIcons = mucusFeelingIcons;
  private mucusTextureIcons = mucusTextureIcons;
  private texture: number = -1;
  private exclude = false;
  private feeling: number = -1;
  private value: number = -1;

  @Watch('data', { immediate: true })
  private onDataChange() {
    this.texture = this.data && this.data.texture;
    this.exclude = this.data && this.data.exclude;
    this.feeling = this.data && this.data.feeling;
    this.value = this.data && this.data.value;
  }

  get showDialog() {
    return this.mucusDialog
  }

  set showDialog(val) {
    this.toggle()
  }

  private saveMucus() {
    this.save({
      date: this.date,
      mucus: {
        feeling: this.feeling,
        texture: this.texture,
        value: computeNfpValue(this.feeling, this.texture),
        exclude: this.exclude
      }
    });
  }
}

const mucusFeelingIcons = [
  {
    key: 'discharge',
    label: mucus.feeling.categories[0],
    icon() {
      return require('../assets/icons/ic_mucus_discharge.png');
    }
  },
  {
    key: 'spotting',
    label: mucus.feeling.categories[1],
    icon() {
      return require('../assets/icons/ic_mucus_spotting.png');
    }
  },
  {
    key: 'watery',
    label: mucus.feeling.categories[2],
    icon() {
      return require('../assets/icons/ic_mucus_watery.png');
    }
  },
  {
    key: 'sticky',
    label: mucus.feeling.categories[3],
    icon() {
      return require('../assets/icons/ic_mucus_sticky.png');
    }
  }
];

const mucusTextureIcons = [
  {
    key: 'nodischarge',
    label: mucus.feeling.categories[1],
    icon() {
      return require('../assets/icons/ic_mucus_nodischarge.png');
    }
  },
  {
    key: 'creamy',
    label: mucus.feeling.categories[0],
    icon() {
      return require('../assets/icons/ic_mucus_creamy.png');
    }
  },
  {
    key: 'eggwhite',
    label: mucus.feeling.categories[1],
    icon() {
      return require('../assets/icons/ic_mucus_eggwhite.png');
    }
  }
];
</script>

<style lang="scss" scoped></style>
