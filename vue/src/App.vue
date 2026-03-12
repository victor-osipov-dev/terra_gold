<script setup lang="ts">
import WebApp from '@twa-dev/sdk'

</script>

<template>123
  <button @click="WebApp.sendData(JSON.stringify({ msg: 'Привет, бот!' }))">Click</button>
</template>

<style scoped>

</style>
