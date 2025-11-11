<!--
 * @Author: jeffriesvAn
 * @Date: 2025-09-01 20:57:31
 * @LastEditors: jeffriesvAn
 * @LastEditTime: 2025-09-01 21:21:11
 * @FilePath: \vue-component-collection\src\components\Modal\component.vue
-->
<template>
  <transition name="fade">
    <div class="modal-wrap" v-if="visible">
      <div class="modal-container" :style="style">
        <div class="modal-header">{{ modalConfig.title || '标题' }}</div>
        <div class="content-wrap">
          <div class="content">{{ modalConfig.content || '这是内容' }}</div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="close" v-if="modalConfig.showCancel">取消</button>
          <button class="confirm-btn" @click="onConfirm">确认</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
  import { ref, reactive } from 'vue'

  const DEFAULT_CONFIG = {
    title: '标题',
    content: '内容',
    showCancel: true,
    confirmCb: () => { }
  }

  const visible = ref(false)
  const modalConfig = reactive(DEFAULT_CONFIG)

  // 打开弹窗
  const open = (importModalConfig = {}) => {
    Object.assign(modalConfig, { ...modalConfig, ...importModalConfig })
    visible.value = true
  }

  // 关闭弹窗
  const close = () => {
    visible.value = false
    Object.assign(modalConfig, DEFAULT_CONFIG)
  }

  const onConfirm = () => {
    close()
    if (modalConfig?.confirmCb) modalConfig?.confirmCb()
  }

  defineExpose({
    open,
    close
  })

</script>

<style scoped>
  .modal-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    z-index: 9999;
  }

  .modal-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    width: 16rem;
    border-radius: 8px;
    z-index: 99999;

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 3rem;
      font-size: 16px;
      font-weight: bold;
    }

    .content-wrap {
      max-height: 40rem;
      overflow: hidden;
    }

    .content {
      padding-top: 1rem;
      word-break: break-all;
      min-height: 15rem;
      padding: 0 1.2rem;
      padding-bottom: 1rem;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      text-align: center;
      width: 100%;
      height: 3rem;

      .cancel-btn {
        border-radius: 0.5rem;
        border: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: #666;
        width: 4rem;
        padding: 0.3rem 1rem;
        white-space: nowrap;
      }

      .confirm-btn {
        border-radius: 0.5rem;
        border: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        background: #378de5;
        color: #fff;
        width: 4rem;
        padding: 0.3rem 1rem;
        white-space: nowrap;
      }
    }
  }

  /* 弹窗显示隐藏样式 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>