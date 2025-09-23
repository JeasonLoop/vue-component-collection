<!--
 * @Author: jeffriesvAn
 * @Date: 2025-09-01 20:57:42
 * @LastEditors: jeffriesvAn
 * @LastEditTime: 2025-09-01 21:04:46
 * @FilePath: \vue-component-collection\src\components\Modal\index.vue
-->
<template lang="">
  <div class="modal-bg">
    <div class="option-area">
      <Modal ref="modalRef" />
      <Input label="弹窗标题" :value="title" @change="handleChangeTitle" placeholder="请输入弹窗标题" />
      <Input label="弹窗内容" :value="content" @change="handleChangeContent" placeholder="请输入弹窗内容" />
      <button class="button" @click="openModal">打开弹窗</button>
    </div>
  </div>
</template>
<script lang="" setup>
  import Modal from './component.vue'
  import { ref } from 'vue'
  import { Input } from 'tdesign-mobile-vue'


  const modalRef = ref('')
  const title = ref('')
  const content = ref('')

  const openModal = () => {
    modalRef.value.open({
      title: title.value,
      content: content.value,
      confirmCb: () => {
        alert('确认回调')
      }
    })
  }

  const handleChangeTitle = (v) => {
    title.value = v
  }
  const handleChangeContent = (v) => {
    content.value = v
  }

</script>
<style lang="css" scoped>
  .modal-bg {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
  }

  .option-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .button {
    padding: 0.8rem 2.25rem;
    border: 1px solid #000;
    border-radius: 0.4rem;
    font-size: 1rem;
    margin-top: 2rem;
  }
</style>