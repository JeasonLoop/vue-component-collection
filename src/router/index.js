import { createRouter, createWebHistory } from 'vue-router'
import GridWheel from '../components/GridWheel/index.jsx'
import Bullet from '../components/Bullet/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/grid_wheel',
      name: 'grid_wheel',
      component: GridWheel
    },
    {
      path: '/bullet',
      name: 'bullet',
      component: Bullet
    },
  ]
})

export default router
