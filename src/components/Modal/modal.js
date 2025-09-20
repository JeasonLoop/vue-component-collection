import { createApp, h, ref } from "vue";
import Modal from './component.vue'

/**
 * 创建弹窗服务
 * 提供全局弹窗功能，支持 show、confirm 等方法
 */
export function createModal() {
  const instances = [] // 存储所有弹窗实例

  /**
   * 创建弹窗实例
   * @param {Object} options 弹窗配置选项
   * @returns {Object} 包含关闭方法的弹窗实例
   */
  const modal = (options = {}) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const visible = ref(true) // 默认显示弹窗
    const app = createApp({
      setup() {
        // 弹窗关闭函数
        const onClose = () => {
          visible.value = false
          setTimeout(() => {
            app.unmount()
            container.remove()
            const index = instances.findIndex(i => i === app)
            if (index !== -1) {
              instances.splice(index, 1)
            }
          }, 300) // 等待动画完成
        }

        // 返回弹窗组件
        return () => h(Modal, {
          visible: visible.value,
          'onUpdate:visible': (v) => {
            visible.value = v
            if(!v) onClose()
          },
          onConfirm: () => {
            if(options.onConfirm) {
              options.onConfirm()
            }
            onClose()
          },
          onCancel: () => {
            if(options.onCancel) {
              options.onCancel()
            }
            onClose()
          },
          ...options,
        }, options.slots || {})
      }
    })

    instances.push(app)
    app.mount(container)

    return {
      close: () => {
        visible.value = false
      }
    }
  }

  /**
   * 显示信息弹窗
   * @param {string} content 内容
   * @param {string} title 标题
   * @param {Function} onConfirm 确认回调
   */
  modal.show = (content, title = '提示', onConfirm) => {
    return modal({
      title,
      content,
      onConfirm
    })
  }

  /**
   * 显示确认弹窗
   * @param {string} content 内容
   * @param {string} title 标题
   * @param {Function} onConfirm 确认回调
   * @param {Function} onCancel 取消回调
   */
  modal.confirm = (content, title = '确认', onConfirm, onCancel) => {
     return modal({
      title,
      content,
      onConfirm,
      onCancel
    })
  }

  return modal
}

export default {
  install(app) {
    const modal = createModal()
    app.config.globalProperties.$modal = modal
    app.provide('modal', modal)
  }
}
