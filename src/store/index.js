import { createStore } from 'vuex';

import axios from 'axios';
import VuexORM from '@vuex-orm/core';
import VuexORMAxios from '@vuex-orm/plugin-axios';
import VuexPersistence from 'vuex-persist';

import UserInfo from './models/UserInfo.js';
import Ingredient from './models/Ingredient.js';
import Recipe from './models/Recipe.js';

VuexORM.use(VuexORMAxios, {
  axios,
  baseURL: `${import.meta.env.VITE_FIREBASE_DATABASE_URL}/`
});

const database = new VuexORM.Database();

database.register(UserInfo);
database.register(Ingredient);
database.register(Recipe);

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
});

const store = createStore({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [vuexLocal.plugin, VuexORM.install(database, { namespace: 'database' })]
});

export default store;
