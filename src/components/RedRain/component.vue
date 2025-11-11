<template lang="">
    <div class="red-rain-wrap" v-if="isStart">
        <div class="game-info">
            <div class="score">分数：{{ score }}</div>
            <div class="time">剩余时间：{{ gameTime }}秒</div>
        </div>
    </div>
</template>
<script setup>
import { ref, onUnmounted, nextTick, watch } from 'vue';
import redItem from './assets/redItem.png';
import { showMessage } from '../utils.js';

const props = defineProps({
    countDown: {
        type: Number,
        default: 30
    }
});

const score = ref(0); // 分数统计
const gameTime = ref(props.countDown || 30); // 游戏倒计时
const isStart = ref(false);
const slicePartCount = 5; // 将屏幕分成五份
const redPackets = ref([]); // 存储所有红包元素
const timeouts = ref([]); // 存储所有setTimeout的ID，用于清理
let gameTimer = null;
let redPacketTimer = null;

// 红包点击事件 - 加分并移除红包
const handleRedPacketClick = (redPacket) => {
    score.value++;
    removeRedPacket(redPacket);
};

// 移除单个红包
const removeRedPacket = (redPacket) => {
    if (redPacket && redPacket.parentNode) {
        redPacket.parentNode.removeChild(redPacket);
        // 从数组中移除
        const index = redPackets.value.indexOf(redPacket);
        if (index > -1) {
            redPackets.value.splice(index, 1);
        }
    }
};

// 生成单个红包
const createRedPacket = () => {
    // 检查游戏是否还在进行
    if (!isStart.value) return;

    const redWrap = document.querySelector('.red-rain-wrap');
    if (!redWrap) {
        console.warn('Red rain wrap not found');
        return;
    }

    const redContainer = document.createElement('div');
    const redItemImg = document.createElement('img');
    const innerWidth = document.body.clientWidth;
    const deltaX = innerWidth / slicePartCount;
    const randomIdx = Math.floor(Math.random() * slicePartCount);

    // 设置红包图片样式
    redItemImg.src = redItem;
    redItemImg.className = 'redItemImg';
    redItemImg.style.width = '5rem';
    redItemImg.style.height = '5.5rem';
    redItemImg.style.cursor = 'pointer';

    // 设置红包容器样式
    redContainer.className = 'red-packet';
    redContainer.style.top = '0px';
    redContainer.style.left = deltaX * randomIdx + 20 + 'px';
    redContainer.style.position = 'absolute';
    redContainer.style.animation = 'fall ease 5s';

    redContainer.appendChild(redItemImg);
    redWrap.appendChild(redContainer);

    // 添加点击事件
    redItemImg.onclick = () => handleRedPacketClick(redContainer);

    // 5秒后自动移除红包（匹配动画时间）
    const timeoutId = setTimeout(() => {
        removeRedPacket(redContainer);
    }, 5000);

    timeouts.value.push(timeoutId);
    redPackets.value.push(redContainer);
};

// 清理所有红包
const cleanupRedPackets = () => {
    // 清理所有setTimeout
    timeouts.value.forEach(timeoutId => {
        clearTimeout(timeoutId);
    });
    timeouts.value = [];

    // 移除所有DOM元素
    redPackets.value.forEach((redPacket) => {
        if (redPacket && redPacket.parentNode) {
            redPacket.parentNode.removeChild(redPacket);
        }
    });
    redPackets.value = [];
};

// 开始游戏
const startGame = async () => {
    // 如果游戏已经在进行，先结束
    if (isStart.value) {
        endGame();
    }

    isStart.value = true;
    score.value = 0;
    gameTime.value = props.countDown;
    cleanupRedPackets();

    // 等待DOM更新
    await nextTick();

    // 游戏倒计时
    gameTimer = setInterval(() => {
        gameTime.value--;
        if (gameTime.value <= 0) {
            endGame();
            showMessage({
                theme: 'success',
                content: `恭喜完成游戏，分数为：${score.value}`
            });
        }
    }, 1000);

    // 每500毫秒生成一个红包
    redPacketTimer = setInterval(createRedPacket, 500);
};

// 结束游戏
const endGame = () => {
    clearInterval(gameTimer);
    clearInterval(redPacketTimer);
    cleanupRedPackets();
    isStart.value = false;
};

// 监听 countDown prop 变化
watch(() => props.countDown, (newVal) => {
    if (!isStart.value) {
        gameTime.value = newVal;
    }
});

// 组件卸载时清理
onUnmounted(() => {
    endGame();
});

defineExpose({ startGame });
</script>
<style scoped>
.red-rain-wrap {
    position: absolute;
    top: 0;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.game-info {
    position: absolute;
    top: 20px;
    left: 20px;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 8px;
}

.score {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    width: 100%;
    font-size: 20px;
    white-space: nowrap;
}

.time {
    color: #ff6b6b;
}
</style>

<style>
@keyframes fall {
    0% {
        transform: translateY(-10%);
    }

    100% {
        transform: translateY(1000%);
    }
}
</style>
