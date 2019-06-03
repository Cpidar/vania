import { RouteConfig, NavigationGuard } from 'vue-router'
import Mylayout from '../layouts/MyLayout.vue'
import HomePage from '../pages/home.vue'
import CalendarPage from '../pages/calendar.vue'
import InitialConfigPage from '../pages/initial-config.vue'
import { LocalStorage } from 'quasar'
import { dispatch } from 'src/state';


const routes: RouteConfig[] = [
  {
    path: '/',
    component: Mylayout,
    beforeEnter: (to, from, next) => {
      const appOpenedBefore = LocalStorage.getItem('appOpenedBefore')
      if(appOpenedBefore) {
        next()
        dispatch('init')
      } else {
        next('/initialConfig')
      }
    },
    children: [
      { path: '', component: HomePage },
      // { path: 'calendar', component: () => import('pages/calendar.vue') },
      { path: 'calendar', component: CalendarPage },
    ]
  },
  {
    path: '/initialConfig',
    component: InitialConfigPage
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
