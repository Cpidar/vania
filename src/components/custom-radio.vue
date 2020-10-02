<template>
<div class="column items-center">
  <q-btn
    round
    :color="shouldBeChecked ? checkedColor : uncheckedColor"
    @click="updateInput"
  >
    <q-avatar size="75px">
      <img
        :src="shouldBeChecked ? checkedIcon : uncheckedIcon"
        :key="value"
      />
    </q-avatar>
  </q-btn>
      <span class="text-caption text-primary">{{ label }}</span>
</div>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class CustomRadio extends Vue {
  @Model('change') public modelValue: any
  @Prop() public value: number
  @Prop() public label: string
  @Prop() public checkedIcon: string
  @Prop() public uncheckedIcon: string
  @Prop() public checkedColor: string
  @Prop() public uncheckedColor: string

  get shouldBeChecked() {
    return this.modelValue === this.value
  }
  private updateInput() {
    this.shouldBeChecked ? this.$emit('change', -1) : this.$emit('change', this.value)
  }
}
</script>

<style lang="scss" scoped>
</style>
