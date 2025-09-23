<script setup>
  import Progress from './component.vue'
</script>

<template lang="">
  <div class="progress-container">
    <Progress :percent="75" />
    <Progress :percent="50" barColor="red" />
    <Progress :percent="25" barColor="green" />
  </div>
</template>

<style scoped>
  .progress-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 2rem;
  }
</style>