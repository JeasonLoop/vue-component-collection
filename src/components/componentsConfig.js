import girdIcon from './assets/grid_icon.png'
import bulletIcon from './assets/bullet_icon.png'
import slotIcon from './assets/slot_icon.png'

const componentsRoutesReflect = [
  {
    name: '九宫格组件',
    eleKey:'GRID_WHEEL',
    route:'/grid_wheel',
    icon: girdIcon
  },
  {
    name: '弹幕组件',
    eleKey:'BULLET',
    route:'/bullet',
    icon: bulletIcon
  },
  {
    name: '老虎机组件',
    eleKey:'SLOT_MACHINE',
    route:'/slot_machine',
    icon: slotIcon
  },
]



export {
  componentsRoutesReflect,
}