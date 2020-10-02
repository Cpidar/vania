<template>
  <section class="q-px-md q-py-md">
    <q-timeline color="secondary">
        <q-timeline-entry
          :subtitle="noteTitle"
          key="note"
          v-if="note !== undefined && note.length"
        >
          <div>
            <q-chip clickable @click="toggleNoteDial" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
              <q-avatar icon="eva-edit-outline" color="purple" text-color="white" />
              <!-- <q-avatar size="28px">
                <img :src="require('../assets/icons/ic_bl_' + this.bleeding + '.png')" />
              </q-avatar> -->
              {{ note }}
            </q-chip>
          </div>
        </q-timeline-entry>
        <q-timeline-entry :subtitle="WeighttempTitle" key="weight-temp" v-if="weight || temperature">
          <div>
            <q-chip v-if="weight" clickable @click="togglePhnDial">
              <q-avatar size="28px">
                <img :src="require('../assets/icons/ic_weight.png')" />
              </q-avatar>
              {{ weight + " Kg" }}
            </q-chip>
            <q-chip v-if="temperature" clickable @click="toggleTempDial">
              <q-avatar size="28px">
                <img :src="require('../assets/icons/ic_tempreture.png')" />
              </q-avatar>
              {{ temperature + " درجه سانتیگراد" }}
            </q-chip>
          </div>
        </q-timeline-entry>

        <q-timeline-entry
          :subtitle="bleedingTitle"
          key="bleeding"
          v-if="bleeding !== -1 && bleeding !== undefined"
        >
          <div>
            <q-chip clickable @click="togglePhnDial">
              <q-avatar size="28px">
                <img :src="require('../assets/icons/ic_bl_' + this.bleeding + '.png')" />
              </q-avatar>
              {{ bleedingLabel[bleeding] }}
            </q-chip>
          </div>
        </q-timeline-entry>

        <q-timeline-entry :subtitle="painTitle" key="pain" v-if="pains && pains.length">
          <div>
            <q-chip v-for="pain of pains" :key="pain" clickable @click="togglePhnDial">
              <q-avatar size="28px">
                <img :src="require('../assets/icons/ic_sy_' + pain + '.png')" />
              </q-avatar>
              {{ painLabels[pain] }}
            </q-chip>
          </div>
        </q-timeline-entry>

        <q-timeline-entry :subtitle="moodTitle" key="mood" v-if="moods && moods.length">
          <div >
            <q-chip v-for="mood of moods" :key="mood" clickable @click="togglePhnDial">
              <q-avatar size="28px">
                <img :src="require('../assets/icons/ic_mood_' + mood + '.png')" />
              </q-avatar>
              {{ moodLabels[mood] }}
            </q-chip>
          </div>
        </q-timeline-entry>

        <q-timeline-entry :subtitle="sexTitle" key="sex" v-if="(sex !== -1) && (sex !== undefined)">
          <div>
            <q-chip clickable @click="togglePhnDial">
              <q-avatar size="28px">
                <img :src="require('../assets/icons/ic_sex_' + sex + '.png')" />
              </q-avatar>
              {{ sexLabels[sex] }}
            </q-chip>
          </div>
        </q-timeline-entry>
      <!-- </transition-group> -->
    </q-timeline>
  </section>
</template>

<script lang="ts">
import { combineLatest, map, pluck } from 'rxjs/operators';
import { headerTitles } from 'src/i18n/fa/labels';
import { Component, Prop, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { getCycleDay } from '../db'
import { CycleDaySchema } from '../db/schemas';
import { bleeding, mood, mucus, pain, sex } from '../i18n/fa/cycle-day';
import { getSelectedEvents, model$, shortSelectedDay } from '../state'
import { TOGGLE_MUCUS_DIAL, TOGGLE_NOTE_DIAL, TOGGLE_PHN_DIAL, TOGGLE_TEMP_DIAL } from '../store/ui';

interface PhnList {
  label?: string;
  icon?: string
}

const Ui = namespace('UiStore')

@Component({
  subscriptions() {
    return {
      events: getSelectedEvents,
    }
  }
})
export default class PhnSection extends Vue {
  @Prop() public phn: CycleDaySchema
  @Ui.Action(TOGGLE_NOTE_DIAL) private toggleNoteDial: any
  @Ui.Action(TOGGLE_TEMP_DIAL) private toggleTempDial: any
  @Ui.Action(TOGGLE_MUCUS_DIAL) private toggleMucusDial: any
  @Ui.Action(TOGGLE_PHN_DIAL) private togglePhnDial: any

  private noteTitle = headerTitles.NoteEditView
  private WeighttempTitle = headerTitles.TemperatureEditView + ' ' + headerTitles.WeightEditView
  private painTitle = headerTitles.PainEditView
  private painLabels = pain.categories
  private moodTitle = headerTitles.MoodEditView
  private moodLabels = mood.categories
  private bleedingTitle = headerTitles.BleedingEditView
  private bleedingLabel = bleeding.labels
  private mucusTitle = headerTitles.MucusEditView
  private mucusFeelingLabels = mucus.feeling
  private mucusTextureLabels = mucus.texture
  private sexTitle = headerTitles.SexEditView
  private sexLabels = sex.categories

  get note() {
    const attr = this.phn && this.phn.note
    // return (attr && Object.keys(attr).filter(key => attr[key]))
    return attr
  }

  get pains() {
    const attr = this.phn && this.phn.pain
    // return (attr && Object.keys(attr).filter(key => attr[key]))
    return attr
  }

  get moods() {
    const attr = this.phn && this.phn.mood
    // return (attr && Object.keys(attr).filter(key => attr[key]))
    return attr
  }

  get bleeding() {
    const attr = this.phn && this.phn.bleeding
    return (attr && attr.value)
  }

  get sex() {
    const attr = this.phn && this.phn.sex
    return attr
  }

  get temperature() {
    const attr = this.phn && this.phn.temperature
    return (attr && attr.value)
  }

  get weight() {
    const attr = this.phn && this.phn.weight
    return (attr && attr.value)
  }

}
</script>

<style lang="scss" scoped>
.phn-grid {
  width: 95%;
  margin: 10px auto;
  display: grid;
  grid: 1fr / 1fr 1fr;
  grid-gap: 10px;
}

.phn-row-span {
  grid-column: 1 / 3;
}
</style>
