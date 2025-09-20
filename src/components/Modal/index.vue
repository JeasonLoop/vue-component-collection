<!--
 * @Author: jeffriesvAn
 * @Date: 2025-09-01 20:57:42
 * @LastEditors: jeffriesvAn
 * @LastEditTime: 2025-09-01 21:04:46
 * @FilePath: \vue-component-collection\src\components\Modal\index.vue
-->
<template lang="">
  <div class="modal-bg">
    <!-- <Modal /> -->
    <button class="button" @click="openModal">打开弹窗</button>
  </div>
</template>
<script lang="" setup>
  import { inject } from 'vue'
  import Modal from './component.vue'

  const modal = inject('modal')
  const openModal = () => {
    const modalInstance = modal({
      title: '自定义',
      content: 'sdsdsdsd',
      onConfirm: () => {
        modalInstance.close()
      }
    })
  }

</script>
<style lang="css" scoped>
  .modal-bg {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
  }

  .button {
    padding: 10px 20px;
    border: 1px solid #000;
    border-radius: 5px;
    font-size: 16px;
  }
</style>
