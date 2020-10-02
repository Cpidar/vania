import { RouteConfig } from 'vue-router'
import Mylayout from '../layouts/MyLayout.vue'
import CalendarPage from '../pages/calendar.vue'
import HomePage from '../pages/home.vue'
import InitialConfigPage from '../pages/initial-config.vue'
import LockPage from '../pages/lock-screen.vue'
import MePage from '../pages/me.vue'
import ReportsPage from '../pages/reports.vue'
import store from '../store';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: Mylayout,
    beforeEnter: async (to, from, next) => {
      const c = await store().dispatch('Config/init')
      const appOpenedBefore = await c.isAppOpenedBefore
      const appLock = await c.appLock
      if (await appOpenedBefore) {
        next()
      } else {
        next('/initialConfig')
        store().dispatch('Config/setAppOpened', { root: true })
      }

      if (!appLock) {
        next()
      } else {
        next('/lock')
      }
    },
    children: [
      { path: '', component: HomePage},
      { path: 'home', component: HomePage},
      // { path: 'calendar', component: () => import('pages/calendar.vue') },
      { path: 'calendar', component: CalendarPage },
      { path: 'me', component: MePage },
      { path: 'reports', component: ReportsPage }
    ]
  },
  {
    path: '/initialConfig',
    component: InitialConfigPage
  },
  {
    path: '/lock',
    component: LockPage
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
