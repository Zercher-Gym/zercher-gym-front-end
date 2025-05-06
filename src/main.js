// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// import './assets/main.css'; // if you have any global styles

const app = createApp(App);
app.use(router);
app.mount('#app');
