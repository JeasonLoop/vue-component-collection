<script lang="" setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps([
  'isRandom',
  'prizes',
])

const { prizes = [], isRandom = false } = props

const ITEM_HEIGHT = 90
let overTimer = null

const slotsTracks = ref([
  { title: "组1", trans: 0, items: [] },
  { title: "组2", trans: 0, items: [] },
  { title: "组3", trans: 0, items: [] }
])
const animateDuration = ref(5); // 滚动时长：秒
const isRolling = ref(false)
const overTimeCount = ref(0); // 转动计时
const nextRoundFactor = ref(0) // 转动因子

// 数组洗牌
const shuffleArray = (array) => {
  const newArray = array.slice(); // 克隆原始数组，以避免修改原数组
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1)); // 生成 0 到 i 之间的随机数
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // 交换元素位置
  }
  return newArray;
};

// 初始化slotTracks组数据
const initSlotsTracks = () => {
  const copyPrizes = [...prizes]
  const updatedSlots = slotsTracks?.value?.map((slot) => {
    const items = isRandom.value ? shuffleArray(copyPrizes) : copyPrizes;
    return {
      ...slot,
      items,
    };
  });
  slotsTracks.value = updatedSlots
};

// 开始转动
const startRoll = () => {
  isRolling.value = true
}

// 停止转动
const stopRoll = (idx) => {

}

defineExpose({ startRoll, stopRoll })

onMounted(() => {
  initSlotsTracks()
})

watch(() => [isRolling.value, overTimeCount.value], () => {
  if (!isRolling.value) return
  overTimer = setTimeout(() => {

    const trans = ITEM_HEIGHT + (ITEM_HEIGHT * (overTimeCount.value))

    slotsTracks.value[0].trans = -trans
    setTimeout(() => {
      slotsTracks.value[1].trans = -trans
    }, 500);
    setTimeout(() => {
      slotsTracks.value[2].trans = -trans
    }, 1000);
    overTimeCount.value++
  }, 100);
}, { immediate: true, deep: true})

</script>

<template lang="">
  <div class='slots_box' v-if='slotsTracks?.length'>
    <div class='slot_box' v-for="track in slotsTracks">
    <div class="slots_track" :style="{ transform: `translateY(${track.trans}px)` }">
      <div
        class="slot_item"
        v-for="item in track.items"
        :key="item.name"
        :style="{ backgroundImage: `url(${item.imgUrl})`}"
      />
      <div
        class="slot_item"
        :key="track.items[0]?.name"
        :style="{ backgroundImage: `url(${track.items[0]?.imgUrl})`}"
      />
    </div>
  </div>
  </div>
</template>

<style lang="css">
.slots_box {
    padding: 20px 0;
    overflow: hidden;
    text-align: center;
    width: 100%;
    height: 110px;
}

.slots_track {
    background: #e8e8e8;
    transition: all 1s;
}

.slot_box {
    display: inline-block;
    margin: 0 10px;
    overflow: hidden;
}

.slot_item {
    margin: 10px 0;
    height: 80px;
    width: 80px;
    color: white;
    text-align: center;
    line-height: 80px;
    transition: all 1s;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100%;
}

.btn {
    display: block;
    margin: 20px auto;
    font-size: 15px;
    font-family: Arial;
    width: 140px;
    height: 50px;
    border-width: 1px;
    color: #fff;
    border-color: #337bc4;
    font-weight: bold;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    box-shadow: 3px 4px 0px 0px #1564ad;
    text-shadow: 0px 1px 0px #528ecc;
    background: linear-gradient(#79bbff, #378de5);
}

.btn:hover {
    background: linear-gradient(#378de5, #79bbff);
}

</style>