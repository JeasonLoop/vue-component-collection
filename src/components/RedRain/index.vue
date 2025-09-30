<template lang="">
    <div class="container">
        <div>
            <t-input
                v-model.number="countDown"
                label="倒计时"
                align="right"
                placeholder="请输入倒计时,默认30s"
                suffix="秒"
                type="number"
                @change="changeNum"
            />
        </div>
        <button class="btn" @click="start">开始游戏</button>
        <RedRain ref="rainRef" :countDown="Number(countDown)" />
    </div>
</template>
<script setup>
import { ref } from 'vue';
import RedRain from './component.vue';
const rainRef = ref('');
const countDown = ref(null);

const changeNum = (v) => {
    countDown.value = v;
};

const start = () => {
    rainRef.value.startGame();
};
</script>
<style>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
</style>
