<script setup>
import Home from './pages/Home/Index'
import { useRouter } from 'vue-router'
const router = useRouter();

</script>

<template>
  <!-- 路由渲染的内容 -->
  <router-view></router-view>
  <div class="home" v-if="router.currentRoute.value.path === '/'">
    <Home />
  </div>
</template>

<style scoped>
  .home {
    width:100%;
    height:100%;
  }
</style>