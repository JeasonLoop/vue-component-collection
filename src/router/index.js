import { createRouter, createWebHistory } from 'vue-router'
import GridWheel from '../components/GridWheel/index.jsx'
import Bullet from '../components/Bullet/index.vue'
import SlotMachine from '../components/SlotMachine/index.vue'
import EliminationGame from '../components/EliminationGame/index.vue'

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
    {
      path: '/slot_machine',
      name: 'slot_machine',
      component: SlotMachine
    },
  ]
})

export default router
