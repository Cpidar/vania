import VueRx from 'vue-rx'
import { Observable, Subject, Subscription } from 'rxjs'

// leave the export, even if you don't use it
// @ts-ignore
export default ({ Vue }) => {
  Vue.use(VueRx, { Observable, Subject, Subscription })
}
