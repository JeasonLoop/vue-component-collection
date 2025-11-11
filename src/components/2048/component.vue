<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const board = ref(Array(16).fill(0));
const score = ref(0);
const bestScore = ref(0);
const gameOver = ref(false);
const gameWon = ref(false);

// 动画状态跟踪
const newTiles = ref(new Set()); // 新出现的方块索引
const mergedTiles = ref(new Set()); // 合并的方块索引
const isAnimating = ref(false); // 是否正在动画中

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
    newTiles.value.clear();
    mergedTiles.value.clear();
    isAnimating.value = false;
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
        // 标记为新出现的方块
        newTiles.value.add(randomIndex);
        // 300ms后移除新方块标记
        setTimeout(() => {
            newTiles.value.delete(randomIndex);
        }, 300);
    }
};

// 移动和合并逻辑
const move = async (direction) => {
    let moved = false;
    isAnimating.value = true;
    mergedTiles.value.clear();

    for (let i = 0; i < 4; i++) {
        let line = [];
        let lineIndices = []; // 保存原始索引

        // 根据方向提取行或列
        if (direction === 'left' || direction === 'right') {
            // 处理行
            for (let j = 0; j < 4; j++) {
                const index = i * 4 + j;
                line.push(board.value[index]);
                lineIndices.push(index);
            }
            if (direction === 'right') {
                line = line.reverse();
                lineIndices = lineIndices.reverse();
            }
        } else {
            // 处理列
            for (let j = 0; j < 4; j++) {
                const index = j * 4 + i;
                line.push(board.value[index]);
                lineIndices.push(index);
            }
            if (direction === 'down') {
                line = line.reverse();
                lineIndices = lineIndices.reverse();
            }
        }

        // 处理行/列：移除空格并合并相同数字
        const processedLine = [];
        const processedIndices = [];
        let prevValue = null;
        let prevIndex = null;

        for (let k = 0; k < line.length; k++) {
            const value = line[k];
            const originalIndex = lineIndices[k];

            if (value !== 0) {
                if (prevValue === null) {
                    prevValue = value;
                    prevIndex = originalIndex;
                } else if (prevValue === value) {
                    // 合并
                    processedLine.push(prevValue * 2);
                    processedIndices.push(prevIndex);
                    score.value += prevValue * 2;
                    mergedTiles.value.add(prevIndex);
                    prevValue = null;
                    prevIndex = null;
                } else {
                    processedLine.push(prevValue);
                    processedIndices.push(prevIndex);
                    prevValue = value;
                    prevIndex = originalIndex;
                }
            }
        }

        if (prevValue !== null) {
            processedLine.push(prevValue);
            processedIndices.push(prevIndex);
        }

        // 填充剩余的空格
        while (processedLine.length < 4) {
            processedLine.push(0);
            processedIndices.push(null);
        }

        // 根据方向还原处理后的行/列
        let finalLine = processedLine;
        let finalIndices = processedIndices;
        if (direction === 'right' || direction === 'down') {
            finalLine = finalLine.reverse();
            finalIndices = finalIndices.reverse();
        }

        // 更新board并检查是否有实际变化
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

    // 等待DOM更新后移除动画状态
    await nextTick();
    setTimeout(() => {
        isAnimating.value = false;
        // 300ms后清除合并标记
        setTimeout(() => {
            mergedTiles.value.clear();
        }, 200);
    }, 150);

    return moved;
};

const moveLeft = () => move('left');
const moveRight = () => move('right');
const moveUp = () => move('up');
const moveDown = () => move('down');

// 处理键盘输入
const handleKeyPress = async (event) => {
    if (gameOver.value || isAnimating.value) return;
    let moved = false;
    switch (event.key) {
        case 'ArrowLeft':
            moved = await moveLeft();
            break;
        case 'ArrowRight':
            moved = await moveRight();
            break;
        case 'ArrowUp':
            moved = await moveUp();
            break;
        case 'ArrowDown':
            moved = await moveDown();
            break;
        default:
            return;
    }

    if (moved) {
        // 延迟添加新方块，让移动动画完成
        setTimeout(() => {
            addRandomTile();
            checkGameStatus();
        }, 150);
    }
};

// 检查游戏状态
const checkGameStatus = () => {
    // 检查是否获胜
    if (board.value.includes(2048) && !gameWon.value) {
        gameWon.value = true;
    }

    // 检查是否游戏结束
    if (
        !hasEmptyCells() &&
        !hasPossibleMoves('left') &&
        !hasPossibleMoves('right') &&
        !hasPossibleMoves('up') &&
        !hasPossibleMoves('down')
    ) {
        gameOver.value = true;
    }

    // 更新最高分
    if (score.value > bestScore.value) {
        bestScore.value = score.value;
        // 保存最高分到localStorage
        localStorage.setItem('2048-best-score', bestScore.value.toString());
    }
};

// 检查是否有空格
const hasEmptyCells = () => {
    return board.value.some((cell) => cell === 0);
};

// 检查是否还有可能的移动
const hasPossibleMoves = (direction) => {
    // 需要判断的下标数组
    const genGridIndexArray = (direction) => {
        let gridIndexArray = [];
        // 检查水平方向
        if (['left', 'right'].includes(direction)) {
            for (let row = 0; row < 4; row++) {
                let singleRow = [];
                for (let col = 0; col < 4; col++) {
                    const index = row * 4 + col;
                    singleRow.push(index);
                }
                gridIndexArray.push(singleRow);
            }
        }

        if (['up', 'down'].includes(direction)) {
            // 检查垂直方向
            for (let col = 0; col < 4; col++) {
                let singleColumn = [];
                for (let row = 0; row < 4; row++) {
                    const index = row * 4 + col;
                    singleColumn.push(index);
                }
                gridIndexArray.push(singleColumn);
            }
        }

        return gridIndexArray;
    };

    // 检查该行是否能移动
    const checkCanMove = (direction) => {
        const gridArray = genGridIndexArray(direction);

        return gridArray.some((rowOrColumnIdxs) => {
            const currentLine = [...rowOrColumnIdxs].map((girdIdx) => board.value[girdIdx]);

            const filterZeroArr = currentLine.filter((item) => !!item); // 滤空数组

            // 如果行/列为空，可以移动（有空格）
            if (filterZeroArr.length === 0) {
                return false; // 空行/列不能移动
            }

            // 如果有空格，可以移动
            if (filterZeroArr.length < 4) {
                return true;
            }

            // 检查是否有相邻可合并项目
            const hasMergeablePair = filterZeroArr.some((item, idx) => {
                return item === filterZeroArr[idx + 1] && filterZeroArr[idx + 1] !== undefined;
            });

            return hasMergeablePair;
        });
    };

    return checkCanMove(direction);
};
// 重新开始游戏
const restartGame = () => {
    initGame();
};

// 初始化游戏
onMounted(() => {
    // 从localStorage加载最高分
    const savedBestScore = localStorage.getItem('2048-best-score');
    if (savedBestScore) {
        bestScore.value = parseInt(savedBestScore, 10);
    }
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
                :class="{
                    'tile-new': newTiles.has(index),
                    'tile-merged': mergedTiles.has(index),
                    'tile-moving': isAnimating && cell !== 0
                }"
                :style="{
                    backgroundColor: tileColors[cell],
                    color: textColors[cell] || '#776e65'
                }"
            >
                <span v-if="cell !== 0" class="tile-value">{{ cell }}</span>
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
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                background-color 0.15s ease,
                color 0.15s ease;
    position: relative;
}

.tile-value {
    display: inline-block;
    transition: transform 0.15s ease;
}

/* 新方块出现动画 */
.tile-new {
    animation: tilePop 0.3s ease-out;
}

@keyframes tilePop {
    0% {
        transform: scale(0);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

/* 合并动画 */
.tile-merged {
    animation: tileMerge 0.3s ease-out;
    z-index: 10;
}

.tile-merged .tile-value {
    animation: tileMergeValue 0.3s ease-out;
}

@keyframes tileMerge {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.15);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes tileMergeValue {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1);
    }
}

/* 移动动画 */
.tile-moving {
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
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
