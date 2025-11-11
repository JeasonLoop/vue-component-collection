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
                <div
                    v-for="(chat, index) in chatHistory"
                    :key="index"
                    class="chat-item"
                    :class="{ active: currentChatIndex === index }"
                    @click="switchChat(index)"
                >
                    <span>{{ chat.title || `Chat ${index + 1}` }}</span>
                    <button class="delete-btn" @click.stop="deleteChat(index)">×</button>
                </div>
            </div>
        </div>
        <div class="overlay" v-show="!isSidebarCollapsed" @click="toggleSidebar"></div>
        <div class="chat-container">
            <div class="messages" id="chat-messages">
                <div
                    v-for="(message, index) in currentMessages()"
                    :key="index"
                    :class="['message', message.role]"
                >
                    <div class="avatar">
                        <img
                            :src="message.role === 'user' ? userAvatar : aiAvatar"
                            :alt="message.role"
                        />
                    </div>
                    <div class="content">
                        <div
                            class="text markdown-body"
                            :class="{ 'is-typing': message.isTyping }"
                            v-html="message.content"
                        ></div>
                    </div>
                </div>
            </div>

            <div class="input-area">
                <textarea
                    id="user-input"
                    placeholder="输入你的信息..."
                    @keydown.enter.prevent="sendMessage"
                ></textarea>
                <button id="send-button">发送</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import MarkdownIt from 'markdown-it';
import userAvatar from '../../assets/avatar.jpg';
import aiAvatar from '../../assets/robot.png';
import axios from 'axios';

// 配置 markdown-it
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        // 简单的代码块渲染，不进行语法高亮
        return '<pre class="hljs"><code>' + MarkdownIt.utils.escapeHtml(str) + '</code></pre>';
    }
});

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
]);

const currentChatIndex = ref(0);
const isSidebarCollapsed = ref(true);
const isDragging = ref(false);
const startX = ref(0);
const dragThreshold = 50;
const toggleBtnPosition = ref({ x: 20, y: 50 });
const startPosition = ref({ x: 0, y: 0 });

// ai对话相关参数
const API_KEY = 'NtHLeNRgfHfgEdkcmpiE:MhomOCjynnmScJDHDBIX';

