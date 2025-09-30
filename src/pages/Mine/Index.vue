<script setup>
import avatar from '../../assets/avatar.jpg';
import github from '../../assets/github.png';

const jumpGithub = () => {
    window.open('https://github.com/JeasonLoop/vue-component-collection');
};
</script>

<template lang="">
    <div class="user_info">
        <t-avatar
            class="avatar"
            :image="avatar"
            size="large"
            style="--td-avatar-large-width: 100px"
        />
        <div class="username">JeasonLoop</div>
        <img class="github-icon" :src="github" alt="" @click="jumpGithub" />
    </div>
</template>

<style lang="css" scoped>
.github-icon {
    width: calc(50 / 32 * 1rem);
    cursor: pointer;
}
.user_info {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.username {
    margin: calc(30 / 32 * 1rem) 0;
    color: #333;
    font-size: calc(33 / 32 * 1rem);
    font-weight: 600;
}
</style>
