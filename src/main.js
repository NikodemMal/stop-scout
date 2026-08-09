import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { delayColor } from './directives/delayColor'

import App from './App.vue'
import router from './router'

import './style.css'

import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

createApp(App)
.use(createPinia())
.use(router)
.directive('delay-color', delayColor)
.mount('#app')
