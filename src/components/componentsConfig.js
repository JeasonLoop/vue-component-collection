import girdIcon from './assets/grid_icon.png'
import { Message } from 'tdesign-mobile-vue'

const componentsRoutesReflect = [
  {
    name: '九宫格组件',
    eleKey:'GRID_WHEEL',
    route:'/grid_wheel',
    icon: girdIcon
  },
]

  // 提示信息
  const showMessage = ({
    theme,
    content = '这是一条普通通知信息',
    duration = 5000,
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

export {
  componentsRoutesReflect,
  showMessage
}