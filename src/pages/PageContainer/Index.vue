
<script setup>
  import WelcomePage from '../WelcomePgae/Index.vue'
  const { currentTab } = defineProps({
    currentTab: {
      type: String,
      default: 'home'
    }
  })


</script>

<template>
  <div class="page_container" @click="myLog">
    <div class="" v-if="currentTab === 'home'">
      <WelcomePage />
    </div>
  </div>
</template>

<style>
  .page_container {
    width: 100%;
    height: 100%;
    background-color: #fff;
  }
</style>