import { defineComponent, reactive, watch } from 'vue'
import './index.css'
import { Input, Message, Button } from 'tdesign-mobile-vue'

let timer = null
const activeIdxChangeArr = [1, 1, 2, 3, -1, -1, -2, -3] // 顺时针改变奖品下标
const mockPrizeList = ['笔记本', '电视', '冰箱', '三轮车', '手机', '小米汽车', '水果', '1积分']
const index = defineComponent({
  setup() {
    const state = reactive({
      prizeList: mockPrizeList,
      activeIndex: 0, // 当前抽选中的奖品
      isStart: false, // 是否开始抽奖
      rollCount: 50, // 转动次数（单位：秒）
      changeCount: 0, // 奖品下标变化用
      rollInterval: 20, // 下标切换时间间隔，随着转动次数减少而增加（单位：毫秒）
      changeState: {}
    })

    // 初始化state状态
    const initState = () => {
      state.isStart = false
      state.rollInterval = 20
      state.changeCount = 0
      state.rollCount = 50
    }

    // 开始抽奖
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

    const showMessage = (theme, content = '这是一条普通通知信息', duration = 5000) => {
      if (Message[theme]) {
        Message[theme]({
          offset: [10, 16],
          content,
          duration,
          icon: true,
          zIndex: 20000,
          context: document.querySelector('.btn_groups'),
        });
      }
    };

    // 配置确认
    const handleConfigChange = (val, type) => {
      state[type] = val;
    }

    // 恢复默认状态
    const handleInit = () => {
      showMessage('success', '恢复默认状态');
      initState()
    }

    const handleConfigConfirm = () => {
      showMessage('success', '配置成功! 开始抽奖');
      handleDraw()
    }

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

    // 九宫格配置项
    const renderGridConfig = () => {
      return (
        <div className="config_list">
          <div className="tips">注：转动次数默认值50，切换间隔默认20ms</div>
          <Input label="转动次数" type='number' placeholder="请输入转动次数" onChange={(val) => handleConfigChange(val, 'rollCount')} />
          <Input label="切换间隔" type='number' placeholder="请输入切换间隔" onChange={(val) => handleConfigChange(val, 'rollInterval')} />
          <div className="btn_groups" id='.confim'>
            <Button theme='primary' variant="outline" onClick={handleConfigConfirm}>配置确认</Button>
            <Button theme='primary' variant="outline" onClick={handleInit}>恢复默认状态</Button>
          </div>
        </div>
      )
    }

    return { state, renderGrid, renderGridConfig }
  },

  render() {
    return (
      <div className='grid_body'>
        {this.renderGridConfig()}
        {this.renderGrid()}
      </div>
    )
  }
})

export default index