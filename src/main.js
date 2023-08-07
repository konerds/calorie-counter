import { createApp } from 'vue';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

import firebase from 'firebase/app';

import router from './router.js';
import store from './store/index.js';

import App from './App.vue';

firebase.initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
});

const app = createApp(App);

app.use(Antd);

app.use(router);
app.use(store);

app.mount('#app');
