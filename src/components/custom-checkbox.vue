<template>
  <div class="ic-container">
    <q-btn round size="18px" :color="shouldBeChecked ? checkedColor : uncheckedColor" @click="updateInput" >
      <q-avatar size="55px">
        <img
          width="42px"
          height="42px"
          :src="uncheckedIcon"
          :key="value"
        />
      </q-avatar>
      <span class="text-caption text-primary">{{label}}</span>
    </q-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Emit } from 'vue-property-decorator'
import { PainSchema, BleedingSchema, MoodSchema, SexSchema, DesireSchema } from '../db/schemas';

@Component({})
export default class CustomCheckbox extends Vue {
  @Model('change') readonly modelValue: string[]
  @Prop({ default: false }) styled: boolean
  @Prop() value: string
  @Prop() label: string
  @Prop() checkedIcon: string
  @Prop() uncheckedIcon: string
  @Prop() checkedColor: string
  @Prop() uncheckedColor: string

  icon = this.uncheckedIcon
  updatedModel = this.modelValue || []

  get shouldBeChecked() {
    // let updatedModel = this.modelValue
    // return updatedModel[this.value]
    return this.updatedModel.includes(this.value)
  }

  updateInput() {
    if (this.updatedModel.includes(this.value)) {
      this.updatedModel.splice(this.updatedModel.indexOf(this.value), 1)
    } else {
      this.updatedModel.push(this.value)
    }
    // let updatedModel = this.modelValue
    // updatedModel[this.value] = !updatedModel[this.value]
    this.$emit('change', this.updatedModel)
  }
}
</script>

<style>
.icon {
  border-radius: 50%;
}
.box {
  position: relative;
}
.box::after {
  position: absolute;
  background-image: url("../assets/icons/ic_selected_green.png");
  background-size: 18px 18px;
  display: inline-block;
  width: 18px;
  height: 18px;
  right: 0;
  bottom: 9px;
  content: "";
}
input[type="checkbox"] {
  display: none;
}
input[type="checkbox"] > label img {
  display: inline-block;
  vertical-align: middle;
  width: 45px;
  height: 45px;
  transition: all 0.2;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
