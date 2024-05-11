
<template>
    <div
        class="bullet_container"
        v-if="splitedBullets.length > 0"
        :style="{ width: `${containerWidth}px` }"
    >
        <div v-for="(trackBullets, index) in splitedBullets" :key="index">
            <div
              ref="trackElements"
              class="bullet_tarck"
              :style="{ animationDuration: `${animationTime}s` }"
            >
              <div class="bullet_item" v-for="bulletName in trackBullets" :key="bulletName">
                  {{ bulletName }}
              </div>
            </div>
        </div>
    </div>
</template>

<script lang="" setup>
import { defineProps, onBeforeMount, onMounted, reactive, ref, watch } from "vue"
import { getRandomNum } from '../componentsConfig'
/**
 * @description 弹幕组件
 * @param {Array} bullets 弹幕数组
 * @param {Number} trackNum 轨道数
 * @param {Number} speed 速度
 */
const props = defineProps([
  'bullets',
  'trackNum',
  'speed',
  'containerWidth'
])
const { bullets = [], trackNum = 3, speed = 50, containerWidth = 700 } = props

const splitedBullets = ref([]) // 拆分后的弹幕数组
const trackElements = ref()
const animationTime = ref(5)

// 拆分弹幕数组
const handleBulletSplit = () => {
  if (bullets.length <= 0) return
  if (bullets.length < 6) { // 小于六条弹幕就显示在第一行
    splitedBullets.value = [bullets, [], []]
    return
  }
  const splitInterval = bullets.length / trackNum // 每条轨道的弹幕数量
  for (let i = 0; i < trackNum; i++) {
    splitedBullets.value[i] = bullets.slice(i * splitInterval, (i + 1) * splitInterval)
  }
}

// 设置每条轨道的弹幕速度
const setAnimationTime = (changeSpeed = speed) => {
  let animationTimeArr = []
  trackElements.value?.forEach(track => {
    const newAnimationTime = track.clientWidth / changeSpeed;
    animationTimeArr.push(newAnimationTime)
  });
  animationTime.value = Math.max(...animationTimeArr)
}

// 设置每条弹幕的随机间距
const setBulletItemMargin = () => {
  trackElements.value?.forEach(track => {
    const bulletItems = track.querySelectorAll('.bullet_item')
    bulletItems.forEach((bulletItem, index) => {
      bulletItem.style.marginRight = `${getRandomNum(10, 50)}px`
      bulletItem.style.marginLeft = `${getRandomNum(10, 50)}px`
    })
  })
}

handleBulletSplit()

onMounted(() => {
  setAnimationTime()
  setBulletItemMargin()
})

watch(() => props.speed, (newSpeed) => {
  setAnimationTime(newSpeed)
}, { immediate: true, deep: true })



</script>

<style lang="css">
.bullet_container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.bullet_tarck {
    display: flex;
    flex-direction: row;
    align-content: center;
    padding: 10px 0;
    width: fit-content;
    white-space: nowrap;
    transform: translateX(50%);
    animation: move 5s linear infinite;
}

.bullet_item {
    border: 1px solid #d7d7d7;
    border-radius: 8px;
    padding: 5px 12px;
}

/* 弹幕移动动画 */
@keyframes move {
    0% {
        transform: translateX(50%); /* 初始位置在右侧屏幕外 */
    }

    100% {
        transform: translateX(-160%); /* 滚动至左侧屏幕外 */
    }
}
</style>