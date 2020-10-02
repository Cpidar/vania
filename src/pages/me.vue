<template>
  <div>
    <q-header reveal class="bg-grey-1 text-primary no-shadow">
      <q-toolbar>
        <q-toolbar-title class="text-center">
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
          </q-avatar> -->
          تنظیمات
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <div class="q-pa-md">
      <q-list padding>
        <q-item-label header>{{menuTitles.periodSetting}}</q-item-label>

        <q-item>
          <q-item-section center avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            </q-avatar>
          </q-item-section>
        </q-item>
        <!-- <q-expansion-item
        expand-icon-toggle
        expand-separator
        icon="perm_identity"
        :label="menuTitles.cycleLength"
        :caption=""
      >
        <q-card>
          <q-card-section>
            <q-slider class="dark" v-model="cycleLength" :min="18" :max="38" label-always />
          </q-card-section>
        </q-card>
        </q-expansion-item>-->
        <q-expansion-item>
          <template v-slot:header>
            <q-item-section>
              <q-item-label>{{periodSettingLabels.cycleLength}}</q-item-label>
              <!-- <q-item-label caption>{{defaultPeriodSetting.cycleLength}} روز</q-item-label> -->
            </q-item-section>
            <q-item-section side>{{normalPeriodSetting.cycleLength}} روز</q-item-section>
          </template>
          <q-card class="transparent">
            <q-card-section>
              <q-slider
                :value="cycleLength"
                @change="val => setNormalPeriodInfo({cycleLength: val})"
                snap
                label
                :min="18"
                :max="42"
              />
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-expansion-item>
          <template v-slot:header>
            <q-item-section>
              <q-item-label>{{periodSettingLabels.periodLength}}</q-item-label>
              <!-- <q-item-label caption>{{defaultPeriodSetting.periodLength}} روز</q-item-label> -->
            </q-item-section>
            <q-item-section side>{{normalPeriodSetting.periodLength}} روز</q-item-section>
          </template>
          <q-card class="transparent">
            <q-card-section>
              <q-slider
                :value="bleedingLength"
                @change="val => setNormalPeriodInfo({periodLength: val})"
                snap
                label
                :min="3"
                :max="7"
              />
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-item tag="label" v-ripple>
          <q-item-section>
            <q-item-label>{{useCervixLabels.title}}</q-item-label>
            <q-item-label caption v-if="useCervix">{{useCervixLabels.cervixModeOn}}</q-item-label>
            <q-item-label caption v-else>{{useCervixLabels.cervixModeOff}}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="useCervix" />
          </q-item-section>
        </q-item>

        <q-separator spaced />
        <q-item-label header>{{menuTitles.password}}</q-item-label>

        <q-item tag="label" v-ripple>
          <q-item-section>
            <q-item-label>{{appLockLabels.title}}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="lock" />
          </q-item-section>
        </q-item>

        <q-separator spaced />
        <q-item-label header>{{menuTitles.reminders}}</q-item-label>

        <q-item tag="label" v-ripple>
          <q-item-section>
            <q-item-label>{{tempReminderLabels.title}}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="tempReminder" />
          </q-item-section>
        </q-item>

        <q-item tag="label" v-ripple>
          <q-item-section>
            <q-item-label>{{periodReminderLabels.title}}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="periodReminder" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts">
import { Plugins } from '@capacitor/core'
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import labels from '../i18n/fa/settings';
import { ConfigState } from '../store/config';
import { CycleState } from '../store/cycle/models';
import { CHANGE_PERIOD_SETTING } from '../store/cycle/types';
import { SHOW_DIALOG } from '../store/ui';

const { LocalNotifications } = Plugins

function range(start: number, end: number) {
  const ans = [];
  for (let i = start; i <= end; i++) {
    ans.push({ description: `${i}` });
  }
  return ans;
}

const Cycle = namespace('cycle');
const Config = namespace('Config')
const Ui = namespace('UiStore')

@Component({})
export default class Me extends Vue {
  @Config.State private normalPeriodSetting: ConfigState['normalPeriodSetting']
  @Config.Action private setNormalPeriodInfo: (p: ConfigState['normalPeriodSetting']) => null;
  @Ui.Action(SHOW_DIALOG) private showDialog: any

  private menuTitles = labels.menuTitles;
  private periodSettingLabels = labels.periodSetting;
  private tempReminderLabels = labels.tempReminder;
  private periodReminderLabels = labels.periodReminder;
  private useCervixLabels = labels.useCervix
  private appLockLabels = labels.passwordSettings

  private useCervix = false
  private lock = false;
  private tempReminder = false
  private periodReminder = false

  private wheelSelectorData = {
    cycleLength: range(18, 42),
    bleedingLength: range(3, 7)
  };

  get cycleLength() {
    return this.normalPeriodSetting.cycleLength
  }

  get bleedingLength() {
    return this.normalPeriodSetting.periodLength
  }

  @Watch('tempReminder')
  private setTempReminder(newVal: boolean, oldVal: boolean) {
    if (oldVal === false) {
      LocalNotifications.schedule({
        notifications: [
          {
            title: 'Delayed ILocalNotification',
            body: 'some body',
            id: 1,
            schedule: { every: 'day' as const, on: { hour: 9 } },
            sound: null
          }]
      });
    } else {
      LocalNotifications.getPending().then(pendingList => {
        LocalNotifications.cancel(pendingList)
      })
    }
  }

  @Watch('lock')
  private setAppLock(val: boolean, old: boolean) {
    if (old === false) {
      this.$router.push('/lock')
    }
  }

  private changeCycleLength() {}

  private changePeriodLength() {}

}
</script>

<style lang="scss" scoped>

</style>
