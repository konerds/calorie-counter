<template>
  <div>
    <a-modal
      :style="{ height: 'calc(100vh - 150px)' }"
      :bodyStyle="{ overflowY: 'scroll' }"
      centered
      closable
      destroyOnClose
      :footer="null"
      :visible="isVisibleUpdate"
      width="70%"
      @cancel="setUpdateRecipe(false)"
      :zIndex="999"
    >
      <template #title>
        <span class="text-font text-title">레시피 수정하기</span>
      </template>
      <update-recipe @cancel="setUpdateRecipe(false)" :recipe-name="nameForUpdate"></update-recipe>
    </a-modal>
    <a-modal
      :style="{ height: 'calc(100vh - 150px)' }"
      :bodyStyle="{ overflowY: 'scroll' }"
      centered
      closable
      destroyOnClose
      :footer="null"
      :visible="isVisibleCreate"
      width="70%"
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
            <ShoppingCartOutlined :style="{ color: '#F47B0F', fontSize: 'xxx-large' }" />
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
    cartListSize() {
      return this.getUser.favoriteRecipe.length;
    }
  },
  methods: {
    showResult(result, keyword) {
      window.scrollTo(0, 0);
      this.hideRecipe();
      this.searchedResult = result;
      this.searchedKeyword = keyword;
    },
    showRecipe(recipeId) {
      window.scrollTo(0, 0);
      this.selectedRecipe = Recipe.find(recipeId);
    },
    hideRecipe() {
      window.scrollTo(0, 0);
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
  display: block;
}

@media (min-width: 1024px) {
  .search-container {
    display: flex;
    width: 100%;
    height: calc(100% - 120px);
    position: absolute;
    top: 120px;
  }
}

.cart-badge {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 10;
  cursor: pointer;
}

.search-filter {
  width: 100%;
}

@media (min-width: 1024px) {
  .search-filter {
    width: 35%;
  }
}

.search-result,
.recipe-detail {
  width: 100%;
}

@media (min-width: 1024px) {
  .search-result,
  .recipe-detail {
    width: 65%;
  }
}

.text-font {
  font-family: 'Nanum Gothic', sans-serif;
}

.text-title {
  font-weight: bold;
  font-size: large;
}

@media (min-width: 1024px) {
  .text-title {
    font-size: xx-large;
  }
}
</style>
