<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const board = ref(Array(16).fill(0));
const score = ref(0);
const bestScore = ref(0);
const gameOver = ref(false);
const gameWon = ref(false);

// 颜色映射
const tileColors = {
    0: '#cdc1b4',
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e'
};

// 文字颜色
const textColors = {
    2: '#776e65',
    4: '#776e65',
    8: '#f9f6f2',
    16: '#f9f6f2',
    32: '#f9f6f2',
    64: '#f9f6f2',
    128: '#f9f6f2',
    256: '#f9f6f2',
    512: '#f9f6f2',
    1024: '#f9f6f2',
    2048: '#f9f6f2'
};

// 初始化游戏
const initGame = () => {
    board.value = Array(16).fill(0);
    score.value = 0;
    gameOver.value = false;
    gameWon.value = false;
    addRandomTile();
    addRandomTile();
};

// 添加随机方块
const addRandomTile = () => {
    const emptyCells = [];
    board.value.forEach((value, index) => {
        if (value === 0) {
            emptyCells.push(index);
        }
    });

    if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board.value[randomIndex] = Math.random() < 0.9 ? 2 : 4;
    }
};

// 移动和合并逻辑
const move = (direction) => {
    let moved = false;
    if (!hasPossibleMoves(direction)) return false;

    for (let i = 0; i < 4; i++) {
        let line = [];

        // 根据方向提取行或列
        if (direction === 'left' || direction === 'right') {
            // 处理行
            line = board.value.slice(i * 4, i * 4 + 4); // 0-4,4-8,8-12,12-16
            if (direction === 'right') {
                line = line.reverse(); // 16-12, 12-8, 8-4, 4-0
            }
        } else {
            // 处理列
            for (let j = 0; j < 4; j++) {
                const index = j * 4 + i;
                line.push(board.value[index]); // 获取列的数组，按照纵向从左到右,单列从上到下 获取下标
            }
            if (direction === 'down') {
                line = line.reverse(); // 获取列的数组，按照纵向从右到左,单列从下到上 获取下标
            }
        }

        // 处理行/列：移除空格并合并相同数字
        const processedLine = [];
        let prevValue = null;

        for (const value of line) {
            if (value !== 0) {
                if (prevValue === null) {
                    prevValue = value;
                } else if (prevValue === value) {
                    processedLine.push(prevValue * 2);
                    score.value += prevValue * 2;
                    prevValue = null;
                    moved = true;
                } else {
                    processedLine.push(prevValue);
                    prevValue = value;
                    moved = true;
                }
            }
        }

        if (prevValue !== null) {
            processedLine.push(prevValue);
        }

        // 填充剩余的空格
        while (processedLine.length < 4) {
            processedLine.push(0);
        }

        // 根据方向还原处理后的行/列
        let finalLine = processedLine;
        if (direction === 'right' || direction === 'down') {
            finalLine = finalLine.reverse();
        }

        // 更新board
        for (let j = 0; j < 4; j++) {
            let index;
            if (direction === 'left' || direction === 'right') {
                index = i * 4 + j;
            } else {
                index = j * 4 + i;
            }

            if (board.value[index] !== finalLine[j]) {
                moved = true;
            }
            board.value[index] = finalLine[j];
        }
    }

    return moved;
};

const moveLeft = () => move('left');
const moveRight = () => move('right');
const moveUp = () => move('up');
const moveDown = () => move('down');

// 处理键盘输入
const handleKeyPress = (event) => {
    if (gameOver.value) return;

    let moved = false;
    switch (event.key) {
        case 'ArrowLeft':
            moved = moveLeft();
            break;
        case 'ArrowRight':
            moved = moveRight();
            break;
        case 'ArrowUp':
            moved = moveUp();
            break;
        case 'ArrowDown':
            moved = moveDown();
            break;
        default:
            return;
    }

    if (moved) {
        addRandomTile();
        checkGameStatus();
    }
};

// 检查游戏状态
const checkGameStatus = () => {
    // 检查是否获胜
    if (board.value.includes(2048) && !gameWon.value) {
        gameWon.value = true;
    }

    // 检查是否游戏结束
    if (!hasEmptyCells() && !hasPossibleMoves('all')) {
        gameOver.value = true;
    }

    // 更新最高分
    if (score.value > bestScore.value) {
        bestScore.value = score.value;
    }
};

// 检查是否有空格
const hasEmptyCells = () => {
    return board.value.some((cell) => cell === 0);
};

