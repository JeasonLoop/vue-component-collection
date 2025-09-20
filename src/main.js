import './assets/main.css'

import { createApp } from 'vue'
import TDesign from 'tdesign-mobile-vue';
import App from './App.vue'
import router from './router'
import ModalPlugin from './components/Modal/modal'

// 引入组件库的少量全局样式变量
import 'tdesign-mobile-vue/es/style/index.css';

const app = createApp(App)

app.use(router).use(TDesign).use(ModalPlugin)
app.mount('#app')
