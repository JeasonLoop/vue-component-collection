

import { Message } from 'tdesign-mobile-vue'

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

const getRandomNum = (min, max) => {
  return Math.random() * ((max - min) + min);  //常用
}

const randomString = (e) => {
  e = e || 32;
  let t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
  a = t.length,
  n = "";
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

export {
  showMessage,
  generateRandomArray,
  getRandomNum,
  randomString
}