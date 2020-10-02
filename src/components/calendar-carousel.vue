<template>
  <div>
    <calendar-header
      :date="getSelectedDay$"
      @next-month="$refs.carousel.next()"
      @prev-month="$refs.carousel.previous()"
      @today="goToToday"
      v-if="header"
    />
    <q-carousel
      animated
      swipeable
      height="100%"
      transition-next="slide-left"
      transition-prev="slide-right"
      v-model="slide"
      ref="carousel"
      class="bg-transparent no-padding"
    >
      <q-carousel-slide
        v-for="(month, index) in monthList"
        :key="month"
        :name="index"
      >
        <Calendar
          :current="month"
          :key="calendarKey"
          :showPeriod="showPeriodOnCalendar"
          :showFertility="showFertilityOnCalendar"
          :showPHN="showPhnOnCalendar"
        />
      </q-carousel-slide>
    </q-carousel>

    <calendar-footer v-if="footer" />
  </div>
</template>

<script lang="ts">
import {
  dispatch,
  getMonthList,
  LongDateModel,
  longSelectedDayObj,
  model$,
} from "../state";

import { map, pluck } from "rxjs/operators";
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { SET_DATE } from "../store/cycle/types";
import CalendarHeader from './calendar-header.vue'
import CalendarFooter from './calendar-footer.vue'

const Cycle = namespace("cycle");
const Ui = namespace("UiStore");

@Component<CalendarCarousel>({
  components: {
    Calendar: () => import("../components/calendar-comp.vue"),
    CalendarHeader,
    CalendarFooter
  },
  subscriptions() {
    const monthList = getMonthList(10);
    const currentDay = longSelectedDayObj.pipe(pluck("date"));
    return {
      getSelectedDay$: longSelectedDayObj,
      mDate: longSelectedDayObj.pipe(pluck("mDate")),
      monthList,
      currentDay,
      isAfterToday: model$.pipe(map((m) => m.selectedDay > m.today)),
      today: model$.pipe(pluck("today")),
    };
  },
})
export default class CalendarCarousel extends Vue {
  @Prop({ default: true }) private header: boolean;
  @Prop({ default: true }) private footer: boolean;

  private mDate: string = "";
  private getSelectedDay$: LongDateModel;

  private slide = 10;
  private currentDay: string = "";
  private monthList: string[] = [];
  private calendarKey = 1;
  private today = "";

  @Ui.State private showPeriodOnCalendar: boolean;
  @Ui.State private showFertilityOnCalendar: boolean;
  @Ui.State private showPhnOnCalendar: boolean;

  @Cycle.Mutation(SET_DATE) private setDate: (date: string) => null;

  @Watch("slide")
  private onSlideChange() {
    const selectedDay = this.monthList[this.slide];
    dispatch("selectDay", { selectedDay });
    this.setDate(selectedDay);
  }

  private goToToday() {
    this.slide = 10;
    this.$nextTick(() => {
      dispatch("selectDay", { selectedDay: this.today });
      this.setDate(this.mDate);
    });
  }
}
</script>

<style lang="scss" scoped>
</style>
