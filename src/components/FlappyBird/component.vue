<template lang="">
  <div class="gameContainer" ref="gameWindow">
    <!-- 天空背景 -->
    <div class="sky"></div>
    <!-- 云朵装饰 -->
    <div class="cloud cloud1"></div>
    <div class="cloud cloud2"></div>
    <div class="cloud cloud3"></div>

    <div class="birdWrap" ref="bird" :style="{ transform: birdTransform }">
      <div class="bird-body"></div>
      <div class="bird-wing bird-wing-left"></div>
      <div class="bird-wing bird-wing-right"></div>
    </div>
    <div class="ground"></div>
    <div v-for="pipe in pipes" :key="pipe.id" class="pipe" :class="{ 'pipe-top': pipe.isTop, 'pipe-bottom': !pipe.isTop }" :style="{
      left: pipe.x + '%',
      height: pipe.height + '%',
      top: pipe.isTop ? 0 : 'auto',
      bottom: !pipe.isTop ? 0 : 'auto'
    }">
      <div class="pipe-cap"></div>
    </div>
    <!-- 分数显示移到最上层 -->
    <div v-if="gameStarted && !gameOver" class="scoreWrapper">
      <div class="currentScore" :class="{ 'score-popup': scoreChanged }">{{ score }}</div>
      <div class="highScoreDisplay">最高分: {{ highScore }}</div>
    </div>
    <!-- 速度提示 -->
    <transition name="speed-hint">
      <div v-if="showSpeedHint" class="speedHint">速度提升！</div>
    </transition>
    <!-- 开始游戏封面 -->
    <div v-if="!gameStarted" class="startScreen">
      <div class="startContent">
        <h1>Flappy Bird</h1>
        <p>点击屏幕或按空格键开始游戏</p>
        <p class="highScore" v-if="highScore > 0">最高分: {{ highScore }}</p>
        <button @click="startGame" class="startButton">开始游戏</button>
      </div>
    </div>
    <!-- 添加游戏结束弹窗 -->
    <div v-if="gameOver" class="gameOverModal">
      <div class="modalContent">
        <h2>游戏结束</h2>
        <p class="finalScore">得分：{{ score }}</p>
        <p v-if="score === highScore && score > 0" class="newRecord">🎉 新纪录！</p>
        <button @click="restartGame">再玩一次</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

  const gameOver = ref(false)
  const gameStarted = ref(false)
  const highScore = ref(parseInt(localStorage.getItem('flappyBirdHighScore') || '0'))
  const score = ref(0)
  const scoreChanged = ref(false)
  const showSpeedHint = ref(false)

  const bird = ref(null) // 游戏bird实体
  const gameWindow = ref(null) // 游戏窗口实体
  let velocity = 0 // 下落速度
  let gravity = 0.01  // 降低重力系数
  let position = 40 // 初始位置
  let rotation = 0 // 小鸟旋转角度
  let isPlaying = false
  let animationFrameId = null

  // 管道速度相关配置
  const pipeConfig = {
    initialSpeed: 0.3,
    maxSpeed: 1,
    speedIncreaseInterval: 8000, // 每8秒增加一次速度
    speedIncreaseAmount: 0.02, // 每次增加的速度
  }

  let pipeSpeed = pipeConfig.initialSpeed
  let gameStartTime = 0
  let speedIncreaseTimer = null

  const pipes = ref([]) // 管道数组
  const pipeGap = 15 // 上下管道之间的间隙
  const pipeWidth = 5 // 管道宽度
  const passedPipes = new Set() // 用于记录已经通过的管道

  // 计算小鸟的 transform 样式
  const birdTransform = computed(() => {
    return `translateY(-50%) rotate(${rotation}deg)`
  })


  // 管道速度变化
  function updatePipeSpeed() {
    const currentTime = Date.now()
    const gameTime = currentTime - gameStartTime

    // 计算应该增加多少次速度
    const speedIncreaseTimes = Math.floor(gameTime / pipeConfig.speedIncreaseInterval)

    // 计算新速度，但不超过最大速度
    const newSpeed = Math.min(
      pipeConfig.initialSpeed + (speedIncreaseTimes * pipeConfig.speedIncreaseAmount),
      pipeConfig.maxSpeed
    )

    if (newSpeed !== pipeSpeed) {
      pipeSpeed = newSpeed
      // 可以添加速度变化的提示
      showSpeedChangeHint()
    }
  }

  // 速度提升提示
  function showSpeedChangeHint() {
    showSpeedHint.value = true
    setTimeout(() => {
      showSpeedHint.value = false
    }, 1000)
  }

  // 分数更新
  function updateScore() {
    if (!bird.value || !gameWindow.value) return

    pipes.value.forEach(pipe => {
      if (pipe.isTop && !passedPipes.has(pipe.id)) {
        const birdRect = bird.value.getBoundingClientRect()
        const containerRect = gameWindow.value.getBoundingClientRect()
        const birdLeft = ((birdRect.left - containerRect.left) / containerRect.width) * 100

        // 当小鸟通过管道时（管道的右边缘在小鸟的左边）
        if (pipe.x + pipeWidth < birdLeft) {
          score.value += 1
          passedPipes.add(pipe.id)
          // 触发分数变化动画
          scoreChanged.value = true
          setTimeout(() => {
            scoreChanged.value = false
          }, 300)
        }
      }
    })
  }

  // 生成管道
  function generatePipe() {
    const minHeight = 20
    const maxHeight = 60
    const height = Math.random() * (maxHeight - minHeight) + minHeight
    const id = Date.now()

    pipes.value.push(
      { id: id, x: 100, height: height, isTop: true },
      { id: id + 1, x: 100, height: 100 - height - pipeGap, isTop: false }
    )
  }

  // 管道移动逻辑
  function movePipes() {
    pipes.value.forEach(pipe => {
      pipe.x -= pipeSpeed
    })

    // 移除超出屏幕的管道
    pipes.value = pipes.value.filter(pipe => pipe.x > -pipeWidth)

    // 当最后一对管道移动到特定位置时生成新管道
    const lastPipe = pipes.value[pipes.value.length - 1]
    if (lastPipe && lastPipe.x < 60) {
      generatePipe()
    }
  }

  // 碰撞检测（改进版，使用像素级精确检测）
  function checkCollision() {
    if (!bird.value || !gameWindow.value) return false

    const birdRect = bird.value.getBoundingClientRect()
    const containerRect = gameWindow.value.getBoundingClientRect()

    // 小鸟的实际像素位置和尺寸
    const birdBox = {
      left: birdRect.left,
      right: birdRect.right,
      top: birdRect.top,
      bottom: birdRect.bottom,
      width: birdRect.width,
      height: birdRect.height
    }

    // 检查与地面的碰撞（使用像素值）
    const groundTop = containerRect.bottom - (containerRect.height * 0.1) // 地面顶部位置
    if (birdBox.bottom > groundTop) {
      return true
    }

    // 检查与天花板的碰撞（使用像素值）
    const ceilingBottom = containerRect.top + (containerRect.height * 0.02) // 天花板底部位置
    if (birdBox.top < ceilingBottom) {
      return true
    }

    // 检查与管道的碰撞
    for (const pipe of pipes.value) {
      // 计算管道的实际像素位置
      const pipeLeft = containerRect.left + (pipe.x / 100) * containerRect.width
      const pipeRight = pipeLeft + (pipeWidth / 100) * containerRect.width

      // 只检查与小鸟水平位置重叠的管道
      if (birdBox.right > pipeLeft && birdBox.left < pipeRight) {
        if (pipe.isTop) {
          // 上方管道碰撞检测
          const pipeBottom = containerRect.top + (pipe.height / 100) * containerRect.height
          // 小鸟顶部与管道底部碰撞（给予2像素容差）
          if (birdBox.top < pipeBottom - 2) {
            return true
          }
        } else {
          // 下方管道碰撞检测
          const pipeTop = containerRect.bottom - (pipe.height / 100) * containerRect.height
          // 小鸟底部与管道顶部碰撞（给予2像素容差）
          if (birdBox.bottom > pipeTop + 2) {
            return true
          }
        }
      }
    }

    return false
  }

  function animate() {
    if (!isPlaying) {
      cancelAnimationFrame(animationFrameId)
      return
    }

    velocity += gravity
    position += velocity * 0.6  // 降低速度系数

    // 增加位置边界限制
    if (position > 90) {
      position = 90
      velocity = 0
      cancelAnimationFrame(animationFrameId)
      return
    }

    // 更自然的旋转过渡（限制旋转角度在 -30 到 90 度之间）
    rotation = Math.max(-30, Math.min(90, velocity * 3))

    if (bird.value) {
      bird.value.style.top = `${position}%`
    }

    movePipes() // 添加管道移动逻辑
    updateScore() // 添加分数更新逻辑

    // 检查碰撞
    if (checkCollision()) {
      endGame()
      return
    }

    // 控制渲染频率为 60fps
    animationFrameId = requestAnimationFrame(animate)
  }

  // 跳跃
  function jump() {
    velocity = -0.4  // 调整跳跃力度
  }


  // 开始游戏
  function startGame() {
    gameStarted.value = true
    isPlaying = true
    score.value = 0
    scoreChanged.value = false
    position = 40
    velocity = 0
    rotation = 0
    pipes.value = []
    passedPipes.clear() // 清空已通过的管道记录
    pipeSpeed = pipeConfig.initialSpeed // 重置管道速度
    gameStartTime = Date.now() // 记录游戏开始时间
    generatePipe()
    animate()

    // 启动速度增加定时器
    speedIncreaseTimer = setInterval(() => {
      if (isPlaying) {
        updatePipeSpeed()
      }
    }, 1000) // 每秒检查一次是否需要更新速度
  }


  function endGame() {
    isPlaying = false
    gameOver.value = true

    // 清除速度增加定时器
    if (speedIncreaseTimer) {
      clearInterval(speedIncreaseTimer)
      speedIncreaseTimer = null
    }

    // 更新最高分
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('flappyBirdHighScore', score.value.toString())
    }

    cancelAnimationFrame(animationFrameId)
  }

  const restartGame = () => {
    gameOver.value = false
    startGame()
  }

  // 添加键盘事件监听
  function handleKeyPress(event) {
    if (event.code === 'Space') {
      event.preventDefault()
      if (!gameStarted.value) {
        startGame()
      } else if (!gameOver.value) {
        jump()
      }
    }
  }


  onMounted(() => {
    window.addEventListener('keydown', handleKeyPress)
    if (gameWindow.value) {
      gameWindow.value.addEventListener('click', (e) => {
        if (gameStarted.value && !gameOver.value) {
          jump()
        }
      })
    }
  })

  // 清理动画帧
  onBeforeUnmount(() => {
    if (speedIncreaseTimer) {
      clearInterval(speedIncreaseTimer)
    }
    window.removeEventListener('keydown', handleKeyPress)
    cancelAnimationFrame(animationFrameId)
  })