onMounted(() => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // 发送消息到服务器并处理流式响应
    async function* fetchStreamResponse(message) {
        const response = await fetch(`/api/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: '4.0Ultra',
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                stream: true
            })
        });
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value);
            const lines = buffer.split('\n');

            // 处理除最后一行外的所有完整行
            buffer = lines.pop() || '';
            for (const line of lines) {
                const shortLine = line.replace('data: ', '');
                if (shortLine.trim() && shortLine !== '[DONE]') {
                    yield JSON.parse(shortLine);
                }
                if (shortLine === '[DONE]') {
                    yield { choices: [{ delta: { content: 'DONE' } }] };
                }
            }
        }
    }

    // 添加消息到聊天界面
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;

        messageDiv.innerHTML = `<div class="content">${content}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 处理用户输入
    async function handleUserInput() {
        const message = userInput.value.trim();
        if (!message) return;

        // 禁用输入和发送按钮
        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;

        // 显示用户消息
        currentMessages().push({
            role: 'user',
            content: message
        });

        try {
            // 流式输出响应
            let responseText = '';
            let isAnswering = false;

            for await (const { choices } of fetchStreamResponse(message)) {
                const curResponesTxt = choices[0]?.delta?.content || '';
                if (curResponesTxt && curResponesTxt !== 'DONE') {
                    responseText += curResponesTxt;
                    if (!isAnswering) {
                        isAnswering = true;
                        // 创建新的消息元素
                        currentMessages().push({
                            role: 'assistant',
                            content: md.render(responseText),
                            isTyping: true
                        });
                    } else {
                        // 更新正在输入的消息
                        const lastIndex = currentMessages().length - 1;
                        if (lastIndex >= 0 && currentMessages()[lastIndex].role === 'assistant') {
                            currentMessages()[lastIndex] = {
                                role: 'assistant',
                                content: md.render(responseText),
                                isTyping: true
                            };
                        }
                    }
                    // 滚动到底部
                    await nextTick();
                    scrollToBottom();
                } else if (curResponesTxt === 'DONE') {
                    isAnswering = false;
                    // 移除typing状态
                    const lastIndex = currentMessages().length - 1;
                    if (lastIndex >= 0 && currentMessages()[lastIndex].role === 'assistant') {
                        currentMessages()[lastIndex].isTyping = false;
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            currentMessages().push({
                role: 'assistant',
                content: '<p style="color: #dc3545;">发生错误，请稍后重试</p>'
            });
            await nextTick();
            scrollToBottom();
        } finally {
            // 重新启用输入和发送按钮
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }

    // 滚动到底部
    function scrollToBottom() {
        nextTick(() => {
            const messagesEl = document.getElementById('chat-messages');
            if (messagesEl) {
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }
        });
    }

    // 初始化事件监听器
    nextTick(() => {
        sendButton.addEventListener('click', handleUserInput);
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserInput();
            }
        });

        // 自动调整textarea高度
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // 初始化焦点
        userInput.focus();
    });

    // 监听消息变化，自动滚动
    watch(() => currentMessages().length, () => {
        scrollToBottom();
    });
});

const toggleSidebar = () => {
    if (!isDragging.value) {
        isSidebarCollapsed.value = !isSidebarCollapsed.value;
    }
};

const handleToggle = (e) => {
    if (!isDragging.value) {
        toggleSidebar();
    }
};

const startDrag = (e) => {
    isDragging.value = false;
    startPosition.value = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
    };
};

// 拖拽中
const onDrag = (e) => {
    const deltaX = e.touches[0].clientX - startPosition.value.x;
    const deltaY = e.touches[0].clientY - startPosition.value.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        isDragging.value = true;
    }

    if (isDragging.value) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const btnSize = 80; // rpx
        const btnSizePx = (btnSize * screenWidth) / 750; // 转换为px

        // 计算新位置（rpx），X轴固定在左侧
        let newX = 20; // 固定在左侧边缘
        let newY = toggleBtnPosition.value.y + deltaY;

        // 限制按钮在屏幕内
        newY = Math.max(Math.min(newY, screenHeight - 80), 30); // 只限制Y轴移动范围

        toggleBtnPosition.value = { x: newX, y: newY };
        startPosition.value = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
};

// 结束拖拽
const endDrag = () => {
    // 自动吸附到左侧
    toggleBtnPosition.value.x = 20;
    setTimeout(() => {
        isDragging.value = false;
    }, 100);
};

const currentMessages = () => chatHistory[currentChatIndex.value].messages;

const createNewChat = () => {
    chatHistory.push({
        title: `Chat ${chatHistory.length + 1}`,
        messages: [
            {
                role: 'assistant',
                content: 'Hello! How can I help you today?'
            }
        ]
    });
    currentChatIndex.value = chatHistory.length - 1;
};

const switchChat = (index) => {
    currentChatIndex.value = index;
};

const deleteChat = (index) => {
    if (chatHistory.length <= 1) return;
    chatHistory.splice(index, 1);
    if (currentChatIndex.value >= index) {
        currentChatIndex.value = Math.max(0, currentChatIndex.value - 1);
    }
};
</script>

<style scoped>
.chat-app {
    display: flex;
    height: 100vh;
    position: relative;
    background: #f5f5f5;
}

.sidebar-toggle {
    position: fixed;
    left: 10px;
    top: 10px;
    z-index: 100;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
}

.sidebar-toggle:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
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
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 280px;
    border-right: 1px solid #e5e7eb;
    background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
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
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    background: white;
}

.sidebar-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.sidebar-header button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.sidebar-header button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
}

.chat-list {
    flex: 1;
    overflow-y: auto;
}

.chat-item {
    padding: 14px 20px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
    margin: 2px 0;
}

.chat-item:hover {
    background-color: #f3f4f6;
}

.chat-item.active {
    background-color: #ede9fe;
    border-left-color: #667eea;
    font-weight: 500;
}

