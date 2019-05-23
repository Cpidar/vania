<template>
  <div>
    <q-btn
      class="glossy"
      round
      color="deep-orange"
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
        class="bg-teal text-white"
        style="width: 300px"
      >
        <q-card-section>
          <div class="text-h6">{{Bleedinglabels.heaviness.header}}</div>
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
          class="bg-white text-teal"
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
import { Vue, Component, Prop } from 'vue-property-decorator'
import { BleedingSchema, MucusSchema } from '../db/schemas'
import iRadio from './custom-radio.vue'
import { bleeding, sharedDialogs } from '../i18n/fa/cycle-day';
import { headerTitles } from '../i18n/fa/labels';

interface PhnIcon {
  key: number | string;
  label: string;
  icon: string;
  checkedIcon?: string;
}


@Component({
  components: { iRadio }
})
export default class BleedingDialogue extends Vue {
  @Prop() data: BleedingSchema
  @Prop() date: string

  showDialogue = false
  title = headerTitles.BleedingEditView
  Bleedinglabels = bleeding
  sharedLabels = sharedDialogs

  bleedIcons: PhnIcon[] = this.Bleedinglabels.labels.map((x, i) => ({ key: i, label: x, icon: `../assets/icons/ic_bl_${i}.png`, checkedIcon: `../assets/icons/ic_bl_${i}_l.png` }))
  bleeding: number | undefined = this.data ? this.data.value : -1

  save() {

  }

}

</script>

<style lang="stylus" scoped></style>

