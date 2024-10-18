<template lang="">
  <div class="box">
    <div class='waterfall_list' ref='waterfallListRef'>
       <div class='card_item' v-for="item in [...array]" :key='item.id' :style="{height: `${item.height}px`}">
         {{ item.id }}
       </div>
       <div class="loading_box" ref='loadingRef' id='loading'>
          <div class="loading" />
       </div>
    </div>
  </div>
</template>
<script lang="" setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { randomString } from '../utils'

// clientWidth 处理兼容性:获得浏览器可视区域的宽和高
const getClient = () => {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  }
}


const props = defineProps({})
const array = ref(new Array(20).fill({}).map((item, index) => ({ id: randomString(5), height: 100 + Math.random() * 200 })))
const waterfallListRef = ref(null) // item列表的父容器
const itemWidth = ref(getClient().width / 2 - 10) // 每个item的宽度
const margin = ref(10) // 每个item的margin
const loadingRef = ref(null)
let ob = null

// item布局初始化
const initItemDisplay = (itemContainer) => {
  // 初始化数组
  const cols = Math.floor(itemContainer.clientWidth / (itemWidth.value + margin.value)) // 列数
  const items = itemContainer.children
  const itemHeightList = [] // 存储每一列的item高度

  console.log('-------------------------------------------------');
  console.log('页面宽度', getClient().width);
  console.log('页面高度', getClient().height);
  console.log('item宽度', itemWidth.value);
  console.log('-------------------------------------------------');

  // 计算每个item的位置
  for (let i = 0; i < items.length - 1; i++) { // 这边减1是最后一个元素是loading或者没有更多了
    items[i].style.width = `${itemWidth.value}px`
    if (i < cols) {
      // 对第一行图片进行布局
      items[i].style.top = `${margin.value}px`
      items[i].style.left = ((itemWidth.value + margin.value) * i) + margin.value / 2 + 'px';
      itemHeightList.push(items[i].offsetHeight);

    } else {
      // 对接下来的图片进行定位
      // 首先要找到数组中最小高度和它的索引
      let minHeight = itemHeightList[0];
      let index = 0;
      for (let j = 0; j < itemHeightList.length; j++) {
        if (minHeight > itemHeightList[j]) {
          minHeight = itemHeightList[j];
          index = j;
        }
      }
      // 设置下一行的第一个盒子位置
      // top值就是最小列的高度 + margin
      items[i].style.position = 'absolute';
      items[i].style.top = `${itemHeightList[index] + margin.value * 2}px`;
      // left值就是最小列距离左边的距离
      items[i].style.left = `${items[index].offsetLeft}px`;

      // 修改最小列的高度
      // 最小列的高度 = 当前自己的高度 + 拼接过来的高度 + 间隙的高度
      itemHeightList[index] = itemHeightList[index] + items[i].offsetHeight + margin.value;
    }
  }
  waterfallListRef.value.style.height = `${Math.max(...itemHeightList) + 100}px`
}

// 初始滚动加载监听
const initIntersectionOb = () => {
  ob = new IntersectionObserver((entries) => { 
    if (entries[0].isIntersecting) {
      console.log('交互触发');
      // 加载更多数据 调用新接口
      setTimeout(() => {
        const addtionalArr = new Array(10).fill({}).map((item, idx) => ({ id: randomString(5), height: 100 + Math.random() * 200 }))
        array.value = [...array.value, ...addtionalArr]
        // 在页面渲染完成后执行回调函数中的逻辑。接受一个回调函数作为参数。nextTick 是异步操作，且属于微任务
        nextTick(() => {
          initItemDisplay(waterfallListRef.value)
        })
      }, 1000);
    }
  }, {
    threshold: 1,
  });
  ob.observe(document.querySelector('#loading'));
};

onMounted(() => {
  initIntersectionOb()
  window.onresize = () => {
    initItemDisplay(newRef)
  }
})

onUnmounted(() => {
  ob.disconnect()
})

watch(() => waterfallListRef.value, (newListRef) => {
  if (newListRef ) {
    initItemDisplay(newListRef)
  }
}, { immediate: true, deep: true })

</script>
<style lang="css">
@import 'index.css';
</style>