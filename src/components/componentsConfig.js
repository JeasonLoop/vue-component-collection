import girdIcon from './assets/grid_icon.png'
import bulletIcon from './assets/bullet_icon.png'
import slotIcon from './assets/slot_icon.png'
import waterfallIcon from './assets/waterfall.png'
import birdIcon from './assets/birdIcon.png'

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
  }
]



export {
  componentsRoutesReflect,
}