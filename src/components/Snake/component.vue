<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { showMessage } from '../utils';

const ROWS = 20;
const COLS = 20;
const INITIAL_SPEED = 180;
const FAST_SPEED = 80;
const LONG_PRESS_DELAY = 300;
const MAX_FOOD_COUNT = 3;

const snake = ref([]);
const direction = ref('right');
const pendingDirection = ref('right');
const foods = ref([]);
const score = ref(0);
const bestScore = ref(0);
const gameOver = ref(false);
const isPaused = ref(false);
const timerId = ref(null);
let longPressTimeoutId = null;
let activeArrowKey = null;
const isSpeedUp = ref(false);

const getCenterPosition = () => {
  return {
    x: Math.floor(COLS / 2),
    y: Math.floor(ROWS / 2),
  };
};

const generateFoodPosition = () => {
  const occupied = [...snake.value, ...foods.value];
  if (occupied.length >= ROWS * COLS) {
    return { x: -1, y: -1 };
  }

  while (true) {
    const pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    const onOccupied = occupied.some(
      (segment) => segment.x === pos.x && segment.y === pos.y,
    );

    if (!onOccupied) {
      return pos;
    }
  }
};

const updateBestScore = () => {
  if (score.value > bestScore.value) {
    bestScore.value = score.value;
    try {
      localStorage.setItem('snake-best-score', String(bestScore.value));
    } catch (e) {
      // ignore
    }
  }
};

const clearLoop = () => {
  if (timerId.value) {
    clearInterval(timerId.value);
    timerId.value = null;
  }
};

const currentSpeed = ref(INITIAL_SPEED);

const startLoop = (speed = INITIAL_SPEED) => {
  currentSpeed.value = speed;
  clearLoop();
  timerId.value = setInterval(step, currentSpeed.value);
};

const enableSpeedUp = () => {
  if (isSpeedUp.value || gameOver.value) return;
  isSpeedUp.value = true;
  startLoop(FAST_SPEED);
};

const disableSpeedUp = () => {
  if (!isSpeedUp.value || gameOver.value) return;
  isSpeedUp.value = false;
  startLoop(INITIAL_SPEED);
};

const handleGameOver = (reason) => {
  gameOver.value = true;
  clearLoop();
  updateBestScore();
  if (longPressTimeoutId) {
    clearTimeout(longPressTimeoutId);
    longPressTimeoutId = null;
  }
  showMessage({
    theme: 'error',
    content: reason || `游戏结束，得分 ${score.value}`,
  });
};

const step = () => {
  if (gameOver.value || isPaused.value) return;
  if (!snake.value.length) return;

  direction.value = pendingDirection.value;

  const head = snake.value[0];
  let newHead = { x: head.x, y: head.y };

  switch (direction.value) {
    case 'up':
      newHead.y -= 1;
      break;
    case 'down':
      newHead.y += 1;
      break;
    case 'left':
      newHead.x -= 1;
      break;
    case 'right':
    default:
      newHead.x += 1;
      break;
  }

  if (
    newHead.x < 0 ||
    newHead.x >= COLS ||
    newHead.y < 0 ||
    newHead.y >= ROWS
  ) {
    handleGameOver('撞墙啦，游戏结束～');
    return;
  }

  const foodIndex = foods.value.findIndex(
    (item) => item.x === newHead.x && item.y === newHead.y,
  );
  const willGrow = foodIndex !== -1;

  const bodyToCheck = willGrow
    ? snake.value
    : snake.value.slice(0, snake.value.length - 1);

  const hitSelf = bodyToCheck.some(
    (segment) => segment.x === newHead.x && segment.y === newHead.y,
  );

  if (hitSelf) {
    handleGameOver('咬到自己啦，游戏结束～');
    return;
  }

  const newSnake = [newHead, ...snake.value];

  if (!willGrow) {
    newSnake.pop();
  } else {
    score.value += 10;
    updateBestScore();
    if (foodIndex !== -1) {
      foods.value.splice(foodIndex, 1);
    }
    const newFood = generateFoodPosition();

    if (newFood.x === -1 && newFood.y === -1) {
      gameOver.value = true;
      clearLoop();
      showMessage({
        theme: 'success',
        content: '恭喜你，占满了整个棋盘！',
      });
    } else {
      foods.value.push(newFood);
    }
  }

  snake.value = newSnake;
};

