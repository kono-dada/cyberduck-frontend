<template>
  <v-app id="index">
    <index style="overflow: hidden"/>
  </v-app>
</template>

<script>
import Index from './components/Index'

export default {
  name: 'App',

  components: {
    Index,
  },

  data: () => ({
    //
  }),
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
