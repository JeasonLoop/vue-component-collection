import { createRouter, createWebHistory } from 'vue-router'
import GridWheel from '../components/GridWheel/index.jsx'
import Home from '../pages/Home/Index.jsx'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/grid_wheel',
      name: 'grid_wheel',
      component: GridWheel
    },
  ]
})

export default router
