import { createRouter, createWebHistory } from 'vue-router'
import GridWheel from '../components/GridWheel/index.jsx'
import Bullet from '../components/Bullet/index.vue'
import SlotMachine from '../components/SlotMachine/index.vue'
import WaterFall from '../components/WaterFall/index.vue'
import FlappyBird from '../components/FlappyBird/index.vue'
import Modal from '../components/Modal/index.vue'
import AIChat from '../components/AIChat/index.vue'
import RedRain from '../components/RedRain/index.vue'

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
    {
      path: '/waterfall',
      name: 'waterfall',
      component: WaterFall
    },
    {
      path: '/flappyBird',
      name: 'flappyBird',
      component: FlappyBird
    },
    {
      path: '/modal',
      name: 'modal',
      component: Modal
    },
    {
      path: '/aiChat',
      name: 'aiChat',
      component: AIChat
    },
    {
      path: '/redRain',
      name: 'redRain',
      component: RedRain
    }
  ]
})

export default router
