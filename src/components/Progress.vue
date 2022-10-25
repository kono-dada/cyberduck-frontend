<template>
  <div id="collection_progress"
       class="nes-container is-rounded collection-progress"
       :style="{backgroundColor: background}"
       @click="showDuckListTrue()"
  >
    <p>{{ foundCount }}/{{ total }}</p>
  </div>
</template>

<script>
export default {
  name: "Progress",
  props: {
    showDuckListTrue: null,
    duckStates: null,
    ranking: null,
  },
  data() {
    const states = Object.values(this.duckStates);
    return {
      foundCount: states.filter(_ => _.isFound).length,
      total: states.length,
    }
  },
  computed: {
    background() {
      if (this.ranking && this.total === this.foundCount) {
        return '#fef251'
      } else {
        return '#ffffff'
      }
    }
  }
}
</script>

<style scoped>
.collection-progress {
  position: fixed;
  right: 5%;
  top: 85%;
  z-index: 5;
  background: #ffffff;
  text-align: center;
  font-family: Chinese_pixel, serif;
  font-weight: bolder;
  padding: 0.2rem 1.5rem;
}
</style>