// 检查是否还有可能的移动
const hasPossibleMoves = (direction) => {
    // 检查水平方向
    const horizonD = ['left', 'right'];
    const verticalD = ['up', 'down'];
    if (horizonD.includes(direction) || direction === 'all') {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                const index = row * 4 + col;
                const isSameBlock = board.value[index] === board.value[index + 1];
                const nextIsEmpty = !board.value[index + 1] || !board.value[index - 1];
                if (isSameBlock || nextIsEmpty) {
                    return true;
                }
            }
        }
        return false;
    } else if (verticalD.includes(direction) || direction === 'all') {
        // 检查垂直方向
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 3; row++) {
                const index = row * 4 + col;
                const isSameBlock = board.value[index] === board.value[index + 4];
                const nextIsEmpty = !board.value[index + 4] || !board.value[index - 4];
                if (isSameBlock || nextIsEmpty) {
                    return true;
                }
            }
        }
        return false;
    }
};

// 重新开始游戏
const restartGame = () => {
    initGame();
};

// 初始化游戏
onMounted(() => {
    initGame();
    window.addEventListener('keydown', handleKeyPress);
});

// 清理事件监听器
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
});
</script>

<template>
    <div class="game-container">
        <div class="game-header">
            <h1>2048</h1>
            <div class="scores">
                <div class="score-box">
                    <div class="score-label">分数</div>
                    <div class="score-value">{{ score }}</div>
                </div>
                <div class="score-box">
                    <div class="score-label">最高分</div>
                    <div class="score-value">{{ bestScore }}</div>
                </div>
                <button @click="restartGame" class="new-game-btn">新游戏</button>
            </div>
        </div>

        <div class="game-board">
            <div
                v-for="(cell, index) in board"
                :key="index"
                class="cell"
                :style="{
                    backgroundColor: tileColors[cell],
                    color: textColors[cell] || '#776e65'
                }"
            >
                {{ cell !== 0 ? cell : '' }}
            </div>
        </div>

        <div v-if="gameOver" class="game-over">
            <h2>游戏结束！</h2>
            <p>最终得分: {{ score }}</p>
            <button @click="restartGame" class="restart-btn">再玩一次</button>
        </div>

        <div v-if="gameWon" class="game-won">
            <h2>恭喜！你赢了！</h2>
            <p>得分: {{ score }}</p>
            <button @click="restartGame" class="continue-btn">继续游戏</button>
        </div>

        <div class="game-instructions">
            <p>使用方向键移动方块，相同数字的方块相撞时会合并！</p>
        </div>
    </div>
</template>

<style scoped>
.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    background-color: #faf8ef;
    font-family: 'Arial', sans-serif;
}

.game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 500px;
    margin-bottom: 20px;
}

.game-header h1 {
    font-size: 60px;
    font-weight: bold;
    color: #776e65;
    margin: 0;
}

.scores {
    display: flex;
    gap: 10px;
    align-items: center;
}

.score-box {
    background-color: #bbada0;
    padding: 8px 16px;
    border-radius: 5px;
    text-align: center;
    min-width: 80px;
}

.score-label {
    font-size: 12px;
    color: #eee4da;
    text-transform: uppercase;
}

.score-value {
    font-size: 20px;
    font-weight: bold;
    color: white;
}

.new-game-btn {
    background-color: #8f7a66;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    margin-left: 10px;
}

.new-game-btn:hover {
    background-color: #9f8b77;
}

.game-board {
    display: grid;
    grid-template-columns: repeat(4, 85px);
    grid-template-rows: repeat(4, 85px);
    gap: 10px;
    background-color: #bbada0;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
}

.cell {
    width: 85px;
    height: 85px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    transition: all 0.1s ease;
}

.game-over,
.game-won {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(238, 228, 218, 0.95);
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    z-index: 10;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.game-over h2,
.game-won h2 {
    color: #776e65;
    margin-bottom: 10px;
}

.game-over p,
.game-won p {
    color: #776e65;
    margin-bottom: 20px;
}

.restart-btn,
.continue-btn {
    background-color: #8f7a66;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.restart-btn:hover,
.continue-btn:hover {
    background-color: #9f8b77;
}

.game-instructions {
    text-align: center;
    color: #776e65;
    font-size: 14px;
    margin-top: 20px;
}

@media (max-width: 600px) {
    .game-header {
        flex-direction: column;
        gap: 20px;
    }

    .game-header h1 {
        font-size: 40px;
    }

    .game-board {
        grid-template-columns: repeat(4, 70px);
        grid-template-rows: repeat(4, 70px);
        gap: 8px;
        padding: 10px;
    }

    .cell {
        width: 70px;
        height: 70px;
        font-size: 24px;
    }

    .score-box {
        min-width: 60px;
        padding: 6px 12px;
    }

    .score-value {
        font-size: 16px;
    }
}
</style>
