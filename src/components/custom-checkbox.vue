<template>
  <div class="column items-center">
    <q-btn round :color="selected ? checkedColor : uncheckedColor" @click="updateInput">
      <q-avatar size="75px">
        <img :src="uncheckedIcon" :key="value" />
      </q-avatar>
    </q-btn>
    <span class="text-caption text-primary text-center">{{label}}</span>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Model, Prop, Vue, Watch } from 'vue-property-decorator'
import { BleedingSchema, DesireSchema, MoodSchema, PainSchema, SexSchema } from '../db/schemas';

@Component({})
export default class CustomCheckbox extends Vue {
  // @Model('change', {default:(): any => []}) public modelValue: string[]
  @Prop({default: false}) public selected: boolean
  @Prop() public value: string
  @Prop() public label: string
  @Prop() public checkedIcon: string
  @Prop() public uncheckedIcon: string
  @Prop() public checkedColor: string
  @Prop() public uncheckedColor: string
  @Prop({ default: false }) public styled: boolean
  // updatedValue: string[] = []

  private get icon() {return  this.uncheckedIcon }

  // private get initialModelValue() {
  //   return this.modelValue
  // }

  // private set initialModelValue(val) {
  //   this.updatedValue = [...this.updatedValue, ...val]
  // }

  // created() {
  //   this.initialModelValue = this.modelValue
  // }

  private updateInput() {
    const selected = !this.selected
    const value = this.value
    this.$emit('change', {selected, value})
    // const updated = this.updatedValue

    // if (updated.includes(this.value)) {
    //   updated.splice(updated.indexOf(this.value), 1)
    //   this.$emit('change', updated)
    // } else {
    //   const newVal  = [...updated, this.value]
    //   console.log(this.value)
    //   this.$emit('change', newVal)
    // }
  }
}
</script>

<style>
</style>
