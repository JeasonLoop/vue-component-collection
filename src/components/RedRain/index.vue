<template lang="">
  <div class="container">
    <button class="btn" @click="start">开始游戏</button>
    <RedRain ref="rainRef" />
  </div>
</template>
<script setup>
  import { ref } from 'vue'
  import RedRain from './component.vue'
  const rainRef = ref('')
  const start = () => {
    rainRef.value.startGame()
  }

</script>
<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>