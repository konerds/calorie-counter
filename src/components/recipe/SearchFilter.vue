<template>
  <div class="search-filter-container">
    <a-card class="search-filter-card" :bordered="false" :bodyStyle="{ width: '100%' }">
      <div class="line-break search-filter">
        <a-auto-complete
          :getPopupContainer="getPopupContainer"
          v-model:value="enteredAutoCompleteRecipeValue"
          :style="{ width: 'inherit' }"
          :dropdown-match-select-width="false"
          :filterOption="false"
          :options="recipesByName"
          @focus="onFocusFilterRecipe"
          @select="onSelectAutoCompleteKeywordValue"
        >
          <a-input
            :value="enteredInputRecipeValue"
            @change="enteredInputRecipeValue = $event.target.value"
            size="large"
            placeholder="원하는 레시피를 찾아보세요!"
          >
            <template #prefix> <SearchOutlined /> </template
          ></a-input>
        </a-auto-complete>
      </div>
      <div class="line-break search-filter">
        <a-auto-complete
          :getPopupContainer="getPopupContainer"
          v-model:value="enteredAutoCompleteValueIncludedIngredient"
          :style="{ width: 'inherit' }"
          :dropdown-match-select-width="false"
          :filterOption="false"
          :options="optionsIncludedIngredients"
          @focus="onFocusFilterIncludedIngredients"
          @select="onSelectIncludedIngredient"
        >
          <a-input-search
            :value="enteredInputValueIncludedIngredient"
            @change="enteredInputValueIncludedIngredient = $event.target.value"
            enter-button="추가"
            size="large"
            placeholder="냉장고에 있는 재료를 적어 보세요"
            ><template #prefix> <PlusOutlined /> </template
          ></a-input-search>
        </a-auto-complete>
      </div>
      <div
        v-if="selectedIncludedIngredients.length !== 0"
        class="line-break search-filter filter-element-ingredients"
      >
        <div
          class="search-filter-item"
          v-for="selectedIncludedIngredient in selectedIncludedIngredients"
          :key="selectedIncludedIngredient"
        >
          <ingredient-filter
            type="included"
            :ingredient="selectedIncludedIngredient"
            @unselect="unselectIngredient"
          ></ingredient-filter>
        </div>
      </div>
      <div class="line-break search-filter filter-not-included-ingredients">
        <a-auto-complete
          :getPopupContainer="getPopupContainer"
          v-model:value="enteredAutoCompleteValueNotIncludedIngredient"
          :style="{ width: 'inherit' }"
          :dropdown-match-select-width="false"
          :filterOption="false"
          :options="optionsNotIncludedIngredients"
          @focus="onFocusFilterNotIncludedIngredients"
          @select="onSelectNotIncludedIngredient"
        >
          <a-input-search
            :value="enteredInputValueNotIncludedIngredient"
            @change="enteredInputValueNotIncludedIngredient = $event.target.value"
            enter-button="추가"
            size="large"
            placeholder="냉장고에 없는 재료도 적어 보세요"
          >
            <template #prefix> <MinusOutlined /> </template>
          </a-input-search>
        </a-auto-complete>
      </div>
      <div
        v-if="selectedNotIncludedIngredients.length !== 0"
        class="line-break search-filter filter-element-ingredients"
      >
        <div
          class="search-filter-item"
          v-for="selectedNotIncludedIngredient in selectedNotIncludedIngredients"
          :key="selectedNotIncludedIngredient"
        >
          <ingredient-filter
            type="none"
            :ingredient="selectedNotIncludedIngredient"
            @unselect="unselectIngredient"
          ></ingredient-filter>
        </div>
      </div>
      <div class="line-break search-filter">
        <a-input
          size="large"
          placeholder="레시피의 최대 칼로리를 적어 보세요"
          v-model:value="enteredInputMaxCalorie"
        ></a-input>
      </div>
      <div class="line-break search-filter">
        <a-button class="search-button" @click="searchRecipe()"
          >검색 <SearchOutlined :style="{ verticalAlign: 'middle' }"
        /></a-button>
      </div>
    </a-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import { SearchOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
import IngredientFilter from './ingredient/IngredientFilter.vue';
import Ingredient from '../../store/models/Ingredient.js';
import Recipe from '../../store/models/Recipe.js';
export default {
  emits: ['show-result'],
  components: {
    SearchOutlined,
    PlusOutlined,
    MinusOutlined,
    IngredientFilter
  },
  data() {
    return {
      enteredAutoCompleteRecipeValue: ref(''),
      enteredInputRecipeValue: ref(''),
      recipesByName: ref([]),
      optionsIncludedIngredients: ref([]),
      optionsNotIncludedIngredients: ref([]),
      limitsFilter: 10,
      enteredAutoCompleteValueIncludedIngredient: ref(''),
      enteredAutoCompleteValueNotIncludedIngredient: ref(''),
      enteredInputValueIncludedIngredient: ref(''),
      enteredInputValueNotIncludedIngredient: ref(''),
      selectedIncludedIngredients: ref([]),
      selectedNotIncludedIngredients: ref([]),
      enteredInputMaxCalorie: ref('')
    };
  },
  computed: {
    watcherDependenciesOptionsIngredients() {
      const {
        enteredInputValueIncludedIngredient,
        enteredInputValueNotIncludedIngredient,
        selectedIncludedIngredients,
        selectedNotIncludedIngredients
      } = this;
      return {
        enteredInputValueIncludedIngredient,
        enteredInputValueNotIncludedIngredient,
        selectedIncludedIngredients,
        selectedNotIncludedIngredients
      };
    },
    recipes() {
      return Recipe.query().orderBy('name', 'asc').get();
    }
  },
  watch: {
    watcherDependenciesOptionsIngredients: {
      handler: function (val) {
        this.fetchOptionsFilterIngredients(true);
        this.fetchOptionsFilterIngredients(false);
      },
      deep: true
    },
    enteredInputRecipeValue(val, preVal) {
      this.fetchRecipesByName();
    },
    enteredInputMaxCalorie(val, preVal) {
      const reg = /^-?\d*(\.\d*)?$/;
      if ((!isNaN(+val) && reg.test(val)) || val === '' || val === '-') {
        this.enteredInputMaxCalorie = val;
      } else {
        this.enteredInputMaxCalorie = preVal;
      }
    }
  },
  methods: {
    onFocusFilterRecipe() {
      this.fetchRecipesByName();
    },
    async fetchRecipesByName() {
      const recipes = await Recipe.query()
        .where((recipe) => {
          return (
            this.enteredInputRecipeValue !== undefined &&
            this.enteredInputRecipeValue !== null &&
            recipe.name.indexOf(this.enteredInputRecipeValue) >= 0
          );
        })
        .orderBy('name', 'asc')
        .get();
      this.recipesByName = recipes.slice(0, this.limitsFilter).map((e) => {
        return {
          value: e.name
        };
      });
    },
    onFocusFilterIncludedIngredients() {
      this.fetchOptionsFilterIngredients(true);
    },
    onFocusFilterNotIncludedIngredients() {
      this.fetchOptionsFilterIngredients(false);
    },
    async fetchOptionsFilterIngredients(isOptionIncludedIngredient) {
      const options = await Ingredient.query()
        .where((ingredient) => {
          const searchKeywordIngredient = isOptionIncludedIngredient
            ? this.enteredInputValueIncludedIngredient
            : this.enteredInputValueNotIncludedIngredient;
          if (
            searchKeywordIngredient !== undefined &&
            searchKeywordIngredient !== null &&
            ingredient.name.indexOf(searchKeywordIngredient) >= 0
          ) {
            if (this.selectedIncludedIngredients.length > 0) {
              if (
                this.selectedIncludedIngredients.filter((includedIngredient) => {
                  if (includedIngredient[0].name === ingredient.name) {
                    return true;
                  }
                  return false;
                }).length > 0
              ) {
                return false;
              }
            }
            if (this.selectedNotIncludedIngredients.length > 0) {
              if (
                this.selectedNotIncludedIngredients.filter((notIncludedIngredient) => {
                  if (notIncludedIngredient[0].name === ingredient.name) {
                    return true;
                  }
                  return false;
                }).length > 0
              ) {
                return false;
              }
            }
            return true;
          }
          return false;
        })
        .orderBy('name', 'asc')
        .get();
      if (isOptionIncludedIngredient) {
        this.optionsIncludedIngredients = options.slice(0, this.limitsFilter).map((e) => {
          return {
            value: e.name
          };
        });
      } else {
        this.optionsNotIncludedIngredients = options.slice(0, this.limitsFilter).map((e) => {
          return {
            value: e.name
          };
        });
      }
    },
    getPopupContainer(triggerNode) {
      return triggerNode.parentElement;
    },
    async searchRecipe() {
      const searchedResult = await Recipe.query()
        .where((recipe) => {
          const ingredientsOfRecipe = recipe.ingredients.map((e) => {
            return e.name;
          });
          if (
            +recipe.calorie > +this.enteredInputMaxCalorie &&
            this.enteredInputMaxCalorie.length !== 0
          ) {
            return false;
          }
          if (
            recipe.name === this.enteredInputRecipeValue ||
            recipe.name.includes(this.enteredInputRecipeValue) ||
            ingredientsOfRecipe.includes(this.enteredInputRecipeValue)
          ) {
            let isValidByIncludedIngredientsFilter = true;
            if (this.selectedIncludedIngredients.length > 0) {
              isValidByIncludedIngredientsFilter =
                ingredientsOfRecipe.filter((e) => {
                  for (let key in this.selectedIncludedIngredients) {
                    if (this.selectedIncludedIngredients[key][0].name === e) {
                      return true;
                    }
                  }
                  return false;
                }).length > 0;
            }
            let isValidByNotIncludedIngredientsFilter = true;
            if (this.selectedNotIncludedIngredients.length > 0) {
              isValidByNotIncludedIngredientsFilter =
                ingredientsOfRecipe.filter((e) => {
                  for (let key in this.selectedNotIncludedIngredients) {
                    if (this.selectedNotIncludedIngredients[key][0].name === e) {
                      return true;
                    }
                  }
                  return false;
                }).length <= 0;
            }
            return isValidByIncludedIngredientsFilter && isValidByNotIncludedIngredientsFilter;
          }
          return false;
        })
        .get();
      this.$emit('show-result', searchedResult, this.enteredInputRecipeValue);
      this.enteredAutoCompleteValueIncludedIngredient = '';
      this.enteredInputValueIncludedIngredient = '';
      this.enteredAutoCompleteValueNotIncludedIngredient = '';
      this.enteredInputValueNotIncludedIngredient = '';
    },
    onSelectIncludedIngredient(name) {
      this.selectedIncludedIngredients.push(Ingredient.query().where('name', name).get());
      this.enteredAutoCompleteValueIncludedIngredient = '';
      this.enteredInputValueIncludedIngredient = '';
    },
    onSelectNotIncludedIngredient(name) {
      this.selectedNotIncludedIngredients.push(Ingredient.query().where('name', name).get());
      this.enteredAutoCompleteValueNotIncludedIngredient = '';
      this.enteredInputValueNotIncludedIngredient = '';
    },
    unselectIngredient(name, type) {
      if (type === 'included') {
        this.selectedIncludedIngredients = this.selectedIncludedIngredients.filter((ingredient) => {
          if (ingredient[0].name === name) {
            return false;
          }
          return true;
        });
      } else {
        this.selectedNotIncludedIngredients = this.selectedNotIncludedIngredients.filter(
          (ingredient) => {
            if (ingredient[0].name === name) {
              return false;
            }
            return true;
          }
        );
      }
    },
    onSelectAutoCompleteKeywordValue(_enteredInputRecipeValue) {
      this.enteredInputRecipeValue = _enteredInputRecipeValue;
    }
  }
};
</script>

<style scoped>
.search-filter-container {
  width: 100%;
}

.search-filter-card {
  z-index: 1;
  width: 100%;
}

@media (min-width: 1024px) {
  .search-filter-container {
    width: 35%;
    height: 100%;
  }

  .search-filter-card {
    width: 35%;
    height: 87.5%;
    position: fixed;
    display: flex;
    align-items: center;
  }
}

.search-filter {
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}

.filter-element-ingredients {
  padding-top: 0px;
  padding-bottom: 20px;
}

.search-filter-item {
  margin: 0px 8px 0px 8px;
}

.filter-not-included-ingredients {
  padding-top: 0px;
}

.search-filter:nth-last-child(1) {
  margin-top: 20px;
}

.line-break {
  width: 100%;
}

.search-button {
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 15%);
}

a,
a:link,
a:visited,
a:hover {
  color: inherit;
  text-decoration: inherit;
}

li {
  list-style-type: none;
}
</style>
