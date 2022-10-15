<template>
  <h2>This is a duck map</h2>
  <DuckMap style="z-index: -1"/>
</template>

<script>
import DuckMap from './components/DuckMap.vue'

export default {
  name: 'App',
  components: {
    DuckMap
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
