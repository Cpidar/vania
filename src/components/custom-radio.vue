<template>
  <q-btn
    round
    size="18px"
    :color="shouldBeChecked ? checkedColor : uncheckedColor"
    @click="updateInput"
  >
    <q-avatar size="55px">
      <img
        width="42px"
        height="42px"
        :src="shouldBeChecked ? checkedIcon : uncheckedIcon"
        :key="value"
      />
    </q-avatar>
    <span class="text-caption text-primary">{{ label }}</span>
  </q-btn>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model } from 'vue-property-decorator'

@Component({})
export default class CustomCheckBox extends Vue {
  @Model('change') modelValue: any
  @Prop() value: number
  @Prop() label: string
  @Prop() checkedIcon: string
  @Prop() uncheckedIcon: string
  @Prop() checkedColor: string
  @Prop() uncheckedColor: string

  get shouldBeChecked() {
    return this.modelValue === this.value
  }
  updateInput() {
    this.shouldBeChecked ? this.$emit('change', -1) : this.$emit('change', this.value)
  }
}
</script>

<style>
.icon {
  border-radius: 50%;
}
.box {
  position: relative;
  width: 55px;
  height: 55px;
  border-radius: 50%;
}
.box::after {
  position: absolute;
  background-image: url("../assets/icons/ic_selected_green.png");
  background-size: 18px 18px;
  display: inline-block;
  width: 22px;
  height: 22px;
  left: 3px;
  bottom: 9px;
  content: "";
}

input[type="radio"] {
  display: none;
}
input[type="radio"] > label img {
  display: inline-block;
  vertical-align: middle;
  width: 45px;
  height: 45px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
