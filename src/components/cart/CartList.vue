<template>
  <div class="cart-container">
    <div class="recipe-element">
      <span class="text-font text-title">내가 담은 레시피 정보</span>
      <template v-if="favoriteRecipe && favoriteRecipe.length > 0">
        <div class="cart-item-container">
          <div class="cart-item-element" v-for="recipe in favoriteRecipe" :key="recipe">
            <cart-element
              class="cart-element-container"
              type="cart-list"
              :result="recipe"
            ></cart-element>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="cart-no-data-container">
          <a-empty :image="simpleImage" />
        </div>
      </template>
    </div>
    <div class="recipe-element">
      <span class="text-font text-title">총 필요한 재료</span>
      <a-card class="total-needed-ingredients-container">
        <a-list
          :grid="{ gutter: 16, xs: 1, sm: 2, lg: 3, xl: 4, xxl: 5 }"
          :data-source="totalNeedIngredients"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-input
                type="text"
                placeholder="(g/mL)"
                style="text-align: right"
                :defaultValue="item.unit"
                :value="item.unit"
                disabled
              >
                <template #addonBefore>{{ item.name }}</template>
                <template #addonAfter> (g/mL) </template>
              </a-input>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import Recipe from '../../store/models/Recipe.js';
import CartElement from './CartElement.vue';
import { Empty } from 'ant-design-vue';
export default {
  components: {
    CartElement
  },
  props: ['favorite-recipe-index'],
  data() {
    return {
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE
    };
  },
  computed: {
    favoriteRecipe() {
      return Recipe.findIn(Array.from(this.favoriteRecipeIndex));
    },
    totalNeedIngredients() {
      let ingredientsFavoriteRecipe = [];
      for (let rawIndex in this.favoriteRecipe) {
        console.log(rawIndex);
        for (let index in this.favoriteRecipe[rawIndex].ingredients) {
          if (this.favoriteRecipe[rawIndex].ingredients[index].name.length !== 0) {
            ingredientsFavoriteRecipe.push({
              name: this.favoriteRecipe[rawIndex].ingredients[index].name,
              unit: +this.favoriteRecipe[rawIndex].ingredients[index].unit.replace(/[^0-9]/g, '')
            });
          }
        }
      }
      const totalArray = _.chain(ingredientsFavoriteRecipe)
        .groupBy('name')
        .map((objects, name) => {
          console.log(objects);
          return {
            name: name,
            unit: _.sumBy(objects, 'unit')
          };
        })
        .value();
      console.log(totalArray);
      return totalArray;
    }
  }
};
</script>

<style scoped>
.cart-container {
  display: block;
  width: 100%;
  height: fit-content;
  position: absolute;
}

.recipe-element {
  width: 100%;
}

.cart-item-container {
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-no-data-container {
  width: 90%;
  height: 214px;
  border: 1px solid #f0f0f0;
  margin-top: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cart-item-element {
  width: 100%;
}

.cart-element-container {
  display: block;
  margin-top: 16px;
  margin-bottom: 16px;
}

.text-font {
  font-family: 'Nanum Gothic', sans-serif;
}

.text-title {
  font-weight: 600;
  font-size: large;
}

@media (min-width: 1024px) {
  .text-title {
    font-size: xx-large;
  }
}

.total-needed-ingredients-container {
  width: 90%;
  margin-top: 16px;
  margin-bottom: 16px;
}
</style>
