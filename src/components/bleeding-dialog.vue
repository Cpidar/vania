<template>
  <div>
    <q-btn
      class="glossy"
      round
      :outline="bleeding === undefined || bleeding === -1"
      color="pink"
      icon="mdi-water"
      @click="showDialogue = true"
    ></q-btn>
    <q-dialog
      v-model="showDialogue"
      position="bottom"
      full-width
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-amber-1" style="width: 300px">
        <q-card-section>
          <div class="text-h6">{{title}}</div>
          <div class="text-caption">{{Bleedinglabels.heaviness.explainer}}</div>
        </q-card-section>

        <q-card-section class="row inline no-wrap q-gutter-lg" style="height: 120px;">
          <iRadio
            v-for="(bleed, i) of bleedIcons"
            :key="i"
            :value="bleed.key"
            :label="bleed.label"
            :unchecked-icon="bleed.icon()"
            :checked-icon="bleed.checkedIcon()"
            checked-color="pink"
            v-model="bleeding"
          />
        </q-card-section>

        <q-card-actions align="left" class="bg-amber text-white">
          <q-btn flat :label="sharedLabels.save" @click="save" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { saveSymptom } from 'src/db';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { BleedingSchema, MucusSchema } from '../db/schemas';
// import iRadio from './custom-radio.vue'
import { bleeding, sharedDialogs } from '../i18n/fa/cycle-day';
import { headerTitles } from '../i18n/fa/labels';
import { dispatch } from '../state';

interface PhnIcon {
  key: number | string;
  label: string;
  icon: () => any;
  checkedIcon?: () => any;
}

@Component({
  components: { iRadio: () => import('./custom-radio.vue') }
})
export default class BleedingDialog extends Vue {
  @Prop() public data: BleedingSchema;
  @Prop() public date: string;

  public symptomName = 'bleeding';

  public showDialogue = false;
  public title = headerTitles.BleedingEditView;
  public Bleedinglabels = bleeding;
  public sharedLabels = sharedDialogs;

  public bleedIcons: PhnIcon[] = this.Bleedinglabels.labels.map((x, i) => ({
    key: i,
    label: x,
    icon() {
      return require(`../assets/icons/ic_bl_${i}.png`);
    },
    checkedIcon() {
      return require(`../assets/icons/ic_bl_${i}_l.png`);
    }
  }));

  public exclude: boolean = false;
  public bleeding = -1;

  @Watch('data')
  public onDataChange() {
    this.bleeding = this.data && this.data.value;
    this.exclude = this.data && this.data.exclude;
  }

  public save() {
    saveSymptom(this.symptomName, this.date, {
      value: this.bleeding,
      exclude: this.exclude
    }).then(res => {
      this.$emit('period', Math.random() * 100);
      dispatch('ADD_PHN');
      // this.showDialogue = false
      // this.$emit('save', this.bleeding)
      // this.$q.notify({
      //   message: 'انجام شد'
      // })
    });
  }
}
</script>

<style lang="stylus" scoped></style>

