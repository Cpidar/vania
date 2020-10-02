<template>
  <div>
    <q-btn
      class="glossy"
      round
      :outline="note === undefined || note === ''"
      color="purple"
      icon="eva-edit-2-outline"
      @click="toggle"
    ></q-btn>
    <q-dialog
      v-model="shownDialog"
      position="bottom"
      full-width
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-purple-1" style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{title}}</div>
          <!-- <div class="text-caption">{{Bleedinglabels.heaviness.explainer}}</div> -->
        </q-card-section>

        <q-card-section>
           <q-input v-model="note" type="textarea" class="full-width" autogrow/>
        </q-card-section>

        <q-card-actions align="left" class="bg-purple text-white">
          <q-btn flat :label="sharedLabels.save" @click="saveBleeding" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class'
import { BleedingSchema, MucusSchema } from '../db/schemas';
// import iRadio from './custom-radio.vue'
import { bleeding, sharedDialogs } from '../i18n/fa/cycle-day';
import { headerTitles } from '../i18n/fa/labels';
import { dispatch } from '../state';
import { SAVE_PHN } from '../store/cycle/types';
import { TOGGLE_NOTE_DIAL } from '../store/ui';

const Cycle = namespace('cycle')
const Ui = namespace('UiStore')

interface PhnIcon {
  key: number | string;
  label: string;
  icon: () => any;
  checkedIcon?: () => any;
}

@Component({
  components: { iRadio: () => import('./custom-radio.vue') }
})
export default class NoteDialog extends Vue {
  @Prop() public data: string;
  @Prop() public date: string;

  @Ui.State private noteDialog: boolean
  @Ui.Action(TOGGLE_NOTE_DIAL) private toggle: any
  @Cycle.Action(SAVE_PHN) private save: any

  private title = headerTitles.NoteEditView;
  private Bleedinglabels = bleeding;
  private sharedLabels = sharedDialogs;

  private exclude: boolean = false;
  private bleeding = -1;
  private note: string = ''

  private bleedIcons: PhnIcon[] = this.Bleedinglabels.labels.map((x, i) => ({
    key: i,
    label: x,
    icon() {
      return require(`../assets/icons/ic_bl_${i}.png`);
    },
    checkedIcon() {
      return require(`../assets/icons/ic_bl_${i}_l.png`);
    }
  }));

  get shownDialog() {
    return this.noteDialog
  }
  set shownDialog(val) {
    this.toggle()
  }

  @Watch('data', { immediate: true })
  private onDataChange() {
    this.note = this.data;
    // this.exclude = this.data && this.data.exclude;
  }

  private saveBleeding() {
    const phn = {
      date: this.date,
      note: this.note
    }
    this.save(phn)
  }

}
</script>

<style lang="scss" scoped></style>

