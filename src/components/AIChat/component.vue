<template>
  <div class="chat-app">
    <div
      class="sidebar-toggle"
      @click.stop="handleToggle"
      @touchstart="startDrag"
      @touchmove="onDrag"
      @touchend="endDrag"
      :style="{ left: toggleBtnPosition.x + 'px', top: toggleBtnPosition.y + 'px' }"
    >
      {{ isSidebarCollapsed ? '☰' : '✕' }}
    </div>
    <div class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header">
        <h3>会话历史</h3>
        <button @click="createNewChat">+ 新增</button>
      </div>
      <div class="chat-list">
        <div v-for="(chat, index) in chatHistory" :key="index" class="chat-item"
          :class="{ active: currentChatIndex === index }" @click="switchChat(index)">
          <span>{{ chat.title || `Chat ${index + 1}` }}</span>
          <button class="delete-btn" @click.stop="deleteChat(index)">×</button>
        </div>
      </div>
    </div>
    <div class="overlay" v-show="!isSidebarCollapsed" @click="toggleSidebar"></div>
    <div class="chat-container">
      <div class="messages">
        <div v-for="(message, index) in currentMessages()" :key="index" :class="['message', message.role]">
          <div class="avatar">
            <img :src="message.role === 'user' ? userAvatar : aiAvatar" :alt="message.role">
          </div>
          <div class="content">
            <div class="text" :class="{ 'is-typing': message.isTyping }" v-html="message.content"></div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <textarea v-model="inputText" placeholder="Type your message..."
          @keydown.enter.prevent="sendMessage"></textarea>
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue'
  import userAvatar from '../../assets/avatar.jpg'
  import aiAvatar from '../../assets/robot.png'

  const chatHistory = reactive([
    {
      title: '新会话',
      messages: [
        {
          role: 'assistant',
          content: '今天有什么可以帮助你的?'
        }
      ]
    }
  ])

  const currentChatIndex = ref(0)
  const inputText = ref('')
  const isSidebarCollapsed = ref(true)
  const isDragging = ref(false)
  const startX = ref(0)
  const dragThreshold = 50
  const toggleBtnPosition = ref({ x: 20, y: 50 })
  const startPosition = ref({ x: 0, y: 0 })

  const toggleSidebar = () => {
    if (!isDragging.value) {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }
  }

  const handleToggle = (e) => {
    if (!isDragging.value) {
      toggleSidebar()
    }
  }

  const startDrag = (e) => {
    isDragging.value = false
    startPosition.value = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }

    // 拖拽中
    const onDrag = (e) => {
    const deltaX = e.touches[0].clientX - startPosition.value.x
    const deltaY = e.touches[0].clientY - startPosition.value.y

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      isDragging.value = true
    }

    if (isDragging.value) {
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const btnSize = 80 // rpx
      const btnSizePx = btnSize * screenWidth / 750 // 转换为px

      // 计算新位置（rpx），X轴固定在左侧
      let newX = 20 // 固定在左侧边缘
      let newY = toggleBtnPosition.value.y + deltaY

      // 限制按钮在屏幕内
      newY = Math.max(Math.min(newY,screenHeight - 80),30) // 只限制Y轴移动范围

      toggleBtnPosition.value = { x: newX, y:newY }
      startPosition.value = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }
  }

  // 结束拖拽
  const endDrag = () => {
    // 自动吸附到左侧
    toggleBtnPosition.value.x = 20
    setTimeout(() => {
      isDragging.value = false
    }, 100)
  }

  const currentMessages = () => chatHistory[currentChatIndex.value].messages

  const createNewChat = () => {
    chatHistory.push({
      title: `Chat ${chatHistory.length + 1}`,
      messages: [
        {
          role: 'assistant',
          content: 'Hello! How can I help you today?'
        }
      ]
    })
    currentChatIndex.value = chatHistory.length - 1
  }

  const switchChat = (index) => {
    currentChatIndex.value = index
  }

  const deleteChat = (index) => {
    if (chatHistory.length <= 1) return
    chatHistory.splice(index, 1)
    if (currentChatIndex.value >= index) {
      currentChatIndex.value = Math.max(0, currentChatIndex.value - 1)
    }
  }

  const sendMessage = () => {
    if (!inputText.value.trim()) return

    currentMessages().push({
      role: 'user',
      content: inputText.value
    })

    inputText.value = ''

    // Simulate AI response with typing effect
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: '',
        isTyping: true
      }
      currentMessages().push(aiResponse)

      const fullResponse = 'I received your message. This is a simulated response.'
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < fullResponse.length) {
          aiResponse.content = fullResponse.substring(0, i + 1)
          i++
          // Force Vue to update
          chatHistory[currentChatIndex.value].messages = [...currentMessages()]
        } else {
          clearInterval(typingInterval)
          aiResponse.isTyping = false
        }
      }, 50)
    }, 1000)
  }
</script>

<style scoped>
  .chat-app {
    display: flex;
    height: 100vh;
    position: relative;
  }

  .sidebar-toggle {
    position: fixed;
    left: 10px;
    top: 10px;
    z-index: 100;
    background: #3b82f6;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  @media (max-width: 767px) {
    .sidebar:not(.collapsed) ~ .overlay {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 101;
    transition: transform 0.3s ease;
    width: 250px;
    border-right: 1px solid #e5e7eb;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  @media (min-width: 768px) {
    .sidebar {
      position: relative;
      transform: none !important;
    }

    .sidebar-toggle,
    .overlay {
      display: none;
    }
  }

  .sidebar-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
  }

  .sidebar-header button {
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
  }

  .chat-list {
    flex: 1;
    overflow-y: auto;
  }

  .chat-item {
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-item:hover {
    background-color: #e9ecef;
  }

  .chat-item.active {
    background-color: #e2e6ea;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #6c757d;
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
  }

  .delete-btn:hover {
    color: #dc3545;
  }

  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-left: 250px;
    transition: margin-left 0.3s ease;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  @media (max-width: 767px) {
    .chat-container {
      margin-left: 0;
    }
  }

  .messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background-color: #f9fafb;
  }

  .message {
    display: flex;
    margin-bottom: 16px;
    gap: 12px;
  }

  .message.user {
    flex-direction: row-reverse;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .content {
    max-width: 70%;
  }

  .message.user .content {
    text-align: right;
  }

  .text {
    padding: 8px 12px;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .text:after {
    content: '';
    display: inline-block;
    width: 8px;
    height: 16px;
    background-color: #3b82f6;
    animation: blink 1s infinite;
    margin-left: 4px;
    vertical-align: middle;
    opacity: 0;
  }

  .message.assistant .text.is-typing:after {
    opacity: 1;
  }

  @keyframes blink {

    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }
  }

  .message.assistant .text {
    background-color: #f0f4ff;
  }

  .input-area {
    display: flex;
    padding: 12px;
    border-top: 1px solid #e5e7eb;
    background-color: white;
  }

  .input-area textarea {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    resize: none;
    min-height: 40px;
    max-height: 120px;
  }

  .input-area button {
    margin-left: 8px;
    padding: 0 16px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .input-area button:hover {
    background-color: #2563eb;
  }
</style>
