
<template>
  <div :style="{ width: `${containerWidth}px` }">
    <div
        class="bullet_container"
        v-if="splitedBullets.length > 0"
    >
        <div class="double_track" v-for="(trackBullets, index) in splitedBullets" :key="index">
            <div
                ref="trackElements"
                class="bullet_tarck"
                :style="{ animationDuration: `${animationTime}s` }"
            >
                <div
                    class="bullet_item"
                    v-for="bulletName in [...trackBullets, ...trackBullets]"
                    :key="bulletName"
                >
                    {{ bulletName }}
                </div>
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
 * @param {Number} trackNum 轨道数(默认三条轨道)
 * @param {Number} speed 速度(默认速度200)
 */
const props = defineProps([
  'bullets',
  'trackNum',
  'speed',
  'containerWidth'
])
const { bullets = [], trackNum = 3, speed = 200, containerWidth = 500 } = props

const splitedBullets = ref([]) // 拆分后的弹幕数组
const trackElements = ref()
const animationTime = ref(5)

// 提前声明防止间距变化
const bulletMarginLeft = ref(getRandomNum(10, 50));
const bulletMarginRight = ref(getRandomNum(10, 50));

// 拆分弹幕数组
const handleBulletSplit = ({ newBullets = [], newTrackNum }) => {
  if (bullets.length <= 0) return
  const realBullets = newBullets?.length ? newBullets : bullets
  const realTrackNum = newTrackNum || trackNum

  if (realBullets.length < 6) { // 小于六条弹幕就显示在第一行
    splitedBullets.value = [realBullets, [], []]
    bulletMarginLeft.value = getRandomNum(100, 150)
    bulletMarginRight.value = getRandomNum(100, 150)
    return
  }
  const splitInterval = realBullets.length / realTrackNum // 每条轨道的弹幕数量
  for (let i = 0; i < realTrackNum; i++) {
    splitedBullets.value[i] = realBullets.slice(i * splitInterval, (i + 1) * splitInterval)
  }
}

// 设置每条轨道的弹幕速度
const setAnimationTime = (changeSpeed = speed) => {
  let animationTimeArr = []
  trackElements.value?.forEach(track => {
    const newAnimationTime = track.offsetWidth / changeSpeed;
    animationTimeArr.push(newAnimationTime)
  });
  animationTime.value = Math.max(...animationTimeArr)
}

// 设置每条弹幕的随机间距
const setBulletItemMargin = () => {
  trackElements.value?.forEach(track => {
    const bulletItems = track.querySelectorAll('.bullet_item')
    bulletItems.forEach((bulletItem, index) => {
      bulletItem.style.marginRight = `${bulletMarginLeft.value}px`
      bulletItem.style.marginLeft = `${bulletMarginRight.value}px`
    })
  })
}

handleBulletSplit({})

onMounted(() => {
  setAnimationTime()
  setBulletItemMargin()
})

// 监听速度变化
watch(() => props.speed, (newSpeed) => {
  setAnimationTime(newSpeed)
}, { immediate: true, deep: true })

// 监听弹幕数组变化
watch(() =>[props?.bullets,props.trackNum], ([newBullets,newTrackNum]) => {
  handleBulletSplit({
    newBullets,
    newTrackNum
  })
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

.double_track {
    display: flex;
    flex-direction: row;
}

.bullet_tarck {
    display: flex;
    flex-direction: row;
    align-content: center;
    padding: 10px 0;
    white-space: nowrap;
    transform: translateX(0%);
    animation: move 5s linear infinite;
}

.bullet_item {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d7d7d7;
    border-radius: 8px;
    padding: 5px 12px;
}

/* 弹幕移动动画 */
@keyframes move {
    0% {
        transform: translateX(0%); /* 初始位置在右侧屏幕外 */
    }

    100% {
        transform: translateX(-50%); /* 滚动至左侧屏幕外 */
    }
}
</style>