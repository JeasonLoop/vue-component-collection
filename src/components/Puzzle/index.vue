<script setup>
import Puzzle from './componnet.vue';
import { ref } from 'vue';
const puzzleRef = ref();

const startGame = () => {
    puzzleRef.value.startGame();
};
</script>
<template lang="">
    <div class="option-wrap">
        <Puzzle ref="puzzleRef" />
        <button class="btn" @click="startGame">开始游戏</button>
    </div>
</template>
<style scoped>
.option-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
