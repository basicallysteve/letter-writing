import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import buefy from "buefy";
import 'buefy/dist/buefy.css'
const fb = require('./firebaseConfig.js')

Vue.config.productionTip = false
Vue.use(buefy);

fb.auth.onAuthStateChanged(user => {
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
})