import { defineComponent, reactive } from 'vue'
import { TabBar, TabBarItem } from 'tdesign-mobile-vue'
import PageContainer from '../PageContainer/Index.vue'
import './index.css'

const tabList = [
  {
    key: 'home',
    title: '首页',
  },
  {
    key: 'components',
    title: '组件列表',
  },
  {
    key: 'mine',
    title: '我的',
  }
]

const index = defineComponent({
  setup() {
    const sessionCurTab = sessionStorage.getItem('currentTab')
    const state = reactive({
      currentTab: sessionCurTab || 'home'
    })

    // 修改tab
    const handleTabChange = (value) => {
      state.currentTab = value
      sessionStorage.setItem('currentTab', value)
     }

    // tabbar渲染
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
        <>
          <PageContainer currentTab={state.currentTab}/>
          {renderTabBar()}
        </>
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