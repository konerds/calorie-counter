import { createStore } from 'vuex';

import axios from 'axios';
import VuexORM from '@vuex-orm/core';
import VuexORMAxios from '@vuex-orm/plugin-axios';
import createPersistedState from 'vuex-persistedstate';
import SecureLS from 'secure-ls';

import UserInfo from './models/UserInfo.js';
import Recipe from './models/Recipe.js';
import Ingredient from './models/Ingredient.js';

VuexORM.use(VuexORMAxios, {
  axios,
  baseURL: `${import.meta.env.VITE_FIREBASE_DATABASE_URL}/`
});

const database = new VuexORM.Database();

database.register(UserInfo);
database.register(Recipe);
database.register(Ingredient);

var ls = new SecureLS({ isCompression: true });

const store = createStore({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    VuexORM.install(database, { namespace: 'database' }),
    createPersistedState({
      paths: ['database.userinfo.data'],
      storage: {
        getItem: (key) => {
          try {
            return ls.get(key);
          } catch (err) {
            localStorage.setItem('vuex', '');
            return undefined;
          }
        },
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key)
      }
    })
  ]
});

export default store;
