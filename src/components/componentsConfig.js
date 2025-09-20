/*
 * @Author: jeffriesvAn
 * @Date: 2024-07-17 20:09:27
 * @LastEditors: jeffriesvAn
 * @LastEditTime: 2025-09-01 21:12:15
 * @FilePath: \vue-component-collection\src\components\componentsConfig.js
 */
import girdIcon from './assets/grid_icon.png'
import bulletIcon from './assets/bullet_icon.png'
import slotIcon from './assets/slot_icon.png'
import waterfallIcon from './assets/waterfall.png'
import birdIcon from './assets/birdIcon.png'
import modalIcon from './assets/modal.png'
import ailogo from './assets/ailogo.png'

const componentsRoutesReflect = [
  {
    name: '九宫格组件',
    eleKey: 'GRID_WHEEL',
    route: '/grid_wheel',
    icon: girdIcon
  },
  {
    name: '弹幕组件',
    eleKey: 'BULLET',
    route: '/bullet',
    icon: bulletIcon
  },
  {
    name: '老虎机组件',
    eleKey: 'SLOT_MACHINE',
    route: '/slot_machine',
    icon: slotIcon
  },
  {
    name: '瀑布流组件',
    eleKey: 'waterfall',
    route: '/waterfall',
    icon: waterfallIcon
  },
  {
    name: '飞翔小鸟组件',
    eleKey: 'flappyBird',
    route: '/flappyBird',
    icon: birdIcon
  },
  {
    name: '弹窗组件',
    eleKey: 'modal',
    route: '/modal',
    icon: modalIcon
  },
  {
    name: 'AI组件',
    eleKey: 'aiChat',
    route: '/aiChat',
    icon: ailogo
  },
]



export {
  componentsRoutesReflect,
}