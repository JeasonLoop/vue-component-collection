
<script setup>
  import WelcomePage from '../WelcomePgae/Index.vue'
  import ComponentsList from '../ComponentsList/Index.vue'
  import Mine from '../Mine/Index.vue'
  const { currentTab } = defineProps({
    currentTab: {
      type: String,
      default: 'home'
    }
  })

</script>

<template>
  <div class="page_container" @click="myLog">
    <div class="page_box" v-if="currentTab === 'home'">
      <WelcomePage />
    </div>
    <div class="page_box" v-if="currentTab === 'components'">
      <ComponentsList />
    </div>
    <div class="page_box" v-if="currentTab === 'mine'">
      <Mine />
    </div>
  </div>
</template>

<style>
  .page_container {
    width: 100%;
    height: 100%;
    background-color: #fff;
  }

  .page_box {
    width: 100%;
    height: 100%;
  }
</style>