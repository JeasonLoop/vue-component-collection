<script lang="" setup>
import Bullet from './component.vue'
import { generateRandomArray } from '../componentsConfig'

const bulletList = generateRandomArray(30, 6) // 随机生成的弹幕列表

</script>

<template lang="">
  <div>
    <Bullet 
      :bullets='bulletList'
      :trackNum='3'
    />
  </div>
</template>

<style lang="">

</style>