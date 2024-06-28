<template lang="">
  <div class="box">
    <div class='waterfall_list' ref='waterfallListRef'>
     <div class='card_item' v-for="item in array" :key='item.id' :style="{height: `${item.height}px`}">
       {{ item.id }}
     </div>
  </div>
  </div>
</template>
<script lang="" setup>
import { ref, onMounted, watch } from 'vue'
const props = defineProps({})
const array = ref(new Array(20).fill({}).map((item, index) => ({ id: index , height: 100 + Math.random() * 200})))

// clientWidth 处理兼容性:获得浏览器可视区域的宽和高
const getClient = () => {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  }
}
// scrollTop兼容性处理 :获得浏览器可视区域 距 整个html文档顶部的距离
const getScrollTop = () => {
  return window.pageYOffset || document.documentElement.scrollTop;
}

const waterfallListRef = ref(null) // item列表的父容器
const itemWidth = ref(getClient().width / 2 - 10) // 每个item的宽度
const margin = ref(10) // 每个item的margin



// item布局初始化
const initItemDisplay = (itemContainer) => {
  // 初始化数组
  const cols = Math.floor(itemContainer.clientWidth / (itemWidth.value + margin.value)) // 列数
  const items = itemContainer.children
  const itemHeightList = [] // 存储每一列的item高度

  console.log('-------------------------------------------------');
  console.log('页面宽度', getClient().width);
  console.log('页面高度', getClient().height);
  console.log('scrollTop', getScrollTop());
  console.log('item宽度', itemWidth.value);
  console.log('-------------------------------------------------');

  // 计算每个item的位置
  for (let i = 0; i < items.length; i++) {
    items[i].style.width = `${itemWidth.value}px`
    if (i < cols) {
      // 对第一行图片进行布局
      items[i].style.top = `${margin.value}px`
      items[i].style.left = ((itemWidth.value + margin.value) * i ) + margin.value / 2 + 'px';
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
}

watch(() => waterfallListRef.value, (newRef) => {
  if(newRef){
    initItemDisplay(newRef)
  }
  window.onresize = () => {
    initItemDisplay(newRef)
  }
}, { immediate: true, deep: true })


</script>
<style lang="css">
.box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
.waterfall_list {
    position: relative;
    width: 100%;
    height: 100%;
}

.card_item {
    position: absolute;
    background: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: #fff;
}
</style>