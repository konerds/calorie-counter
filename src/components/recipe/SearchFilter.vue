<template>
  <div class="search-filter-container">
    <a-card
      class="search-filter-card"
      :bordered="false"
      :bodyStyle="{ width: '100%', marginLeft: '10px', marginRight: '10px' }"
    >
      <div class="line-break search-filter">
        <a-auto-complete
          :style="{ width: 'inherit' }"
          v-model:value="keywordValue"
          :dropdown-match-select-width="false"
          option-label-prop="title"
          @select="onSelect"
          :filterOption="true"
        >
          <template #options>
            <a-select-option v-for="keyword in keywords" :key="keyword">
              <template #label>
                <span style="margin-left: 0.5rem">
                  {{ keyword }}
                </span>
              </template>
            </a-select-option>
          </template>
          <a-input
            v-model:value.trim="searchText"
            :width="100"
            size="large"
            placeholder="원하는 레시피를 찾아보세요!"
          >
            <template #prefix> <SearchOutlined /> </template
          ></a-input>
        </a-auto-complete>
      </div>
      <div class="line-break search-filter">
        <a-auto-complete
          :style="{ width: 'inherit' }"
          v-model:value="existIngredientValue"
          :dropdown-match-select-width="false"
          option-label-prop="title"
          :filterOption="true"
          @select="selectExistIngredient"
        >
          <template #options>
            <a-select-option v-for="ingredient in ingredients" :key="ingredient.name">
              <template #label>
                <span style="margin-left: 0.5rem">
                  {{ ingredient.name }}
                </span>
              </template>
            </a-select-option>
          </template>
          <a-input
            :style="{ fontSize: '' }"
            size="large"
            placeholder="냉장고에 있는 재료를 적어 보세요"
            ><template #prefix> <PlusOutlined /> </template
          ></a-input>
        </a-auto-complete>
      </div>
      <div v-if="selectedExistIngredients.length !== 0" class="line-break search-filter">
        <div
          class="search-filter-item"
          v-for="selectedExistIngredient in selectedExistIngredients"
          :key="selectedExistIngredient"
        >
          <ingredient-filter
            type="exist"
            :ingredient="selectedExistIngredient"
            @unselect="unselectIngredient"
          ></ingredient-filter>
        </div>
      </div>
      <div class="line-break search-filter">
        <a-auto-complete
          :style="{ width: 'inherit' }"
          v-model:value="notExistIngredientValue"
          :dropdown-match-select-width="false"
          option-label-prop="title"
          :filterOption="true"
          @select="selectNotExistIngredient"
        >
          <template #options>
            <a-select-option v-for="ingredient in ingredients" :key="ingredient.name">
              <template #label>
                <span style="margin-left: 0.5rem">
                  {{ ingredient.name }}
                </span>
              </template>
            </a-select-option>
          </template>
          <a-input size="large" placeholder="없는 재료도 적어 보세요">
            <template #prefix> <MinusOutlined /> </template>
          </a-input>
        </a-auto-complete>
      </div>
      <div v-if="selectedNotExistIngredients.length !== 0" class="line-break search-filter">
        <div
          class="search-filter-item"
          v-for="selectedNotExistIngredient in selectedNotExistIngredients"
          :key="selectedNotExistIngredient"
        >
          <ingredient-filter
            type="none"
            :ingredient="selectedNotExistIngredient"
            @unselect="unselectIngredient"
          ></ingredient-filter>
        </div>
      </div>
      <div class="line-break search-filter">
        <a-input
          size="large"
          placeholder="레시피의 최대 칼로리를 적어 보세요"
          v-model:value="maxCalorie"
        ></a-input>
      </div>
      <div class="line-break search-filter">
        <a-button class="search-button" @click="searchRecipe()">검색 <SearchOutlined /></a-button>
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
      keywordValue: ref(''),
      existIngredientValue: ref(''),
      notExistIngredientValue: ref(''),
      searchText: ref(''),
      selectedExistIngredients: ref([]),
      selectedNotExistIngredients: ref([]),
      maxCalorie: ref('')
    };
  },
  computed: {
    ingredients() {
      return Ingredient.query()
        .where((ingredient) => {
          if (this.selectedExistIngredients.length > 0) {
            if (
              this.selectedExistIngredients.filter((existIngredient) => {
                if (existIngredient[0].name === ingredient.name) {
                  return true;
                }
                return false;
              }).length > 0
            ) {
              return false;
            }
            if (this.selectedNotExistIngredients.length > 0) {
              if (
                this.selectedNotExistIngredients.filter((notExistIngredient) => {
                  if (notExistIngredient[0].name === ingredient.name) {
                    return true;
                  }
                  return false;
                }).length > 0
              ) {
                return false;
              }
              return true;
            }
            return true;
          }
          return true;
        })
        .orderBy('name', 'asc')
        .get();
    },
    recipes() {
      return Recipe.query().orderBy('name', 'asc').get();
    },
    keywords() {
      const keywords = [];
      const ingredients = Ingredient.all();
      for (let indexRecipe in this.recipes) {
        keywords.push(this.recipes[indexRecipe].name);
      }
      for (let indexIngredient in ingredients) {
        keywords.push(ingredients[indexIngredient].name);
      }
      const filteredKeywords = keywords.filter((keyword) => {
        if (this.searchText === '') {
          return false;
        }
        return true;
      });

      return [...new Set(filteredKeywords)];
    }
  },
  watch: {
    maxCalorie(val, preVal) {
      const reg = /^-?\d*(\.\d*)?$/;
      if ((!isNaN(+val) && reg.test(val)) || val === '' || val === '-') {
        this.maxCalorie = val;
      } else {
        this.maxCalorie = preVal;
      }
    }
  },
  methods: {
    async searchRecipe() {
      const searchedResult = await Recipe.query()
        .where((recipe) => {
          if (+recipe.calorie > +this.maxCalorie && this.maxCalorie.length !== 0) {
            return false;
          }
          if (recipe.name === this.searchText || recipe.name.includes(this.searchText)) {
            let isExistFiltered = true;
            if (this.selectedExistIngredients.length > 0) {
              isExistFiltered =
                recipe.ingredients.filter((ingredient) => {
                  for (let key in this.selectedExistIngredients) {
                    if (this.selectedExistIngredients[key][0].name === ingredient.name) {
                      return true;
                    }
                  }
                  return false;
                }).length > 0;
            }
            let isNotExistFiltered = true;
            if (this.selectedNotExistIngredients.length > 0) {
              isNotExistFiltered =
                recipe.ingredients.filter((ingredient) => {
                  for (let key in this.selectedNotExistIngredients) {
                    if (this.selectedNotExistIngredients[key][0].name === ingredient.name) {
                      return false;
                    }
                  }
                  return true;
                }).length === recipe.ingredients.length;
            }
            if (isExistFiltered && isNotExistFiltered) {
              return true;
            }
            return false;
          }
          return false;
        })
        .get();
      this.$emit('show-result', searchedResult, this.searchText);
    },
    selectExistIngredient(name) {
      this.selectedExistIngredients.push(Ingredient.query().where('name', name).get());
      this.existIngredientValue = '';
    },
    selectNotExistIngredient(name) {
      this.selectedNotExistIngredients.push(Ingredient.query().where('name', name).get());
      this.notExistIngredientValue = '';
    },
    unselectIngredient(name, type) {
      if (type === 'exist') {
        this.selectedExistIngredients = this.selectedExistIngredients.filter((ingredient) => {
          if (ingredient[0].name === name) {
            return false;
          }
          return true;
        });
      } else {
        this.selectedNotExistIngredients = this.selectedNotExistIngredients.filter((ingredient) => {
          if (ingredient[0].name === name) {
            return false;
          }
          return true;
        });
      }
    },
    onSelect(searchText) {
      this.searchText = searchText;
    }
  }
};
</script>

<style scoped>
.search-filter-container {
  width: 35%;
  height: 100%;
}

.search-filter-card {
  width: 35%;
  height: 87.5%;
  position: fixed;
  z-index: 1;
  display: flex;
  align-items: center;
}

.search-filter {
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}

.search-filter-item {
  margin: 8px;
}

.search-filter:nth-last-child(1) {
  margin-top: 30px;
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