const initGame = () => {
  snake.value = [getCenterPosition()];
  direction.value = 'right';
  pendingDirection.value = 'right';
  score.value = 0;
  gameOver.value = false;
  isPaused.value = false;
  foods.value = [];
  isSpeedUp.value = false;
  activeArrowKey = null;
  if (longPressTimeoutId) {
    clearTimeout(longPressTimeoutId);
    longPressTimeoutId = null;
  }
  for (let i = 0; i < MAX_FOOD_COUNT; i++) {
    const pos = generateFoodPosition();
    if (pos.x === -1 && pos.y === -1) {
      break;
    }
    foods.value.push(pos);
  }
  startLoop(INITIAL_SPEED);
};

const restartGame = () => {
  initGame();
};

const togglePause = () => {
  if (gameOver.value) return;
  isPaused.value = !isPaused.value;
};

const handleKeydown = (event) => {
  const key = event.key;

  const opposite = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };

  if (
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'ArrowLeft' ||
    key === 'ArrowRight'
  ) {
    const dirMap = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };
    const dir = dirMap[key];

    if (direction.value !== opposite[dir]) {
      pendingDirection.value = dir;
    }

    if (activeArrowKey !== key) {
      if (longPressTimeoutId) {
        clearTimeout(longPressTimeoutId);
        longPressTimeoutId = null;
      }

      activeArrowKey = key;

      if (!isSpeedUp.value) {
        longPressTimeoutId = setTimeout(() => {
          longPressTimeoutId = null;
          enableSpeedUp();
        }, LONG_PRESS_DELAY);
      }
    }
  } else if (key === ' ') {
    event.preventDefault();
    togglePause();
  } else if (key === 'Enter' && gameOver.value) {
    restartGame();
  }
};

const handleKeyup = (event) => {
  const key = event.key;
  if (
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'ArrowLeft' ||
    key === 'ArrowRight'
  ) {
    if (longPressTimeoutId) {
      clearTimeout(longPressTimeoutId);
      longPressTimeoutId = null;
    }

    if (isSpeedUp.value) {
      disableSpeedUp();
    }

    if (activeArrowKey === key) {
      activeArrowKey = null;
    }
  }
};

const getCellClass = (x, y) => {
  if (!snake.value.length) {
    return {
      'snake-cell-empty': true,
    };
  }

  const head = snake.value[0];
  const isHead = head.x === x && head.y === y;

  let onBody = false;
  for (let i = 1; i < snake.value.length; i++) {
    const segment = snake.value[i];
    if (segment.x === x && segment.y === y) {
      onBody = true;
      break;
    }
  }

  const isFoodCell = foods.value.some(
    (item) => item.x === x && item.y === y,
  );

  return {
    'snake-cell-head': isHead,
    'snake-cell-body': !isHead && onBody,
    'snake-cell-food': isFoodCell,
    'snake-cell-empty': !isHead && !onBody && !isFoodCell,
  };
};

onMounted(() => {
  try {
    const saved = localStorage.getItem('snake-best-score');
    if (saved) {
      bestScore.value = parseInt(saved, 10) || 0;
    }
  } catch (e) {
    // ignore
  }

  initGame();
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);
});

onUnmounted(() => {
  clearLoop();
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keyup', handleKeyup);
  if (longPressTimeoutId) {
    clearTimeout(longPressTimeoutId);
    longPressTimeoutId = null;
  }
});
</script>

