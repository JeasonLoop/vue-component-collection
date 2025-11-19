import { createRouter, createWebHistory } from 'vue-router'
import GridWheel from '../components/GridWheel/index.jsx'
import Bullet from '../components/Bullet/index.vue'
import SlotMachine from '../components/SlotMachine/index.vue'
import WaterFall from '../components/WaterFall/index.vue'
import FlappyBird from '../components/FlappyBird/index.vue'
import Modal from '../components/Modal/index.vue'
import AIChat from '../components/AIChat/index.vue'
import RedRain from '../components/RedRain/index.vue'
import Progress from '../components/Progress/index.vue'
import Puzzle from '../components/Puzzle/index.vue'
import Game2048 from '../components/2048/index.vue'
import Snake from '../components/Snake/index.vue'

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
    },
    {
      path: '/progress',
      name: 'progress',
      component: Progress
    },
    {
      path: '/puzzle',
      name: 'puzzle',
      component: Puzzle
    },
    {
      path: '/2048',
      name: '2048',
      component: Game2048
    },
    {
      path: '/snake',
      name: 'snake',
      component: Snake
    },
  ]
})

export default router
