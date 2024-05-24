<script lang="" setup>
import { ref } from 'vue'
import SlotMachine from './component.vue'
import chicken from './assets/prizeImgs/小鸡.png'
import cat from './assets/prizeImgs/小猫.png'
import dog from './assets/prizeImgs/小狗.png'
import whiteBear from './assets/prizeImgs/白熊.png'
import duck from './assets/prizeImgs/小鸭.png'
import pig from './assets/prizeImgs/小猪.png'
import rabbit from './assets/prizeImgs/兔子.png'
import frog from './assets/prizeImgs/青蛙.png'
import pigeon from './assets/prizeImgs/鸽子.png'

const prizeImgs = [chicken, cat, dog, whiteBear, duck, pig, rabbit, frog, pigeon]
const slotsData = ref(prizeImgs.map((item, idx) => {
  return {
    name: `某种小动物${idx}`,
    isActived: 0,
    imgUrl: item
  }
})) // 抽奖数据

const isRandom = ref(false); // 是否打乱数组顺序
const slotRef = ref(null)

const startRoll = () => {
  slotRef.value.roll()
}

const stop = (name) => {
  slotRef.value.stop(name)
}

const changeRandom = () => {
  isRandom.value = !isRandom.value
}

</script>

<template lang="">
  <div>
    <SlotMachine
     ref='slotRef'
     :isRandom='isRandom'
     :prizes='slotsData'
    />

    <button class="btn" @click='startRoll'>开始抽奖</button>
    <button class="btn" @click='stop(`某种小动物3`)'  >停止抽奖</button>
    <button class="btn" @click='changeRandom' >
    {{ isRandom ? '不随机初始数组' : '随机初始数组' }}
  </button>
  </div>
</template>

<style lang="">

</style>