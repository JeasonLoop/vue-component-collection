<script setup>
import Game2048 from './component.vue';
import { ref } from 'vue';

const gameRef = ref('');
</script>
<template lang="">
    <Game2048 ref="gameRef" />
</template>
<style scoped></style>
