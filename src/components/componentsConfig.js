import girdIcon from './assets/grid_icon.png'
import bulletIcon from './assets/bullet_icon.png'
import slotIcon from './assets/slot_icon.png'
import { Message } from 'tdesign-mobile-vue'

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

  // 提示信息
  const showMessage = ({
    theme = 'success',
    content = '这是一条普通通知信息',
    duration = 1200,
    contextDom
  }) => {
    if (Message[theme]) {
      Message[theme]({
        offset: [10, 16],
        content,
        duration,
        icon: true,
        zIndex: 20000,
        context: contextDom || document.querySelector('#app'),
      });
    }
  };

  const generateRandomArray = (length, maxLength) => {
    const randomArray = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      const stringLength = Math.floor(Math.random() * maxLength) + 1;
      let randomString = '';
      for (let j = 0; j < stringLength; j++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
      }
      randomArray.push(randomString);
    }

    return randomArray;
  }

  const getRandomNum = (min,max) => {
    return Math.random() * ((max - min) + min);  //常用
}

export {
  componentsRoutesReflect,
  showMessage,
  generateRandomArray,
  getRandomNum
}