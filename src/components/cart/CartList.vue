<template>
  <div class="cart-container">
    <a-card class="left-info">
      <template #title>
        <span class="text-font text-title">내가 담은 레시피 정보</span>
      </template>
      <div class="cart-item-container">
        <div
          class="cart-item-element"
          v-for="recipe in favoriteRecipe"
          :key="recipe"
        >
          <cart-element
            class="text-font"
            type="cart-list"
            :result="recipe"
          ></cart-element>
        </div>
      </div>
    </a-card>
    <a-card class="right-info">
      <template #title>
        <span class="text-font text-title">총 필요한 재료</span>
      </template>
      <a-card>
        <a-list
          :grid="{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 }"
          :data-source="totalNeedIngredients"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-input
                type="text"
                placeholder="(g/mL)"
                style="text-align:right;font-color:red;"
                :defaultValue="item.unit"
                disabled
              >
                <template #addonBefore>{{ item.name }}</template>
                <template #addonAfter>
                  (g/mL)
                </template>
              </a-input>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </a-card>
  </div>
</template>

<script>
import _ from "lodash";
import Recipe from "../../store/models/Recipe.js";
import CartElement from "./CartElement.vue";
export default {
  components: {
    CartElement,
  },
  props: ["favorite-recipe-index"],
  computed: {
    favoriteRecipe() {
      return Recipe.findIn(Array.from(this.favoriteRecipeIndex));
    },
    totalNeedIngredients() {
      let ingredientsFavoriteRecipe = [];
      for (let rawIndex in this.favoriteRecipe) {
        for (let index in this.favoriteRecipe[rawIndex].ingredients) {
          if (
            this.favoriteRecipe[rawIndex].ingredients[index].name.length !== 0
          ) {
            ingredientsFavoriteRecipe.push({
              name: this.favoriteRecipe[rawIndex].ingredients[index].name,
              unit: +this.favoriteRecipe[rawIndex].ingredients[
                index
              ].unit.replace(/[^0-9]/g, ""),
            });
          }
        }
      }
      const totalArray = _.chain(ingredientsFavoriteRecipe)
        .groupBy("name")
        .map((objects, name) => {
          return {
            name: name,
            unit: _.sumBy(objects, "unit"),
          };
        })
        .value();
      return totalArray;
    },
  },
};
</script>

<style scoped>
.cart-container {
  display: flex;
  width: 100%;
  height: fit-content;
  position: absolute;
  justify-content: space-around;
}

.left-info {
  width: 60%;
}

.cart-item-container {
  width: 100%;
}

.cart-item-element {
  width: 100%;
}

.right-info {
  width: 40%;
}

.text-font {
  font-family: "Nanum Gothic", sans-serif;
}

.text-title {
  font-size: 1.2vw;
}
</style>
