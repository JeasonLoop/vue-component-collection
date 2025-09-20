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
      <div class="modal-wrap">
        <div class="modal-container" :style="style">
          <div class="modal-header">{{ title }}</div>
          <div class="content-wrap">
            <div class="content">{{ content }}</div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="onCancel">取消</button>
            <button class="confirm-btn" @click="onConfirm">确认</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  // 组件属性定义
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
    style: {
      type: Object,
      default: () => ({})
    }
  })

  const { title, content, visible, style } = props

  // 事件定义
  const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

  // 关闭弹窗方法
  const onClose = () => {
    emit('update:visible', false)
  }

  // 取消按钮点击事件
  const onCancel = () => {
    emit('cancel')
    onClose()
  }

  // 确认按钮点击事件
  const onConfirm = () => {
    emit('confirm')
    onClose()
  }
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
  }

  .modal-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    width: 16rem;
    border-radius: 8px;

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
        display: block;
        margin: 20px auto;
        font-size: 15px;
        font-family: Arial;
        width: 6rem;
        height: 30px;
        border-width: 1px;
        color: #333;
        border-color: #ccc;
        font-weight: bold;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        box-shadow: 3px 4px 0px 0px #ccc;
        text-shadow: 0px 1px 0px #ccc;
        background: linear-gradient(#fff, #fff);
      }

      .confirm-btn {
        display: block;
        margin: 20px auto;
        font-size: 15px;
        font-family: Arial;
        width: 6rem;
        height: 30px;
        border-width: 1px;
        color: #fff;
        border-color: #337bc4;
        font-weight: bold;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        box-shadow: 3px 4px 0px 0px #1564ad;
        text-shadow: 0px 1px 0px #528ecc;
        background: linear-gradient(#79bbff, #378de5);
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
