<template>
    <div class="slots_box">
        <div v-for="(slot, i) in tracks" :key="i" class="slot_box">
            <div class="slot_box_inner" :class="{ move: slotsOpts }">
                <div class="slot_items" :style="{ transform: `translateY(${slot.trans}px)` }">
                    <div
                        v-for="(item, index) in slot.items"
                        :key="index"
                        class="slot_item"
                        :style="{ backgroundImage: `url(${item.imgUrl})` }"
                    ></div>
                    <div
                        class="slot_item slot_item_copy"
                        :style="{ backgroundImage: `url(${slot.items[0]?.imgUrl})` }"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="" setup>
import { ref, reactive, onMounted, watch, onBeforeUnmount } from 'vue';
import { showMessage } from '../componentsConfig'
import chicken from './assets/prizeImgs/小鸡.png';
import cat from './assets/prizeImgs/小猫.png';
import dog from './assets/prizeImgs/小狗.png';
import whiteBear from './assets/prizeImgs/白熊.png';
import duck from './assets/prizeImgs/小鸭.png';
import pig from './assets/prizeImgs/小猪.png';
import rabbit from './assets/prizeImgs/兔子.png';
import frog from './assets/prizeImgs/青蛙.png';
import pigeon from './assets/prizeImgs/鸽子.png';

const ITEM_HEIGHT = 90;
let overTimer = null;

const props = defineProps([
  'isRandom',
  'prizes',
])

const { prizes = [], isRandom = false } = props

const tracks = reactive([
  { title: '组1', trans: 0, items: [] },
  { title: '组2', trans: 0, items: [] },
  { title: '组3', trans: 0, items: [] },
]); // 滚动轨道

const slotsOpts = ref(null); // 转动时的配置参数
const animationFrameId = ref(null); // 用于存储动画帧id
const slotsStartedAt = ref(null); // 记录滚动开始的时间
const animateDuration = 5;

const isRolling = ref(false);
const timeCount = ref(0);
const nextRoundFactor = ref(0);

// 数组洗牌
const shuffleArray = (array) => {
  const newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 初始化轨道数组
const initSlots = (isRandom) => {
  tracks.forEach((slot) => {
    slot.items = isRandom ? shuffleArray(prizes) : prizes;
  });
};

const stop = (prizeName) => {
  if (!isRolling.value) {
    showMessage({
      theme: 'warning',
      content: `请先点击开始抽奖`,
    });
    return;
  }

  const resultIndex = Math.floor(Math.random() * prizes.length); // 随机下标
  const resultName = prizeName || prizes[resultIndex].name; // 指定下标 || 随机下标

  prizes.forEach((item) => {
    item.isActived = item.name === resultName ? 1 : 0;
  });

  const updatedSlotsOpts = tracks.map((slot, i) => {
    const { items } = slot || {};
    let choice = items.findIndex((item) => item.name === resultName);
    if (resultName === '谢谢参与') {
      choice = i;
    }
    return {
      finalPos: choice * ITEM_HEIGHT,
      startOffset: 8000 + Math.random() * 500 + i * 1600,
      height: items.length * ITEM_HEIGHT,
      duration: animateDuration * 1000 + i * 1000,
      isFinished: false,
    };
  });

  slotsOpts.value = updatedSlotsOpts;
  isRolling.value = false;
};

const roll = () => {
  initSlots();
  timeCount.value = 0;
  isRolling.value = true;
  const updatedSlotsOpts = tracks.map((slot, i) => ({
    finalPos: 0,
    startOffset: 8000 + Math.random() * 500 + i * 1600,
    height: slot.items.length * ITEM_HEIGHT,
    duration: animateDuration * 1000 + i * 1000,
    isFinished: false,
  }));

  slotsOpts.value = updatedSlotsOpts;
  slotsStartedAt.value = Date.now();
};

const animate = () => {
  nextRoundFactor.value += 0.5;

  let timeDiff = Date.now() - slotsStartedAt.value;
  timeDiff = isRolling.value ? timeDiff - nextRoundFactor.value * 1000 : timeDiff;

  if (timeCount.value >= 5 && !isRolling.value) {
    timeDiff -= 2500;
  }

  let allFinished = true;
  tracks.forEach((slot, i) => {
    const opt = slotsOpts.value[i];
    const timeRemaining = opt.duration - timeDiff;

    if (timeRemaining > 0) {
      allFinished = false;
      const power = 3;
      const offset = (timeRemaining ** power / opt.duration ** power) * opt.startOffset;
      const pos = -1 * Math.floor((offset + opt.finalPos) % opt.height);
      slot.trans = pos;
    } else {
      slot.trans = -opt.finalPos;
    }
  });

  if (!allFinished) {
    animationFrameId.value = requestAnimationFrame(animate);
  } else {
    if (timeCount.value >= 5 || !isRolling.value) {
      const resultName = prizes.find((item) => item.isActived === 1)?.name || '谢谢参与';
      showMessage({
      theme: 'success',
      content: `恭喜获得：${resultName}`,
    });
    }
    slotsOpts.value = null;
    cancelAnimationFrame(animationFrameId.value);
  }
};

watch(slotsOpts, () => {
  if (slotsOpts.value) {
    animationFrameId.value = requestAnimationFrame(animate);
  }
});

// 是否随机初始数组监听
watch(() => props.isRandom,(newValue) => {
  if(newValue){
    initSlots('random')
  }
}, { immediate: true, deep: true })

// 滚动以及停止方法暴露
defineExpose({
  roll,
  stop
})

onMounted(() => {
  initSlots();
});

watch(
  () => isRolling.value,
  (newVal) => {
    if (!newVal) return;
    if (timeCount.value >= 5) {
      stop('谢谢参与');
    }
    overTimer = setTimeout(() => {
      timeCount.value += 1;
    }, 1000);
  }
);

onBeforeUnmount(() => {
  if (overTimer) {
    clearTimeout(overTimer);
  }
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
});

</script>

<style>
* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

.slots_box {
    padding: 20px 0;
    overflow: hidden;
    text-align: center;
}

.slot_box {
    display: inline-block;
    margin: 0 10px;
}

.slot_box_inner {
    background: #eee;
    width: 100px;
    height: 100px;
    overflow: hidden;
    padding: 0 10px;
}

.slot_box_inner.move {
    background: linear-gradient(to right, #0be881 0%, #4bcffa 50%, #0be881 100%);
    background-size: 300%;
    animation: sbg 1s infinite alternate;
}

.slot_item {
    margin: 10px 0;
    height: 80px;
    width: 80px;
    text-align: center;
    color: white;
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

@keyframes sbg {
    0% {
        background-position: 100%;
    }

    50% {
        background-position: -100%;
    }

    100% {
        background-position: 0;
    }
}
</style>
