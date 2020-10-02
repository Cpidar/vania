<template>
  <section class="q-mx-auto" style="width: 300px">
    <q-field rounded standout>
      <template v-slot:control>
        <div v-for="(ev, id) of events" :key="id" class="self-center full-width no-outline text-center" tabindex="0">
          {{ev}}
        </div>
      </template>
    </q-field>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class EventSection extends Vue {
  @Prop({ default: () => ({ events: [''] }) }) public events: string[]
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
