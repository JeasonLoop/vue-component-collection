<script setup>
import { Icon } from 'tdesign-icons-vue-next';
</script>

<template lang="">
  <div class='welcome_page'>
    <div class='icon_container'>
      <icon name="bad-laugh" />
      <icon name="roast" />
      <icon name="dissatisfaction" />
      <icon name="serenity" />
      <icon name="surprised" />
    </div>
    <div class='typed_out'>欢迎使用,组件收集站</div>
  </div>
</template>

<style>
  .welcome_page {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    flex-direction: column;
  }

  .icon_container {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 36px;
    width: 100%;
    margin: calc(40 / 32 * 1rem);
    gap:calc(20 / 32 * 1rem);
  }


  .typed_out{
    overflow: hidden;
    font-size: calc(32 / 32 * 1rem);
    font-weight: 600;
    border-right: .15em solid transparent;
    animation: typing 1s steps(20, end) forwards,  blink .9s infinite;;
    border-right: .15em solid blue;
    white-space: nowrap;
    width: 0;
    animation: typing 1s steps(20, end) forwards,  blink .9s infinite;;
  }

  @keyframes typing {
    from { width: 0 }
    to { width: calc(305 / 32 * 1rem) }
  }

  @keyframes blink {
    from { border-color: transparent }
    to { border-color: blue; }
  }

</style>
