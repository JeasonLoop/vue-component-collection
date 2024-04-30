import { defineComponent, reactive, watch } from 'vue'
import './index.css'
import { Input, Button, Cell, Popup, Picker } from 'tdesign-mobile-vue'
import { showMessage } from '../componentsConfig'
let timer = null
const activeIdxChangeArr = [1, 1, 2, 3, -1, -1, -2, -3] // 顺时针改变奖品下标
const mockPrizeList = ['笔记本', '电视', '冰箱', '三轮车', '手机', '小米汽车', '水果', '1积分']

const defaultState = {
  changeState: {},
  pickerShow: false,
  chosenPrize: [],
  isInitChosen: false
}

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

const DEFAULT_ROLL_COUNT = 2 * mockPrizeList.length // 停止后默认转动圈数
const DEFAULT_ROLL_INTERVAL = 20 // 下标切换时间间隔，随着转动次数减少而增加（单位：毫秒）

const index = defineComponent({
  setup() {
    const gridParams = reactive({
      prizeList: mockPrizeList,
      activeIndex: -1, // 当前抽选中的奖品
      isStart: false, // 是否开始抽奖
      changeCount: 0, // 奖品下标变化用
    })

    const configParams = reactive({
      rollCount: DEFAULT_ROLL_COUNT,
      rollInterval: DEFAULT_ROLL_INTERVAL,
      chosenPrize: [],
      changeState: {},
      pickerShow: false,
      isInitChosen: false,
      isValid: true
    })

    // 初始化state状态
    const initGridParams = () => {
      configParams.rollInterval = DEFAULT_ROLL_INTERVAL
      configParams.rollCount = DEFAULT_ROLL_COUNT
    }

    // 开始抽奖
    const handleDraw = () => {
      if (gridParams.isStart) return
      gridParams.activeIndex = 0
      gridParams.changeCount = 0
      configParams.isInitChosen = false
      setTimeout(() => {
        gridParams.isStart = true
      }, 0);
    }

    // 转动主逻辑
    watch(gridParams, () => {
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
            if (configParams.chosenPrize?.length && !configParams.isInitChosen) {
              // 找到指定的奖品下标
              let distance = 0 // 停止位置和指定位置的顺时针距离
              const chosenIdx = roundEnum[gridParams.prizeList.findIndex(item => item === configParams.chosenPrize[0])] // 找到顺时针顺序的奖品下标
              const stopIdx = roundEnum[gridParams.activeIndex]
              console.log('指定奖品下标', chosenIdx, '停止抽奖位置下标', stopIdx);
              if (stopIdx <= chosenIdx) {
                distance = chosenIdx - stopIdx + 1 // +1 (+1 防止过了下标0重复计算距离，因为缓动停止1圈起)
              } else {
                distance = (gridParams.prizeList.length - stopIdx) + chosenIdx + 1  // (+1 防止过了下标0重复计算距离，因为缓动停止1圈起)
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
            theme:'success',
            content: `恭喜您获得${gridParams.prizeList[gridParams.activeIndex]}`,
            contextDom: document.querySelector('.btn_groups')
          });
        }
      }

    })

    // 配置修改
    const handleConfigChange = (val, type) => {
      if(val < 0 && type !== 'chosenPrize') {
        showMessage({
          theme:'warning',
          content: `请输入大于等于0的数值`,
        });
        configParams.isValid = false
        return
      }
      if (type === 'rollCount') {
        const newVal = val * gridParams.prizeList.length
        configParams[type] = newVal
      } else {
        configParams[type] = val
      }
      configParams.isValid = true
    }

    // 恢复默认状态
    const handleInit = () => {
      showMessage({
        theme:'success',
        content: '恢复默认状态',
      });
      Object.keys(defaultState).forEach((stateKey) => {
        configParams[stateKey] = defaultState[stateKey]
      })
      initGridParams()
      gridParams.activeIndex = -1
    }

    // 配置确认
    const handleConfigConfirm = () => {
      if(!configParams.isValid){
        showMessage({
          theme:'warning',
          content: `有不合法的配置项`,
        });
        return
      }
      showMessage({
        theme:'success',
        content: `配置成功! 开始抽奖`,
      });
      handleDraw()
    }

    // 停止抽奖
    const handleDrawStop = () => {
      gridParams.isStart = false
    }

    // 控制picker的显示隐藏
    const handlePickerVisible = (visible) => {
      configParams.pickerShow = visible
    }

    // 指定奖品变更
    const handlePickerConfirm = (val) => {
      if(val.length){
        configParams.chosenPrize = val
      }
      handlePickerVisible(false)
    }

    // 渲染九宫格
    const renderGrid = () => {
      const { prizeList, activeIndex } = gridParams
      const activeClassName = (idx) => activeIndex === idx ? 'active' : ''
      return (
        <div className="grid_box">
          <div className='grid_container'>
            {
              prizeList.map((item, idx) => {
                if (idx === 4) {
                  return (
                    <>
                      <div className={`grid_item draw_btn`} onClick={handleDraw}>抽奖</div>
                      <div className={`grid_item ${activeClassName(idx)}`}>{item}</div>
                    </>
                  )
                }
                return <div className={`grid_item ${activeClassName(idx)}`}>{item}</div>
              })
            }
          </div>
          <Button theme='primary' variant="outline" onClick={handleDrawStop}>停止抽奖</Button>
        </div>
      )
    }

    // 九宫格配置项
    const renderGridConfig = () => {
      const columns = mockPrizeList.map((item) => {
        return {
          label: item,
          value: item
        }
      })
      const { chosenPrize, pickerShow } = configParams
      return (
        <div className="config_list">
          <div className="tips">注：转动圈数默认值2（停止抽奖后转两圈到指定位置）,切换间隔默认20ms,停止后间隔递增</div>
          <Input label="转动圈数" placeholder="请输入转动圈数" onChange={(val) => handleConfigChange(val, 'rollCount')} />
          <Input label="切换间隔" placeholder="请输入切换间隔" onChange={(val) => handleConfigChange(val, 'rollInterval')} />
          <Cell
            arrow
            title='指定奖品'
            style={{ width: 'calc(550 / 32 * 1rem)' }}
            onClick={() => handlePickerVisible(true)}
            note={chosenPrize.length ? chosenPrize[0] : '请选择奖品(默认随机)'}
          />
          <div className="btn_groups" id='.confim'>
            <Button
              theme='primary'
              variant="outline"
              onClick={handleConfigConfirm}
              style={{ marginRight: 'calc(35 / 32 * 1rem)' }}
            >
              配置确认
            </Button>
            <Button
              theme='primary'
              variant="outline"
              onClick={handleInit}
            >
              恢复默认状态
            </Button>
          </div>
          <Popup visible={pickerShow} placement='bottom'>
            <Picker
              value={chosenPrize}
              onConfirm={handlePickerConfirm}
              columns={[columns]}
              onCancel={() => handlePickerVisible(false)}
            />
          </Popup>
        </div>
      )
    }

    return { configParams, gridParams, renderGrid, renderGridConfig }
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