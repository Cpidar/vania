<template>
  <section class="q-px-md q-py-md">
    <q-banner dense class="bg-grey-3" v-if="events && events.length > 0">
      <template v-slot:avatar>
        <q-icon name="event_available" color="secondary" />
      </template>
      <div v-for="ev of events" :key="ev.type">
        {{ev.title}}
      </div>
    </q-banner>
    <q-timeline color="secondary">
        <q-timeline-entry icon="delete" key="weight-temp" v-if="weight || temperature">
          <div>
            <q-chip v-if="weight">
              <q-avatar size="28px">
                <img :src="'./assets/icons/ic_weigth.png'" />
              </q-avatar>
              {{ weight + " Kg" }}
            </q-chip>
            <q-chip v-if="temperature">
              <q-avatar size="28px">
                <img :src="'./assets/icons/ic_tempreture.png'" />
              </q-avatar>
              {{ temperature + " °C" }}
            </q-chip>
          </div>
        </q-timeline-entry>

        <q-timeline-entry
          icon="sentiment_very_dissatisfied"
          key="bleeding"
          v-if="bleeding !== -1 && bleeding !== undefined"
        >
          <div>
            <q-chip>
              <q-avatar size="28px">
                <img :src="'./assets/icons/ic_bl_' + bleeding + '.png'" />
              </q-avatar>
              {{ bleedingLabel[bleeding] }}
            </q-chip>
          </div>
        </q-timeline-entry>

        <q-timeline-entry icon="img:./assets/calendar-icons/ic_calendar_sym_headache_c.png" key="pain" v-if="pains">
          <div>
            <q-chip v-for="pain of pains" :key="pain">
              <q-avatar size="28px">
                <img :src="'../assets/icons/ic_sy_' + pain + '.png'" />
              </q-avatar>
              {{ painLabels[pain] }}
            </q-chip>
          </div>
        </q-timeline-entry>

        <q-timeline-entry icon="mood" key="mood" v-if="moods">
          <div >
            <q-chip v-for="mood of moods" :key="mood">
              <q-avatar size="28px">
                <img :src="'../assets/icons/ic_mood_' + mood + '.png'" />
              </q-avatar>
              {{ moodLabels[mood] }}
            </q-chip>
          </div>
        </q-timeline-entry>

        <q-timeline-entry icon="delete" key="sex" v-if="(sex !== -1) && (sex !== undefined)">
          <div>
            <q-chip>
              <q-avatar size="28px">
                <img :src="'../assets/icons/ic_sex_' + sex + '.png'" />
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
import { Vue, Component, Prop } from 'vue-property-decorator'
import { shortSelectedDay, getSelectedEvents, model$, initialCycleDay } from '../state'
import { getCycleDay } from '../db'
import { CycleDaySchema } from '../db/schemas';
import { bleeding, pain, sex, mood } from '../i18n/fa/cycle-day';
import { pluck, combineLatest, map } from 'rxjs/operators';

interface PhnList {
  label?: string;
  icon?: string
}

@Component({
  subscriptions() {
    return {
      events: getSelectedEvents,
    }
  }
})
export default class PhnSection extends Vue {
  @Prop() phn: CycleDaySchema

  painLabels = pain.categories
  moodLabels = mood.categories
  bleedingLabel = bleeding.labels
  sexLabels = sex.categories


  get pains() {
    let attr = this.phn && this.phn['pain']
    // return (attr && Object.keys(attr).filter(key => attr[key]))
    return attr
  }

  get moods() {
    let attr = this.phn && this.phn['mood']
    // return (attr && Object.keys(attr).filter(key => attr[key]))
    return attr
  }

  get bleeding() {
    let attr = this.phn && this.phn.bleeding
    return (attr && attr.value)
  }

  get sex() {
    let attr = this.phn && this.phn.sex
    return (attr && attr.value)
  }

  get temperature() {
    let attr = this.phn && this.phn.temperature
    return (attr && attr.value)
  }

  get weight() {
    let attr = this.phn && this.phn.weight
    return (attr && attr.value)
  }
}

</script>

<style lang="stylus" scoped>
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
