import { createApp } from "vue";

import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

import firebase from "firebase/app";

import router from "./router.js";
import store from "./store/index.js";

import App from "./App.vue";

firebase.initializeApp({
  apiKey: "AIzaSyAZFXCPHgDjeIt8ccir1ez8X4_RQBxicRM",
  authDomain: "vue-http-demo-2a476.firebaseapp.com",
  databaseURL: "https://vue-http-demo-2a476-default-rtdb.firebaseio.com",
  projectId: "vue-http-demo-2a476",
  storageBucket: "vue-http-demo-2a476.appspot.com",
  messagingSenderId: "576152667157",
  appId: "1:576152667157:web:365e0b1b222c0505f97a1c",
  measurementId: "G-91WE96PBQD",
});

const app = createApp(App);

app.use(Antd);

app.use(router);
app.use(store);

app.mount("#app");
