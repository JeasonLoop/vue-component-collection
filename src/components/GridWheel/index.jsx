import { defineComponent, reactive, ref } from 'vue'
import './index.css'
import { Input, Button, Cell, Popup, Picker } from 'tdesign-mobile-vue'
import GridWheel from './component'
import { showMessage } from '../componentsConfig'

const mockPrizeList = ['笔记本', '电视', '冰箱', '三轮车', '手机', '小米汽车', '水果', '1积分']
const defaultState = {
  changeState: {},
  pickerShow: false,
  chosenPrize: [],
  isInitChosen: false
}

const index = defineComponent({
  setup() {
    const configParams = reactive({
      chosenPrize: [],
      changeState: {},
      pickerShow: false,
      isInitChosen: false,
      isValid: true,
      rollCount: 16,
      rollInterval: 20
    })
    const gridWheelRef = ref(null)


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
        const newVal = val ? val * mockPrizeList.length : 0
        configParams[type] = newVal
      } else {
        configParams[type] = val
      }
      configParams.isValid = true
    }

    // 停止抽奖
    const handleStop = () => {
      const idx = mockPrizeList.findIndex((item) => item === configParams.chosenPrize[0])
      gridWheelRef._value.drawStop(idx) // 指定下标
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

      gridWheelRef._value.startDraw()
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
          <Input label="转动圈数" placeholder="请输入转动圈数" onChange={(val) => handleConfigChange(Number(val), 'rollCount')} />
          <Input label="切换间隔" placeholder="请输入切换间隔" onChange={(val) => handleConfigChange(Number(val), 'rollInterval')} />
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

    return { configParams, renderGridConfig, gridWheelRef, handleStop }
  },

  render() {
    return (
      <div className='grid_body'>
        {this.renderGridConfig()}
        <GridWheel
          ref='gridWheelRef'
          prizeList={mockPrizeList}
          // chosenPrize={this.configParams.chosenPrize}
          rollCount={this.configParams.rollCount}
          rollInterval={this.configParams.rollInterval}
        />
          <Button theme='primary' variant="outline" onClick={() =>this.handleStop()}>停止抽奖</Button>
      </div>
    )
  }
})

export default index