</script>

<style>
  .startScreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .startContent {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }

  .startContent h1 {
    color: #2ecc71;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .startContent p {
    color: #666;
    margin-bottom: 1rem;
  }

  .startButton {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: #2ecc71;
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: background 0.3s;
  }

  .startButton:hover {
    background: #27ae60;
  }

  .scoreWrapper {
    position: fixed;
    top: 20px;
    left: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 100;
    pointer-events: none;
  }

  .currentScore {
    font-size: 48px;
    font-weight: bold;
    color: #fff;
    text-shadow:
      2px 2px 4px rgba(0, 0, 0, 0.5),
      0 0 10px rgba(255, 215, 0, 0.5);
    transition: transform 0.3s ease-out;
  }

  .currentScore.score-popup {
    animation: scorePopup 0.3s ease-out;
  }

  @keyframes scorePopup {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
      color: #ffd700;
    }
    100% {
      transform: scale(1);
    }
  }

  .highScoreDisplay {
    font-size: 20px;
    color: #666;
    margin-top: 5px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  }

  .highScore {
    color: #e74c3c;
    font-weight: bold;
  }


  .pipe {
    position: absolute;
    width: 5%;
    background: linear-gradient(to bottom, #27ae60 0%, #2ecc71 50%, #27ae60 100%);
    border-left: 3px solid #1e8449;
    border-right: 3px solid #1e8449;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2), 0 0 5px rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  .pipe-top {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .pipe-bottom {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .pipe-cap {
    position: absolute;
    width: 120%;
    height: 8%;
    left: -10%;
    background: linear-gradient(to bottom, #1e8449 0%, #27ae60 100%);
    border: 2px solid #145a32;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }

  .pipe-top .pipe-cap {
    top: 0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .pipe-bottom .pipe-cap {
    bottom: 0;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .gameContainer {
    position: relative;
    width: 100%;
    height: 100vh;
    background: linear-gradient(to bottom, #87ceeb 0%, #98d8ea 50%, #b0e0e6 100%);
    overflow: hidden;
  }

  .sky {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, #87ceeb 0%, #98d8ea 50%, #b0e0e6 100%);
    z-index: 0;
  }

  .cloud {
    position: absolute;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50px;
    opacity: 0.7;
    z-index: 0;
    animation: float 20s infinite ease-in-out;
  }

  .cloud:before,
  .cloud:after {
    content: '';
    position: absolute;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50px;
  }

  .cloud1 {
    width: 80px;
    height: 30px;
    top: 20%;
    left: 10%;
    animation-duration: 25s;
  }

  .cloud1:before {
    width: 50px;
    height: 50px;
    top: -25px;
    left: 10px;
  }

  .cloud1:after {
    width: 60px;
    height: 40px;
    top: -15px;
    right: 10px;
  }

  .cloud2 {
    width: 100px;
    height: 40px;
    top: 30%;
    right: 15%;
    animation-duration: 30s;
    animation-delay: -5s;
  }

  .cloud2:before {
    width: 60px;
    height: 60px;
    top: -30px;
    left: 15px;
  }

  .cloud2:after {
    width: 70px;
    height: 50px;
    top: -20px;
    right: 15px;
  }

  .cloud3 {
    width: 70px;
    height: 25px;
    top: 15%;
    right: 30%;
    animation-duration: 35s;
    animation-delay: -10s;
  }

  .cloud3:before {
    width: 45px;
    height: 45px;
    top: -22px;
    left: 8px;
  }

  .cloud3:after {
    width: 55px;
    height: 35px;
    top: -12px;
    right: 8px;
  }

  @keyframes float {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(20px);
    }
  }

  .restartbtn {
    position: absolute;
    top: 50px;
    left: 90%;
    transform: translate(-50%, -50%);
    z-index: 999;
  }

  .ground {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 10%;
    z-index: 5;
    background: linear-gradient(to bottom, #8b4513 0%, #654321 50%, #3e2723 100%);
    box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.3);
    border-top: 3px solid #5d4037;
  }

  .ground::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 20px,
        rgba(0, 0, 0, 0.1) 20px,
        rgba(0, 0, 0, 0.1) 22px
      );
    opacity: 0.3;
  }

  .birdWrap {
    position: absolute;
    left: 10%;
    will-change: transform;
    width: 30px;
    height: 30px;
    z-index: 10;
    transition: transform 0.1s ease-out;
  }

  .bird-body {
    width: 100%;
    height: 100%;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ff6347 100%);
    box-shadow:
      inset -3px -3px 0 rgba(0, 0, 0, 0.2),
      0 2px 5px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .bird-body::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 25%;
    width: 6px;
    height: 6px;
    background: #000;
    border-radius: 50%;
  }

  .bird-body::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 10%;
    width: 0;
    height: 0;
    border-left: 8px solid #ff6347;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
  }

  .bird-wing {
    position: absolute;
    background: linear-gradient(135deg, #ff8c00 0%, #ff6347 100%);
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  }

  .bird-wing-left {
    top: 20%;
    left: -15%;
    width: 12px;
    height: 8px;
    animation: wingFlap 0.3s infinite ease-in-out;
    transform-origin: right center;
  }

  .bird-wing-right {
    top: 20%;
    right: -15%;
    width: 12px;
    height: 8px;
    animation: wingFlap 0.3s infinite ease-in-out 0.15s;
    transform-origin: left center;
  }

  @keyframes wingFlap {
    0%, 100% {
      transform: rotate(0deg) scaleY(1);
    }
    50% {
      transform: rotate(-20deg) scaleY(0.8);
    }
  }

  .gameOverModal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  /* 更新游戏结束弹窗样式 */
  .modalContent {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }

  .modalContent h2 {
    color: #2ecc71;
    margin-bottom: 1rem;
  }

  .modalContent p {
    margin: 1rem 0;
  }

  .modalContent .finalScore {
    font-size: 2rem;
    color: #2ecc71;
    margin: 1rem 0;
    font-weight: bold;
  }

  .modalContent .newRecord {
    font-size: 1.2rem;
    color: #ffd700;
    margin: 0.5rem 0;
    font-weight: bold;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .modalContent button {
    padding: 0.8rem 1.5rem;
    font-size: 1.1rem;
    background: #2ecc71;
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: background 0.3s;
  }

  .modalContent button:hover {
    background: #27ae60;
  }

  .speedHint {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.95) 0%, rgba(39, 174, 96, 0.95) 100%);
    color: white;
    padding: 15px 30px;
    border-radius: 10px;
    font-size: 24px;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  .speed-hint-enter-active {
    animation: speedHintFadeIn 0.5s ease-out;
  }

  .speed-hint-leave-active {
    animation: speedHintFadeOut 0.5s ease-in;
  }

  @keyframes speedHintFadeIn {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes speedHintFadeOut {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
  }

  /* 添加难度等级显示 */
  .difficultyLevel {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 100;
  }
</style>
