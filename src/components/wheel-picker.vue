<template>
      <div class="picker" @touchmove.prevent @click="_cancel">
        <transition name="picker-move">
          <div class="picker-panel"  @click.stop>
            <div class="picker-content">
              <div class="mask-top border-bottom-1px"></div>
              <div class="mask-bottom border-top-1px"></div>
              <div class="wheel-wrapper" ref="wheelWrapper">
                <div class="wheel" v-for="(data, index) in pickerData" :key="index">
                  <ul class="wheel-scroll">
                    <li v-for="item in data" :key="item.value" class="wheel-item">{{item.text}}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="picker-footer"></div>
          </div>
        </transition>
      </div>
</template>

<script type="text/ecmascript-6">
import BScroll from "@better-scroll/core";
import Wheel from "@better-scroll/wheel";
BScroll.use(Wheel);
const STATE_HIDE = 0;
const STATE_SHOW = 1;

const COMPONENT_NAME = "picker";
const EVENT_SELECT = "select";
const EVENT_CANCEL = "cancel";
const EVENT_CHANGE = "change";

export default {
  name: COMPONENT_NAME,
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      state: STATE_HIDE,
      selectedIndex: [0, 0],
      selectedText: "open",
      pickerData: this.data.slice()
    };
  },
  methods: {
    _confirm() {
      if (this._isMoving()) {
        return;
      }
      this.hide();

      const currentSelectedIndex = (this.selectedIndex = this.wheels.map(
        wheel => {
          return wheel.getSelectedIndex();
        }
      ));

      // store array for preventing multi-collecting array dependencies in Vue source code
      const pickerData = this.pickerData;
      const currentSelectedValue = (this.selectedText = pickerData
        .map((data, index) => {
          return data[currentSelectedIndex[index]].text;
        })
        .join("-"));
      this.$emit(EVENT_SELECT, currentSelectedIndex, currentSelectedValue);
    },
    _cancel() {
      this.hide();
      this.$emit(EVENT_CANCEL);
    },
    _isMoving() {
      return this.wheels.some(wheel => {
        return wheel.pending;
      });
    },
    show() {
      if (this.state === STATE_SHOW) {
        return;
      }
      this.state = STATE_SHOW;

      if (!this.wheels) {
        // waiting for DOM rendered
        this.$nextTick(() => {
          this.wheels = [];
          let wheelWrapper = this.$refs.wheelWrapper;
          console.log(this.$refs);
          for (let i = 0; i < this.pickerData.length; i++) {
            this._createWheel(wheelWrapper, i);
          }
        });
      } else {
        for (let i = 0; i < this.pickerData.length; i++) {
          this.wheels[i].enable();
          this.wheels[i].wheelTo(this.selectedIndex[i]);
        }
      }
    },
    hide() {
      this.state = STATE_HIDE;

      for (let i = 0; i < this.pickerData.length; i++) {
        // if wheel is in animation, clear timer in it
        this.wheels[i].disable();
      }
    },
    refresh() {
      this.$nextTick(() => {
        this.wheels.forEach((wheel, index) => {
          wheel.refresh();
        });
      });
    },
    _createWheel(wheelWrapper, i) {
      if (!this.wheels[i]) {
        this.wheels[i] = new BScroll(wheelWrapper.children[i], {
          wheel: {
            selectedIndex: this.selectedIndex[i],
            wheelWrapperClass: "wheel-scroll",
            wheelItemClass: "wheel-item"
          },
          probeType: 3
        });
        this.wheels[i].on("scrollEnd", () => {
          this.$emit(EVENT_CHANGE, i, this.wheels[i].getSelectedIndex());
        });
      } else {
        this.wheels[i].refresh();
      }

      return this.wheels[i];
    }
  },
    mounted() {
    this.show()
  },
};
</script>

<style scoped lang="scss">
/* reset */
ul {
  list-style: none;
  padding: 0;
}

.example-list {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 2rem;

  .example-item {
    background-color: white;
    padding: 0.8rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    text-align: center;
    margin-bottom: 1rem;
    flex: 1;

    &.placeholder {
      visibility: hidden;
      height: 0;
      margin: 0;
      padding: 0;
    }
  }
}

.picker {
  position: relative;
  left: 0;
  top: 0;
  z-index: 100;
  width: 100%;
  height: 100%;
  overflow: hidden;
  text-align: center;
  font-size: 14px;
  // background-color: rgba(37, 38, 45, 0.4);

  &.picker-fade-enter, &.picker-fade-leave-active {
    opacity: 0;
  }

  &.picker-fade-enter-active, &.picker-fade-leave-active {
    transition: all 0.3s ease-in-out;
  }

  .picker-panel {
    position: relative;
    z-index: 600;
    bottom: 0;
    width: 100%;
    height: 273px;
    background: white;

    &.picker-move-enter, &.picker-move-leave-active {
      transform: translate3d(0, 273px, 0);
    }

    &.picker-move-enter-active, &.picker-move-leave-active {
      transition: all 0.3s ease-in-out;
    }

    .picker-choose {
      position: relative;
      height: 60px;
      color: #999;

      .picker-title {
        margin: 0;
        line-height: 60px;
        font-weight: normal;
        text-align: center;
        font-size: 18px;
        color: #333;
      }

      .confirm, .cancel {
        position: absolute;
        top: 6px;
        padding: 16px;
        font-size: 14px;
      }

      .confirm {
        right: 0;
        color: #007bff;

        &:active {
          color: #5aaaff;
        }
      }

      .cancel {
        left: 0;

        &:active {
          color: #c2c2c2;
        }
      }
    }

    .picker-content {
      position: relative;
      top: 20px;

      .mask-top, .mask-bottom {
        z-index: 10;
        width: 100%;
        height: 68px;
        pointer-events: none;
        transform: translateZ(0);
      }

      .mask-top {
        position: absolute;
        top: 0;
        background: linear-gradient(to top, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.8));
      }

      .mask-bottom {
        position: absolute;
        bottom: 1px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.8));
      }
    }

    .wheel-wrapper {
      display: flex;
      padding: 0 16px;

      .wheel {
        -ms-flex: 1 1 1e -9px;
        -webkit-box-flex: 1;
        -webkit-flex: 1;
        flex: 1;
        -webkit-flex-basis: 1e -9px;
        flex-basis: 1e -9px;
        width: 1%;
        height: 173px;
        overflow: hidden;
        font-size: 18px;

        .wheel-scroll {
          padding: 0;
          margin-top: 68px;
          line-height: 36px;
          list-style: none;

          .wheel-item {
            list-style: none;
            height: 36px;
            overflow: hidden;
            white-space: nowrap;
            color: #333;

            &.wheel-disabled-item {
              opacity: 0.2;
            }
          }
        }
      }
    }
  }

  .picker-footer {
    height: 20px;
  }
}
</style>