<template>
  <div class="snake-game-container">
    <div class="snake-header">
      <div class="snake-title">
        <h1>贪吃蛇</h1>
        <p class="snake-subtitle">使用键盘方向键控制蛇移动，吃到食物可以加分～</p>
      </div>
      <div class="snake-scores">
        <div class="snake-score-box">
          <div class="snake-score-label">当前分数</div>
          <div class="snake-score-value">{{ score }}</div>
        </div>
        <div class="snake-score-box">
          <div class="snake-score-label">最高分</div>
          <div class="snake-score-value">{{ bestScore }}</div>
        </div>
      </div>
    </div>

    <div class="snake-board-wrapper">
      <div class="snake-board">
        <div
          v-for="row in ROWS"
          :key="row"
          class="snake-row"
        >
          <div
            v-for="col in COLS"
            :key="col"
            class="snake-cell"
            :class="getCellClass(col - 1, row - 1)"
          />
        </div>

        <div v-if="gameOver" class="snake-status snake-status-over">
          <div class="snake-status-title">游戏结束</div>
          <div class="snake-status-text">按 Enter 键或点击“再来一局”重新开始</div>
        </div>

        <div v-else-if="isPaused" class="snake-status snake-status-paused">
          <div class="snake-status-title">已暂停</div>
          <div class="snake-status-text">按空格键继续游戏</div>
        </div>
      </div>
    </div>

    <div class="snake-controls">
      <button class="snake-btn primary" @click="restartGame">
        再来一局
      </button>
      <button class="snake-btn" @click="togglePause" :disabled="gameOver">
        {{ isPaused ? '继续' : '暂停' }}
      </button>
    </div>

    <div class="snake-instructions">
      <p>操作说明：</p>
      <ul>
        <li>使用键盘 ↑ ↓ ← → 控制蛇移动</li>
        <li>吃到红色食物可以加分，身体会变长</li>
        <li>撞到墙或自己的身体游戏结束</li>
        <li>空格键：暂停/继续，Enter：在游戏结束时重新开始</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.snake-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 20px 16px 40px;
  box-sizing: border-box;
  background: #0f172a;
  color: #e5e7eb;
}

.snake-header {
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.snake-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.snake-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

.snake-scores {
  display: flex;
  gap: 8px;
}

.snake-score-box {
  min-width: 80px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #111827;
  text-align: center;
}

.snake-score-label {
  font-size: 11px;
  color: #9ca3af;
}

.snake-score-value {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 600;
  color: #facc15;
}

.snake-board-wrapper {
  padding: 12px;
  border-radius: 14px;
  background: radial-gradient(circle at top, #1f2937, #020617);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.9);
}

.snake-board {
  position: relative;
  background: #020617;
  border-radius: 12px;
  padding: 6px;
  box-sizing: border-box;
}

.snake-row {
  display: flex;
}

.snake-cell {
  width: 14px;
  height: 14px;
  margin: 1px;
  border-radius: 3px;
  box-sizing: border-box;
  transition: background-color 0.08s ease-out, transform 0.08s ease-out;
}

.snake-cell-empty {
  background: #020617;
  border: 1px solid #0b1220;
}

.snake-cell-head {
  background: #22c55e;
  border: 1px solid #16a34a;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.7);
}

.snake-cell-body {
  background: #15803d;
  border: 1px solid #166534;
}

.snake-cell-food {
  background: #ef4444;
  border-radius: 50%;
  border: 1px solid #b91c1c;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
}

.snake-status {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(4px);
  text-align: center;
  padding: 12px;
}

.snake-status-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.snake-status-text {
  font-size: 13px;
  color: #d1d5db;
}

.snake-controls {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.snake-btn {
  min-width: 96px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #1f2937;
  background: #020617;
  color: #e5e7eb;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.16s ease-out, transform 0.08s ease-out,
    box-shadow 0.16s ease-out, opacity 0.16s ease-out;
}

.snake-btn.primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: #16a34a;
  color: #022c22;
  box-shadow: 0 10px 20px rgba(34, 197, 94, 0.35);
}

.snake-btn:active {
  transform: translateY(1px) scale(0.99);
  box-shadow: none;
}

.snake-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.snake-instructions {
  margin-top: 18px;
  font-size: 13px;
  color: #9ca3af;
  max-width: 480px;
}

.snake-instructions ul {
  margin: 4px 0 0;
  padding-left: 18px;
}

.snake-instructions li {
  margin-bottom: 2px;
}

@media (max-width: 600px) {
  .snake-game-container {
    padding-top: 16px;
  }

  .snake-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .snake-board-wrapper {
    transform: scale(0.95);
  }
}
</style>
