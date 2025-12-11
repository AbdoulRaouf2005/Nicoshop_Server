import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.css'

import { createApp } from 'vue'
import App from './App.vue'
import Routes from './Router/Routes'
import { createPinia } from 'pinia'


const pinia = createPinia()
const app = createApp(App)
app.use(Routes)
app.use(pinia)
app.mount('#app')

