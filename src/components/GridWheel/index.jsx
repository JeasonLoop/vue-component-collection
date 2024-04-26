import { defineComponent, reactive, watch } from 'vue'
import './index.css'

let timer = null
const activeIdxChangeArr = [1, 1, 2, 3, -1, -1, -2, -3] // 顺时针改变奖品下标
const index = defineComponent({
  setup() {
    const state = reactive({
      prizeList: new Array(8).fill().map((_, idx) => idx),
      activeIndex: 0, // 当前抽选中的奖品
      isStart: false, // 是否开始抽奖
      rollCount: 50, // 转动次数（单位：秒）
      changeCount: 0, // 奖品下标变化用
      rollInterval: 20, // 下标切换时间间隔，随着转动次数减少而增加（单位：毫秒）
    })

    // 初始化state状态
    const initState = () => {
      state.isStart = false
      state.rollCount = 50,
        state.rollInterval = 20
      state.changeCount = 0
    }


    const handleDraw = () => {
      state.activeIndex = 0
      state.isStart = true
    }

    watch(state, (newState) => {
      if (newState.isStart && newState.prizeList.length) {
        // 开始抽奖
        if (timer) {
          clearInterval(timer)
        }
        timer = setInterval(() => {
          if (state.changeCount === activeIdxChangeArr.length) state.changeCount = 0
          state.activeIndex += activeIdxChangeArr[state.changeCount]
          state.changeCount++
          state.rollCount--
          state.rollInterval += 2
          if (state.rollCount === 0) {
            clearInterval(timer)
            initState()
          }
        }, state.rollInterval)
      }
    })

    // 渲染九宫格
    const renderGrid = () => {
      const { prizeList, activeIndex } = state
      const activeClassName = (idx) => activeIndex === idx ? 'active' : ''
      return (
        <div className='grid_container'>
          {
            prizeList.map((item, idx) => {
              if (idx === 4) {
                return (
                  <>
                    <div className={`grid_item draw_btn`} onClick={handleDraw}>抽奖</div>
                    <div className={`grid_item draw_btn ${activeClassName(idx)}`} style={{ background: '#ccc' }}>{item}</div>
                  </>
                )
              }
              return <div className={`grid_item draw_btn ${activeClassName(idx)}`} style={{ background: '#ccc' }}>{item}</div>
            })
          }
        </div>
      )
    }

    return { state, renderGrid }
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