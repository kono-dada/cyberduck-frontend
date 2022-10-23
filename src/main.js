import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import "nes.css/css/nes.min.css"
import VueRouter from "vue-router"
import Index from './components/Index'

Vue.config.productionTip = false;
Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Index,
        },
        {
            path: '/duck/:id',
            component: Index,
        }
    ]
})

new Vue({
    vuetify,
    render: h => h(App),
    router
}).$mount('#app')
