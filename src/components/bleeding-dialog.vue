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
      <q-card
        class="bg-amber-1"
        style="width: 300px"
      >
        <q-card-section>
          <div class="text-h6">{{title}}</div>
          <div class="text-caption">{{Bleedinglabels.heaviness.explainer}}</div>
        </q-card-section>

        <q-card-section
          class="row inline no-wrap q-gutter-lg"
          style="height: 120px;"
        >
          <iRadio
            v-for="(bleed, i) of bleedIcons"
            :key="i"
            :value="bleed.key"
            :label="bleed.label"
            :unchecked-icon="bleed.icon"
            :checked-icon="bleed.checkedIcon"
            checked-color="pink"
            v-model="bleeding"
          />
        </q-card-section>

        <q-card-actions
          align="left"
          class="bg-amber text-white"
        >
          <q-btn
            flat
            :label="sharedLabels.save"
            @click="save"
            v-close-popup
          ></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { BleedingSchema, MucusSchema } from '../db/schemas'
import iRadio from './custom-radio.vue'
import { bleeding, sharedDialogs } from '../i18n/fa/cycle-day';
import { headerTitles } from '../i18n/fa/labels';
import { saveSymptom } from 'src/db';
import { dispatch } from '../state';

interface PhnIcon {
  key: number | string;
  label: string;
  icon: string;
  checkedIcon?: string;
}


@Component({
  components: { iRadio }
})
export default class BleedingDialog extends Vue {
  @Prop() data: BleedingSchema
  @Prop() date: string

  symptomName = 'bleeding'

  showDialogue = false
  title = headerTitles.BleedingEditView
  Bleedinglabels = bleeding
  sharedLabels = sharedDialogs

  bleedIcons: PhnIcon[] = this.Bleedinglabels.labels.map((x, i) => ({ key: i, label: x, icon: `../assets/icons/ic_bl_${i}.png`, checkedIcon: `../assets/icons/ic_bl_${i}_l.png` }))

  exclude: boolean = false
  bleeding = -1

  @Watch('data')
  onDataChange() {
    this.bleeding = this.data && this.data.value
    this.exclude = this.data && this.data.exclude
  }

  save() {
    saveSymptom(this.symptomName, this.date, { value: this.bleeding, exclude: this.exclude })
    .then(res => {
      this.$emit('period', Math.random()*100)
      dispatch('ADD_PHN')
      // this.showDialogue = false
      // this.$emit('save', this.bleeding)
      // this.$q.notify({
      //   message: 'انجام شد'
      // })
      })
  }

}

</script>

<style lang="stylus" scoped></style>

