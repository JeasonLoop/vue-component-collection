<!--
 * @Author: jeffriesvAn
 * @Date: 2025-09-01 20:57:31
 * @LastEditors: jeffriesvAn
 * @LastEditTime: 2025-09-01 21:21:11
 * @FilePath: \vue-component-collection\src\components\Modal\component.vue
-->
<template>
  <teleport to='body'>
    <transition name="fade" v-if="visible">
       <div class="modal-container" :style="style">
        <div class="header">{{ title }}</div>
        <div class="modal-body">{{ content }}</div>
        <div class="footer">{{ footer }}</div>
       </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '标题'
  },
  content: {
    type: String,
    default: '内容'
  },
  footer: {
    type: String,
    default: '底部'
  },
  style: {
    type: Object,
    default: () => ({})
  }
})

const { title, content, footer, visible, style } = props


</script>

<style scoped>

</style>