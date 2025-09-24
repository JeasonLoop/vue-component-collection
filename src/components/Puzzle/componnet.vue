<script setup>
import { ref, computed, nextTick } from 'vue';

const { gridWidth, gridHeight, gameTime } = defineProps({
    gridWidth: {
        // 拼图横向切分数量
        type: Number,
        default: 3
    },
    gridHeight: {
        // 拼图纵向切分数量
        type: Number,
        default: 3
    },
    gameTime: {
        type: Number,
        default: 60
    }
});

import puzzleImg from './assets/bao.jpg';
import returnBack from './assets/return.png';
import { showMessage } from '../utils';

const isStart = ref(false); // 开始游戏标识
const isSwaping = ref(false); // 是否在交换中
const timeDown = ref(gameTime); // 倒计时
const startIndex = ref(null); // 交换的起始位置
const isFinish = ref(false); // 是否完成

const imageSize = 300;
let timeClock = null;

// 拼图分块数组
const gridItems = computed(() => {
    return new Array(gridWidth * gridHeight).fill('').map((_, idx) => idx);
});

// 数组洗牌
const shuffle = (arr) => {
    let length = arr.length;
    const newArr = arr;
    let randomIndex;
    let temp;
    while (length) {
        randomIndex = Math.floor(Math.random() * length--);
        temp = newArr[randomIndex];
        newArr[randomIndex] = newArr[length];
        newArr[length] = temp;
    }
    return newArr;
};

// 交换两个元素的位置
const swapPosition = (element1, element2) => {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const temp = document.createElement('div');

    // 交换两个dom元素的位置
    const parent = element1.parentNode;
    parent.insertBefore(temp, element1);
    parent.insertBefore(element1, element2);
    parent.insertBefore(element2, temp);

    parent.removeChild(temp);

    // 交换时添加transform效果
    element1.style.transform = `translate(${rect1.left - rect2.left}px, ${
        rect1.top - rect2.top
    }px)`;
    element2.style.transform = `translate(${rect2.left - rect1.left}px, ${
        rect2.top - rect1.top
    }px)`;

    element1.style.transition = 'transform 0.4s ease-in-out';
    element2.style.transition = 'transform 0.4s ease-in-out';

    // transform结束后复位
    setTimeout(() => {
        element1.style.transform = '';
        element2.style.transform = '';
        isSwaping.value = false;
    }, 100);
};

function isIncremental(arr) {
    for (let i = 0; i < arr.length; i += 1) {
        if (arr[i] !== i) {
            return false;
        }
    }
    return true;
}

// 判断拼图是否完成，在每次点击之后调用
const isPuzzleFinish = () => {
    if (document.querySelector('#puzzleImage')?.childNodes?.length) {
        const increaseArr = [];
        document.querySelector('#puzzleImage')?.childNodes?.forEach((item) => {
            increaseArr.push(Number(String(item.id).match(/(\d+)/g)[0]));
        });
        return isIncremental(increaseArr);
    }
};

// 拼图点击函数
const handleGridItemClick = (index) => {
    if (isSwaping.value || isFinish.value || timeDown.value <= 0) {
        return; // 防止重复点击或倒计时结束
    }

    isSwaping.value = true;
    if (!startIndex?.value && startIndex.value !== 0) {
        // 记录第一次点击的起始位置
        startIndex.value = index;
        const startContainer = document.querySelector(`#swap_container_${startIndex.value}`);
        startContainer.style.outline = '2px solid #F9CA75';
        startContainer.style.boxShadow = ' 0 0 20px #F9CA75';

        isSwaping.value = false;
    } else {
        const startContainer = document.querySelector(`#swap_container_${startIndex.value}`);
        const endContainer = document.querySelector(`#swap_container_${index}`);
        startContainer.style.outline = 'none';
        startContainer.style.boxShadow = 'none';
        swapPosition(startContainer, endContainer);
        if (isPuzzleFinish()) {
            // clearInterval(timeClock);
            isFinish.value = true;
            showMessage({ content: '你真棒！' });
            isStart.value = false;
        } else if (timeDown <= 0) {
            clearInterval(timeClock);
            isFinish.value = false;
            showMessage({ content: '你真逊！' });
            isStart.value = false;
        }
        startIndex.value = null;
    }
};

// 拼图切割样式
const getGridItemStyle = (index) => {
    const row = Math.floor(index / gridWidth);
    const col = index % gridWidth;

    const whRatio = gridWidth / gridHeight;

    // 异步加载图片
    const img = new Image();
    img.src = puzzleImg;

    new Promise((resolve) => {
        img.onload = resolve;
    });

    const imageWidth = img.width;
    const imageHeight = img.height;
    const imageAspectRatio = imageWidth / imageHeight;

    const gridItemWidth = imageSize / gridWidth;
    const gridItemHeight = imageSize / gridHeight / whRatio;

    const backgroundPositionX = `${-col * gridItemWidth}px`;
    const backgroundPositionY = `${-row * gridItemHeight}px`;

    return {
        width: `${gridItemWidth}px`,
        height: `${gridItemHeight}px`,
        backgroundImage: `url(${puzzleImg})`,
        backgroundPosition: `${backgroundPositionX} ${backgroundPositionY}`,
        backgroundSize:
            imageAspectRatio > 1
                ? `auto ${gridHeight * 100}%`
                : `${gridWidth * 100}% ${gridHeight * 100}%`
    };
};

// 生成拼图并且打乱
const genSlicePuzzle = () => {
    const shuffleArr = shuffle(gridItems.value);
    const puzzleBody = document.querySelector('#puzzleImage');
    shuffleArr.forEach((pidx) => {
        const puzzleSilice = document.createElement('div');
        puzzleSilice.setAttribute('id', `swap_container_${pidx}`);
        puzzleSilice.className = 'grid-item';
        Object.assign(puzzleSilice.style, getGridItemStyle(pidx));
        puzzleSilice.onclick = () => handleGridItemClick(pidx);
        puzzleBody.appendChild(puzzleSilice);
    });
};

const startGame = () => {
    isStart.value = true;
    nextTick(() => {
        genSlicePuzzle();
    });
    // 游戏倒计时
    gameTimer = setInterval(() => {
        timeDown.value--;
    }, 1000);
};

const endGame = () => {
    clearInterval(timeClock);
    isStart.value = false;
};

defineExpose({ startGame });
</script>
<template lang="">
    <div class="puzzleWrap" v-if="isStart">
        <div class="countDown">{{ timeDown }}</div>
        <div
            id="puzzleImage"
            className="puzzle_body"
            :style="{
                gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
                gridTemplateRows: `repeat(${gridHeight}, 1fr)`
            }"
        ></div>
        <img class="backIcon" :src="returnBack" @click="endGame" />
    </div>
</template>
<style scoped>
.puzzleWrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    z-index: 9999;
}

.puzzle_body {
    display: grid;
    grid-gap: 3px;
    border: 1rem solid #fff;
    border-radius: calc(32 * 0.7 / 32 * 1rem);
    margin-top: 1rem;
}

.grid-item {
    background-size: calc(560 / 32 * 1rem) calc(560 / 32 * 1rem);
    cursor: pointer;
}

.countDown {
    font-size: 32px;
    font-weight: bold;
    color: #fff;
}

.backIcon {
    position: absolute;
    top: 1rem;
    left: 1rem;
    width: 3rem;
}
</style>
