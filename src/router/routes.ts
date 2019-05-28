import { RouteConfig } from 'vue-router'
import Mylayout from '../layouts/MyLayout.vue'
import HomePage from '../pages/home.vue'
import CalendarPage from '../pages/calendar.vue'
const routes: RouteConfig[] = [
  {
    path: '/',
    component: Mylayout,
    children: [
      { path: '', component: HomePage },
      // { path: 'calendar', component: () => import('pages/calendar.vue') },
      { path: 'calendar', component: CalendarPage },
    ]
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
