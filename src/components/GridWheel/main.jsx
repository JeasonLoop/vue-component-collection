import { defineComponent, reactive, watch, toRef } from 'vue'
import './index.css'
import { showMessage } from '../componentsConfig'
let timer = null
const activeIdxChangeArr = [1, 1, 2, 3, -1, -1, -2, -3] // 顺时针改变奖品下标

// 顺时针下标映射表
const roundEnum = {
  0: 0,
  1: 0,
  2: 0,
  3: 7,
  4: 3,
  5: 6,
  6: 5,
  7: 4,
}
const DEFAULT_ROLL_COUNT = 2 * 8 // 停止后默认转动圈数
const DEFAULT_ROLL_INTERVAL = 20 // 下标切换时间间隔，随着转动次数减少而增加（单位：毫秒）

/**
 * 九宫格抽奖组件
 * @param {Array} prizeList 奖品列表
 * @param {Number} rollCount 停止抽奖转动圈数
 * @param {Number} rollInterval 抽奖间隔时间（毫秒）
 * @param {Function} startDraw 开始抽奖
 * @param {Function} drawStop 停止抽奖
 */
const index = defineComponent({
  emits: ['startDraw', 'drawStop'],
  props: {
    prizeList: {
      type: Array,
      default: () => []
    },
    rollCount: {
      type: Number,
      default: DEFAULT_ROLL_COUNT
    },
    rollInterval: {
      type: Number,
      default: DEFAULT_ROLL_INTERVAL
    },
  },
  setup(props, { expose }) {
    const { prizeList, rollCount, rollInterval } = props

    const gridParams = reactive({
      prizeList: prizeList,
      activeIndex: -1, // 当前抽选中的奖品
      isStart: false, // 是否开始抽奖
      changeCount: 0, // 奖品下标变化用
      chosenIdx: -1,
    })

    const configParams = reactive({
      rollCount: rollCount || DEFAULT_ROLL_COUNT,
      rollInterval: rollInterval || DEFAULT_ROLL_INTERVAL,
      isInitChosen: false, // 是否初始化指定奖品
    })

    // 初始化state状态
    const initGridParams = () => {
      configParams.rollInterval = rollCount ||  DEFAULT_ROLL_INTERVAL
      configParams.rollCount = rollInterval || DEFAULT_ROLL_COUNT
    }

    // 开始抽奖
    const startDraw = () => {
      if (gridParams.isStart) return
      if(rollCount) configParams.rollCount = rollCount
      if(rollInterval) configParams.rollInterval = rollInterval
      setTimeout(() => {
        gridParams.activeIndex = 0
        gridParams.changeCount = 0
        setTimeout(() => {
          gridParams.isStart = true
        }, 0);
      }, 100);
    }

    // 转动主逻辑
    watch([gridParams,props], (newParams, oldParams) => {
      // 配置参数更新
      if(gridParams.isStart) {
        if(newParams[1].rollInterval !== oldParams[1].rollInterval) configParams.rollInterval = newParams[1].rollInterval
        if(newParams[1].rollCount !== oldParams[1].rollCount) configParams.rollCount = newParams[1].rollCount
      }

      if (gridParams.prizeList.length && gridParams.activeIndex >= 0) {
        // 开始抽奖
        if (timer) {
          clearInterval(timer)
        }
        timer = setInterval(() => {
          if (gridParams.changeCount === activeIdxChangeArr.length) gridParams.changeCount = 0
          gridParams.activeIndex += activeIdxChangeArr[gridParams.changeCount]
          gridParams.changeCount++
          if (!gridParams.isStart) {
            if (gridParams.chosenIdx >= 0 && !configParams.isInitChosen) {
              // 找到指定的奖品下标
              let distance = 0 // 停止位置和指定位置的顺时针距离
              const chosenRealIdx = roundEnum[gridParams.chosenIdx] // 找到顺时针顺序的奖品下标
              const stopIdx = roundEnum[gridParams.activeIndex]
              console.log('指定奖品下标', chosenRealIdx, '停止抽奖位置下标', stopIdx);
              if (stopIdx <= chosenRealIdx && stopIdx !== 0) {
                distance = chosenRealIdx - stopIdx + 1 // +1 (+1 防止过了下标0重复计算距离，因为缓动停止1圈起)
              } else {
                distance = (gridParams.prizeList.length - stopIdx) + chosenRealIdx + 1  // (+1 防止过了下标0重复计算距离，因为缓动停止1圈起)
              }

              // 设置转动次数 rollCount默认两圈（2 * 8）
              if (configParams.rollCount % gridParams.prizeList.length === 0) {
                configParams.rollCount = configParams.rollCount + distance
              } else {
                // 转动次数调整
                configParams.rollCount = configParams.rollCount + distance + configParams.rollCount % gridParams.prizeList.length
              }
              console.log('转动次数：', configParams.rollCount);

              // 只执行一次指定奖品设置
              configParams.isInitChosen = true
            }

            // 缓慢停止
            configParams.rollCount--
            configParams.rollInterval += 20
          }
        }, configParams.rollInterval)

        if (configParams.rollCount === 0) {
          console.log('结束');
          clearInterval(timer)
          initGridParams()
          showMessage({
            theme: 'success',
            content: `恭喜您获得${gridParams.prizeList[gridParams.activeIndex]}`,
            contextDom: document.querySelector('.btn_groups')
          });
        }
      }
    }, { deep: true })

    // 停止抽奖
    const drawStop = (chosenIdx) => {
      if (chosenIdx >= 0 && chosenIdx < 8) {
        gridParams.chosenIdx = chosenIdx
      }
      gridParams.isStart = false
    }

    // 抽奖开始与停止函数暴露
    expose({
      startDraw,
      drawStop
    })

    // 渲染九宫格
    const renderGrid = () => {
      const { prizeList, activeIndex } = gridParams
      const activeClassName = (idx) => activeIndex === idx ? 'active' : ''
      return (
        <div className="grid_box">
          <div className='grid_container'>
            {
              !!prizeList?.length ? prizeList.map((item, idx) => {
                if (idx === 4) {
                  return (
                    <>
                      <div className={`grid_item draw_btn`} onClick={startDraw}>抽奖</div>
                      <div className={`grid_item ${activeClassName(idx)}`}>{item}</div>
                    </>
                  )
                }
                return <div className={`grid_item ${activeClassName(idx)}`}>{item}</div>
              }) : null
            }
          </div>
        </div>
      )
    }

    return { configParams, gridParams, renderGrid, startDraw, drawStop }
  },

  render() {
    return (
      <div className='grid_body'>
        {this.renderGrid()}
      </div>
    )
  }
})

export default index