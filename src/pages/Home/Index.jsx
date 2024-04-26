import { defineComponent, reactive } from 'vue'
import { TabBar, TabBarItem } from 'tdesign-mobile-vue'
import PageContainer from '../PageContainer/Index.vue'
import './index.css'

const tabList = [
  {
    key: 'home',
    title: '首页',
    to: '/home'
  },
  {
    key: 'components',
    title: '组件列表',
    to: '/components'
  },
  {
    key: 'mine',
    title: '我的',
    to: '/mine'
  }
]

const index = defineComponent({
  setup() {
    const state = reactive({
      currentTab: 'home'
    })

    // 修改tab
    const handleTabChange = (value) => { state.currentTab = value }

    const renderTabBar = () => {
      return (
        <TabBar theme='tag' value={state.currentTab} onChange={handleTabChange}>
          {tabList.map(item => (
            <TabBarItem key={item.key} value={item.key}>{item.title}</TabBarItem>
          ))}
        </TabBar>
      )
    }

    const renderHomePage = () => {
      return (
        <div className="">
          <PageContainer currentTab={state.currentTab}/>
          {renderTabBar()}
        </div>
      )
    }

    return { renderHomePage }
  },

  render() {
    return (
      <div className='home_page'>
        {this.renderHomePage()}
      </div>
    )
  }
})

export default index