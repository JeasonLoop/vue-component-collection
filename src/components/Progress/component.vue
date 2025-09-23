<script setup>
  // 进度条组件
  import { reactive, onMounted, computed } from 'vue'
  const { percent, type, barBgColor, barColor, percentConfig = {} } = defineProps({
    percent: { // 进度条百分比
      type: Number,
      default: 50
    },
    type: {  // 进度条类型
      type: String,
      default: 'default'
    },
    barColor: {  // 进度条颜色
      type: String,
      default: '#378de5'
    },
    barBgColor: {  // 进度条背景颜色
      type: String,
      default: '#ccc'
    },
    size: {
      type: String || Number,
      default: 'normal'
    },
    percentConfig: {
      type: Object,
      default: {
        visible: false,
        color: '#333'
      }
    }
  })

  // 处理进度条
  const formatPercent = computed(() => {
    return percent > 100 ? 100 : percent < 0 ? 0 : percent
  })

</script>

<template lang="">
  <div class="outside-wrap">
    <div class="progress-wrap" :style="{ background:barBgColor }">
      <div class="progress-bar" :style="{ background:barColor, width: `${formatPercent}%`}"></div>
    </div>
    <div class="outside-percent" v-if="percentConfig?.visible" :style="{ color: percentConfig?.color }">{{ percent }}%
    </div>
  </div>
</template>

<style scoped>
  .outside-wrap {
    display: flex;
    align-items: center;
    flex-direction: row;
  }

  .progress-wrap {
    position: relative;
    width: 15rem;
    border-radius: 1rem;
  }

  .progress-bar {
    transition: all 0.3s;
    height: 1rem;
    border-radius: 1rem;
  }

  .outside-percent {
    margin-left: 0.5rem;
    font-size: 16px;
    width: 3rem;
  }
</style>