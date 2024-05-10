import { createRouter, createWebHistory } from 'vue-router'
import GridWheel from '../components/GridWheel/index.jsx'
import PreviewPDF from '../components/PreviewPDF/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/grid_wheel',
      name: 'grid_wheel',
      component: GridWheel
    },
    {
      path: '/preview_pdf',
      name: 'preview_pdf',
      component: PreviewPDF
    },
  ]
})

export default router
