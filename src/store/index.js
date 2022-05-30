import { createStore } from "vuex";

import axios from "axios";
import VuexORM from "@vuex-orm/core";
import VuexORMAxios from "@vuex-orm/plugin-axios";

import UserInfo from "./models/UserInfo.js";
import Ingredient from "./models/Ingredient.js";
import Recipe from "./models/Recipe.js";

VuexORM.use(VuexORMAxios, {
  axios,
  baseURL: "https://vue-http-demo-2a476-default-rtdb.firebaseio.com/",
});

const database = new VuexORM.Database();

database.register(UserInfo);
database.register(Ingredient);
database.register(Recipe);

const store = createStore({
  plugins: [VuexORM.install(database, { namespace: "database" })],
  strict: process.env.NODE_ENV !== "production",
});

export default store;
