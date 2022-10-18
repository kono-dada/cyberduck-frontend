<template>
  <v-app id="index">
    <router-view></router-view>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
  },

  data: () => ({
    //
  }),
  mounted() {
    console.log(this.$route.params)
  }
};
</script>

<style>
#index {
  position: fixed;
  left: 0;
  top: 0;
  background: rgb(0, 0, 0);
  transform-origin: 0 0 0;
}
</style>
