import jMoment from 'moment-jalaali'
import { CycleDaySchema } from 'src/db/schemas';


jMoment.locale('fa')
jMoment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

export interface Model {
  status: string;
  month: string;
  selectedDay: string;
  today: string;
  events: { type: string, title: string }[];
  cycleDays: CycleDaySchema[];
  // currentCycle: { start: string, cycleLength: number, bleedindLength: number };
}

export const initialModel: Model = {
  status: 'INIT',
  month: jMoment().startOf('jMonth').format('jYYYY-jMM-jDD'),
  selectedDay: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  today: jMoment().startOf('day').format('jYYYY-jMM-jDD'),
  events: [],
  cycleDays: [],
}
export default {
  initialModel
}
