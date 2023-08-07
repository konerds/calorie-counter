<template>
  <div>
    <a-modal
      centered
      closable
      destroyOnClose
      :footer="null"
      :visible="isVisibleUpdate"
      width="60%"
      @cancel="setUpdateRecipe(false)"
      :zIndex="999"
    >
      <template #title>
        <span class="text-font text-title">레시피 수정하기</span>
      </template>
      <update-recipe @cancel="setUpdateRecipe(false)" :recipe-name="nameForUpdate"></update-recipe>
    </a-modal>
    <a-modal
      centered
      closable
      destroyOnClose
      :footer="null"
      :visible="isVisibleCreate"
      width="60%"
      @cancel="setCreateRecipe(false)"
      :zIndex="999"
    >
      <template #title>
        <span class="text-font text-title">나만의 레시피 만들기</span>
      </template>
      <create-recipe @cancel="setCreateRecipe(false)"></create-recipe>
    </a-modal>
    <a-drawer
      width="90%"
      :visible="isVisibleCart"
      :closable="true"
      @close="toggleCartList"
      :zIndex="999"
    >
      <template #title>
        <span class="text-font text-title">레시피 장바구니</span>
      </template>
      <cart-list :favorite-recipe-index="getUser.favoriteRecipe"></cart-list>
    </a-drawer>
    <a-drawer
      title="관리자 페이지"
      width="90%"
      :visible="isVisibleAdmin"
      :closable="true"
      @close="setAdminPage(false)"
      :zIndex="999"
      ><admin-control></admin-control>
    </a-drawer>
    <div class="search-container">
      <div v-if="isLoggedIn && getUser.type === 0" class="cart-badge" @click="toggleCartList">
        <a-badge :count="cartListSize">
          <div>
            <ShoppingCartOutlined :style="{ color: '#F47B0F', fontSize: '4vw' }" />
          </div>
        </a-badge>
      </div>
      <search-filter class="search-filter" @show-result="showResult"></search-filter>
      <search-result
        class="search-result"
        v-if="selectedRecipe === null"
        :searched-result="searchedResult"
        :keyword="searchedKeyword"
        @show-detail="showRecipe"
        @update-recipe="updateRecipe"
      ></search-result>
      <recipe-detail
        class="recipe-detail"
        v-else
        :recipe="selectedRecipe"
        @hide-recipe="hideRecipe"
      ></recipe-detail>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { ShoppingCartOutlined } from '@ant-design/icons-vue';
import UserInfo from '../../store/models/UserInfo.js';
import Recipe from '../../store/models/Recipe.js';
import Ingredient from '../../store/models/Ingredient.js';
import CartList from '../../components/cart/CartList.vue';
import SearchFilter from '../../components/recipe/SearchFilter.vue';
import SearchResult from '../../components/recipe/SearchResult.vue';
import RecipeDetail from '../../components/recipe/RecipeDetail.vue';
import CreateRecipe from '../../components/recipe/CreateRecipe.vue';
import UpdateRecipe from '../../components/recipe/UpdateRecipe.vue';
import AdminControl from '../../components/admin/AdminControl.vue';
export default {
  components: {
    CartList,
    SearchFilter,
    SearchResult,
    RecipeDetail,
    ShoppingCartOutlined,
    CreateRecipe,
    UpdateRecipe,
    AdminControl
  },
  data() {
    return {
      searchedResult: ref([]),
      searchedKeyword: ref(''),
      selectedRecipe: ref(null),
      isVisibleCart: ref(false),
      isVisibleCreate: ref(false),
      isVisibleUpdate: ref(false),
      isVisibleAdmin: ref(false),
      nameForUpdate: ref('')
    };
  },
  computed: {
    getUser() {
      if (UserInfo.all().length === 0) {
        return {
          userId: null,
          nickname: null,
          token: null,
          favoriteRecipe: []
        };
      } else {
        return UserInfo.all()[0];
      }
    },
    isLoggedIn() {
      return !!this.getUser.token;
    },
    ingredients() {
      return Ingredient.query().orderBy('name', 'asc').get();
    },
    recipes() {
      return Recipe.query().orderBy('name', 'asc').get();
    },
    cartListSize() {
      return this.getUser.favoriteRecipe.length;
    }
  },
  methods: {
    showResult(result, keyword) {
      this.hideRecipe();
      this.searchedResult = result;
      this.searchedKeyword = keyword;
    },
    showRecipe(recipeId) {
      this.selectedRecipe = Recipe.find(recipeId);
    },
    hideRecipe() {
      this.selectedRecipe = null;
    },
    toggleCartList() {
      this.isVisibleCart = !this.isVisibleCart;
    },
    onCancel() {
      this.isVisibleCreate = false;
    },
    setCreateRecipe(isShow) {
      this.isVisibleCreate = isShow;
    },
    setUpdateRecipe(isShow) {
      this.isVisibleUpdate = isShow;
    },
    setAdminPage(isShow) {
      this.isVisibleAdmin = isShow;
    },
    updateRecipe(recipeName) {
      this.nameForUpdate = recipeName;
      if (this.nameForUpdate.length > 0) {
        this.setUpdateRecipe(true);
      }
    }
  }
};
</script>

<style scoped>
.search-container {
  display: flex;
  width: 100%;
  height: 87.5%;
  position: absolute;
  top: 12.5%;
}

.cart-badge {
  position: fixed;
  top: 16%;
  left: 94%;
  z-index: 1;
}

.search-filter {
  width: 35%;
}

.search-result,
.recipe-detail {
  width: 65%;
}

.text-font {
  font-family: 'Nanum Gothic', sans-serif;
}

.text-title {
  font-size: 1.2vw;
}
</style>
