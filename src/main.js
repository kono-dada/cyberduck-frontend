import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import "nes.css/css/nes.min.css"

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