.chat-item span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #374151;
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
    margin-left: 280px;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: white;
    border-radius: 0;
    overflow: hidden;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}

@media (max-width: 767px) {
    .chat-container {
        margin-left: 0;
    }

    .sidebar {
        width: 260px;
    }

    .messages {
        padding: 16px;
    }

    .content {
        max-width: 85%;
    }

    .input-area {
        padding: 12px;
    }
}

.messages {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
    scroll-behavior: smooth;
}

.messages::-webkit-scrollbar {
    width: 8px;
}

.messages::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.messages::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.messages::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.message {
    display: flex;
    margin-bottom: 24px;
    gap: 12px;
    animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message.user {
    flex-direction: row-reverse;
}

.avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid white;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.content {
    max-width: 75%;
    min-width: 0;
}

.message.user .content {
    text-align: right;
}

.text {
    padding: 14px 18px;
    border-radius: 16px;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    position: relative;
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.6;
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
    background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
    border-top-left-radius: 4px;
}

.message.user .text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-top-right-radius: 4px;
}

/* Markdown 样式 */
.markdown-body {
    font-size: 15px;
    line-height: 1.7;
    color: inherit;
}

.markdown-body :deep(p) {
    margin: 0.75em 0;
}

.markdown-body :deep(p:first-child) {
    margin-top: 0;
}

.markdown-body :deep(p:last-child) {
    margin-bottom: 0;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
    margin-top: 1.2em;
    margin-bottom: 0.8em;
    font-weight: 600;
    line-height: 1.4;
}

.markdown-body :deep(h1) {
    font-size: 1.8em;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 0.3em;
}

.markdown-body :deep(h2) {
    font-size: 1.5em;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 0.3em;
}

.markdown-body :deep(h3) {
    font-size: 1.3em;
}

.markdown-body :deep(h4) {
    font-size: 1.1em;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
    margin: 0.75em 0;
    padding-left: 2em;
}

.markdown-body :deep(li) {
    margin: 0.3em 0;
}

.markdown-body :deep(blockquote) {
    margin: 1em 0;
    padding: 0.5em 1em;
    border-left: 4px solid #667eea;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 4px;
}

.markdown-body :deep(code) {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.message.user .markdown-body :deep(code) {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
}

.markdown-body :deep(pre) {
    margin: 1em 0;
    padding: 1em;
    border-radius: 8px;
    overflow-x: auto;
    background: #1e1e1e;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.markdown-body :deep(pre code) {
    background: transparent;
    padding: 0;
    color: inherit;
    font-size: 0.9em;
}

.markdown-body :deep(table) {
    border-collapse: collapse;
    margin: 1em 0;
    width: 100%;
    overflow-x: auto;
    display: block;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 0.6em 1em;
    text-align: left;
}

.markdown-body :deep(table th) {
    background: rgba(0, 0, 0, 0.05);
    font-weight: 600;
}

.markdown-body :deep(a) {
    color: #667eea;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;
}

.markdown-body :deep(a:hover) {
    border-bottom-color: #667eea;
}

.message.user .markdown-body :deep(a) {
    color: #fff;
    border-bottom-color: rgba(255, 255, 255, 0.5);
}

.markdown-body :deep(hr) {
    border: none;
    border-top: 2px solid rgba(0, 0, 0, 0.1);
    margin: 1.5em 0;
}

.markdown-body :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1em 0;
}

.markdown-body :deep(strong) {
    font-weight: 600;
}

.markdown-body :deep(em) {
    font-style: italic;
}

.input-area {
    display: flex;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    background: white;
    gap: 12px;
    align-items: flex-end;
}

.input-area textarea {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    resize: none;
    min-height: 48px;
    max-height: 120px;
    font-size: 15px;
    font-family: inherit;
    transition: all 0.2s ease;
    background: #f9fafb;
}

.input-area textarea:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-area button {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 500;
    font-size: 15px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    height: 48px;
    flex-shrink: 0;
}

.input-area button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
}

.input-area button:active:not(:disabled) {
    transform: translateY(0);
}

.input-area button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
