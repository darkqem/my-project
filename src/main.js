import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // Подключаем маршрутизатор
import './assets/styles/main.css'

createApp(App)
  .use(router)  // Применяем маршрутизатор
  .mount('#app');
