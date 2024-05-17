<script lang="" setup>
import { ref, onMounted } from 'vue'
import Bullet from './component.vue'
import { generateRandomArray, showMessage } from '../componentsConfig'

const bulletList = ref(generateRandomArray(50, 20)) // 随机生成的弹幕列表
const bulletRef = ref(null)
const bulletInput = ref('')
const speed = ref([])
const showPopup = ref(false)

const handleChangeBullet = (val) => {
  bulletInput.value = val
}

const speedOptions =
  [
    { label: '默认', value: 200 },
    { label: '慢', value: 100 },
    { label: '中', value: 250 },
    { label: '快', value: 550 },
  ]


const handleChangeSpeed = (val) => {
  speed.value = val.map(item => item.label).join('')
}

const onConfirm = (val,context) => {
  speed.value = context.label
  showPopup.value = false
}


const handleAddBullet = () => {
  if (!bulletInput.value) {
    showMessage({ content: '弹幕内容不能为空', theme: 'warning', })
    return
  }
  bulletRef._value?.handleAddBullet({
    trackOrder: 1,
    content: bulletInput.value
  })

  showMessage({ content: '发送成功' })

  bulletInput.value = ''
}

</script>

<template lang="">
  <div class='component_container' >
    <Bullet
      ref='bulletRef'
      :bullets='bulletList'
      :trackNum='3'
      :containerWidth='300'
      :speed="speedOptions.find(item => item.label === speed[0])?.value"
    />
  </div>
  <div class='config_container'>
      <t-input
        label="弹幕内容"
        :value='bulletInput'
        placeholder="请输入弹幕内容"
        :onChange='handleChangeBullet'
      >
      <template #suffix>
        <t-button theme="primary" size="extra-small" @click='handleAddBullet'> 发送弹幕 </t-button>
       </template>
      </t-input>
      <t-cell arrow title="选择速度" :note="speed?.join('')" @click="showPopup = true" />

  </div>
    <t-popup v-model="showPopup" placement="bottom">
    <t-picker
      v-model="speed"
      :columns="[speedOptions]"
      @confirm="onConfirm"
      @cancel="showPopup = false"
    />
  </t-popup>
</template>

<style lang="css">
.component_container {
    width: 100%;
    display: flex;
    align-content: center;
    justify-content: center;
    padding-top: 40px;
}

.config_container {
    margin-top: 50px;
}
</style>