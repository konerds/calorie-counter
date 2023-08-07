<template>
  <a-layout id="app" :style="{ backgroundImage: '/assets/background.jpg' }">
    <a-modal
      centered
      :closable="false"
      :footer="null"
      :visible="isFetchingRecipes || isFetchingIngredients || isFetchingUser"
    >
      <template #title>
        <div class="loading-modal-title">데이터를 준비하고 있습니다!</div>
      </template>
      <a-spin class="loading-modal-spin" tip="Loading..." />
    </a-modal>
    <page-error :error="error" @init-error="initError"></page-error>
    <a-layout-header>
      <the-header @show-create="showCreate()" @show-admin="showAdmin"></the-header>
    </a-layout-header>
    <a-layout-content>
      <router-view v-slot="slotProps">
        <transition name="route" mode="out-in">
          <component
            :is="slotProps.Component"
            class="component-container"
            ref="componentRef"
            @show-error="showError"
          ></component>
        </transition>
      </router-view>
    </a-layout-content>
  </a-layout>
</template>

<script>
import { ref } from 'vue';
import Recipe from './store/models/Recipe.js';
import Ingredient from './store/models/Ingredient.js';
import TheHeader from './components/layout/TheHeader.vue';
import PageError from './components/ui/PageError.vue';
export default {
  name: 'My-Fridge-Planner',
  components: { TheHeader, PageError },
  data() {
    return {
      error: ref(null),
      componentRef: ref()
    };
  },
  created() {
    this.fetchRecipes();
    this.fetchIngredients();
  },
  computed: {
    isFetchingRecipes() {
      return this.$store.state.database.recipes.fetching;
    },
    isFetchingIngredients() {
      return this.$store.state.database.ingredients.fetching;
    },
    isFetchingUser() {
      return this.$store.state.database.userinfo.fetching;
    }
  },
  methods: {
    async fetchRecipes() {
      Recipe.commit((state) => {
        state.fetching = true;
      });
      const fetchResult = await Recipe.api().fetch();
      if (fetchResult.response.data.error) {
        this.error = '레시피 정보를 불러올 수 없습니다!';
      }
      Recipe.commit((state) => {
        state.fetching = false;
      });
    },
    async fetchIngredients() {
      Ingredient.commit((state) => {
        state.fetching = true;
      });
      const fetchResult = await Ingredient.api().fetch();
      if (fetchResult.response.data.error) {
        this.error = '재료 정보를 불러올 수 없습니다!';
      }
      Ingredient.commit((state) => {
        state.fetching = false;
      });
    },
    showError(error) {
      this.error = error;
    },
    initError() {
      this.error = null;
    },
    showCreate() {
      this.$refs.componentRef.setCreateRecipe(true);
    },
    showAdmin(isShow) {
      this.$refs.componentRef.setAdminPage(isShow);
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR&family=Playfair+Display+SC&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic&display=swap');

#app {
  text-align: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
}

#app > * {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Nanum Gothic', sans-serif;
}

#app .ant-layout-header {
  background: white;
  z-index: 2;
  width: 100%;
  height: 12.5%;
  padding: 0;
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 15%);
}

@media (min-width: 1024px) {
  #app .ant-layout-header {
    position: fixed;
  }
}

#app .ant-layout-content {
  background: transparent;
  color: black;
}

.loading-modal-title {
  font-size: larger;
  font-family: 'Jua', sans-serif;
}

.loading-modal-spin {
  width: 100%;
  font-family: 'Playfair Display SC', serif;
  font-size: medium;
  text-align: center;
}

.component-container {
  height: 100%;
}

#app > .ant-layout {
  background: transparent;
}

#app > .ant-layout:last-child {
  margin: 0;
}

.ant-modal-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ant-modal-content {
  width: 90%;
  margin: auto;
}

.ant-input[disabled] {
  background-color: white;
  color: black;
}
</style>
