<script setup>
import { componentsRoutesReflect } from '../../components/componentsConfig'
import { useRouter } from 'vue-router';

const router = useRouter()

const handleComCardClick = (eleRoute) => {
  router.push(eleRoute)
}

</script>

<template lang="">
  <div class='components_list'>
    <div
      class='component_card'
      v-for='item in componentsRoutesReflect'
      :key='item.eleKey'
      @click='handleComCardClick(item.route)'
    >
       <img :src='item.icon' alt="" />
       <div>{{ item.name }}</div>
     </div>
  </div>

</template>

<style lang="css">
  .components_list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: calc(20 / 32 * 1rem);
    padding: calc(40 / 32 * 1rem) calc(30 / 32 * 1rem);
  }

  .component_card {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: calc(150 / 32 * 1rem);
    border: 1px solid #ccc;
    border-radius: calc(12 / 32 * 1rem);
    box-shadow: 2px 2px 5px #dfdfdf;
  }

  .component_card img {
    width: calc(50 / 32 * 1rem);
    height: calc(50 / 32 * 1rem);
    margin-right: calc(20 / 32 * 1rem);
  }
</style>