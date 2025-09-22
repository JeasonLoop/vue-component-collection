<template lang="">
  <div class="gameContainer" ref="gameWindow">
    <div class="birdWrap" ref="bird"></div>
    <div class="ground"></div>
    <div v-for="pipe in pipes" :key="pipe.id" class="pipe" :style="{
      left: pipe.x + '%',
      height: pipe.height + '%',
      top: pipe.isTop ? 0 : 'auto',
      bottom: !pipe.isTop ? 0 : 'auto'
    }" />
    <!-- 分数显示移到最上层 -->
    <div v-if="gameStarted && !gameOver" class="scoreWrapper">
      <div class="currentScore">{{ score }}</div>
      <div class="highScoreDisplay">最高分: {{ highScore }}</div>
    </div>
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
        <p>得分：{{ score }}</p>
        <button @click="restartGame">再玩一次</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  const gameOver = ref(false)
  const gameStarted = ref(false)
  const highScore = ref(parseInt(localStorage.getItem('flappyBirdHighScore') || '0'))
  const score = ref(0)

  const bird = ref(null) // 游戏bird实体
  const gameWindow = ref(null) // 游戏窗口实体
  let velocity =1 // 下落速度
  let gravity = 0.01  // 降低重力系数
  let position = 40 // 初始位置
  let isPlaying = true
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
    // 添加速度变化的视觉提示
    const speedHint = document.createElement('div')
    speedHint.className = 'speedHint'
    speedHint.textContent = '速度提升！'
    document.querySelector('.gameContainer').appendChild(speedHint)

    // 1秒后移除提示
    setTimeout(() => {
      speedHint.remove()
    }, 1000)
  }

  // 分数更新
  function updateScore() {
    pipes.value.forEach(pipe => {
      if (pipe.isTop && !passedPipes.has(pipe.id)) {
        const birdRect = bird.value.getBoundingClientRect()
        const birdLeft = (birdRect.left / window.innerWidth) * 100

        // 当小鸟通过管道时（管道的右边缘在小鸟的左边）
        if (pipe.x + pipeWidth < birdLeft) {
          score.value += 1
          passedPipes.add(pipe.id)
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

  // 碰撞检测
  function checkCollision() {
    if (!bird.value) return false

    const birdRect = bird.value.getBoundingClientRect()
    const containerRect = document.querySelector('.gameContainer').getBoundingClientRect()

    // 将小鸟的实际位置转换为相对于容器的百分比
    const birdSize = {
      width: (birdRect.width / containerRect.width) * 100,
      height: (birdRect.height / containerRect.height) * 100
    }

    // 小鸟的碰撞箱（稍微缩小一点，使碰撞更精确）
    const collisionBox = {
      left: (birdRect.left / containerRect.width) * 100,
      right: ((birdRect.left + birdRect.width) / containerRect.width) * 100,
      top: position + birdSize.height * 0.2, // 上边界缩小20%
      bottom: position + birdSize.height * 0.8 // 下边界缩小20%
    }

    // 检查与地面的碰撞（留一点余地）
    if (collisionBox.bottom > 88) {
      return true
    }

    // 检查与天花板的碰撞（留一点余地）
    if (collisionBox.top < 2) {
      return true
    }

    // 检查与管道的碰撞
    for (const pipe of pipes.value) {
      const pipeLeft = pipe.x
      const pipeRight = pipe.x + pipeWidth

      // 只检查与小鸟水平位置重叠的管道
      if (collisionBox.right > pipeLeft && collisionBox.left < pipeRight) {
        if (pipe.isTop) {
          // 上方管道碰撞检测（给予一点余地）
          const topPipeBottom = pipe.height
          if (collisionBox.top < topPipeBottom - 2) {
            return true
          }
        } else {
          // 下方管道碰撞检测（给予一点余地）
          const bottomPipeTop = 100 - pipe.height
          if (collisionBox.bottom > bottomPipeTop + 2) {
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

    // 更自然的旋转过渡
    let rotation = velocity * 3  // 降低旋转系数

    if (bird.value) {
      bird.value.style.top = `${position}%`
      bird.value.style.transform = `translateY(-50%)`
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
  function startGame(e) {

    gameStarted.value = true
    isPlaying = true
    score.value = 0
    position = 40
    velocity = 0
    pipes.value = []
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
    color: #333;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
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

  .score {
    position: absolute;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 48px;
    font-weight: bold;
    color: #333;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    z-index: 100;
  }

  .modalContent .finalScore {
    font-size: 24px;
    color: #2ecc71;
    margin: 10px 0;
  }

  /* 添加分数增加时的动画效果 */
  @keyframes scorePopup {
    0% {
      transform: translateX(-50%) scale(1);
    }

    50% {
      transform: translateX(-50%) scale(1.2);
    }

    100% {
      transform: translateX(-50%) scale(1);
    }
  }

  .score {
    animation: scorePopup 0.3s ease-out;
  }

  .pipe {
    position: absolute;
    width: 5%;
    background: #2ecc71;
    z-index: 1;
  }

  .gameContainer {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #f0f0f0;
    overflow: hidden;
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
    background: #333;
  }

  .birdWrap {
    position: absolute;
    left: 10%;
    will-change: transform;
    width: 25px;
    /* 稍微减小视觉大小 */
    height: 25px;
    /* 稍微减小视觉大小 */
    border-radius: 50%;
    background: red;
    transition: transform 0.15s linear;
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
    background: rgba(46, 204, 113, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 20px;
    animation: fadeInOut 1s ease-in-out;
    z-index: 1000;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }

    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1);
    }

    80% {
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