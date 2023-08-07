<template>
  <div class="detail-container">
    <a-card :style="{ padding: '10px', width: '100%' }">
      <a-card :style="{ width: '100%' }" :bordered="false">
        <template #title>
          <a-row class="detail-header-container">
            <a-col class="detail-header-item">
              <a-button @click="hideRecipe">레시피 검색 결과로 돌아가기</a-button>
            </a-col>
            <a-col class="detail-header-item">
              <span class="recipe-name">{{ recipe.name }} / {{ recipe.type }}</span>
            </a-col>
            <a-col class="detail-header-item">
              {{ recipeHeader }}
            </a-col>
          </a-row>
        </template>
        <a-image
          :src="recipe.largeImg"
          fallback="data:image/png;base64,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"
        ></a-image>
        <a-row justify="space-around">
          <a-col class="info-card-container">
            <a-card class="info-card" :title="recipeCalorieInfo">
              <template #title>
                {{ recipeCalorieInfo }}
              </template>
              <p>탄수화물 : {{ recipeNutrition.carb }}</p>
              <p>단백질 : {{ recipeNutrition.protein }}</p>
              <p>지방 : {{ recipeNutrition.fat }}</p>
              <p>나트륨 : {{ recipeNutrition.sodium }}</p>
            </a-card>
          </a-col>
          <a-col class="info-card-container">
            <a-card class="info-card">
              <template #title> 필요한 재료 </template>
              <div v-for="ingredient in recipe.ingredients" :key="ingredient">
                <div v-if="ingredient.name.length !== 0">
                  {{ ingredient.name }} : {{ ingredient.unit }}
                  {{ nutritionUnit(ingredient.unit) }}
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col class="info-card-container">
            <a-card class="info-card">
              <template #title> 조리 방법 </template>
              <div v-for="description in recipe.steps" :key="description">
                <p>{{ description }}</p>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-card>
    </a-card>
  </div>
</template>

<script>
import Ingredient from '../../store/models/Ingredient.js';
export default {
  emits: ['hide-recipe'],
  props: ['recipe'],
  computed: {
    recipeHeader() {
      let creator = this.recipe.creator;
      if (creator !== '식품나라(공공데이터)') {
        creator = this.recipe.creator[1];
      }
      return '[' + this.recipe.method + '] / ' + creator + '님 제공';
    },
    recipeCalorieInfo() {
      if (this.recipeNutrition.calorie.length !== 0) {
        return this.recipeNutrition.calorie + ' 칼로리';
      } else {
        return '칼로리 정보 부족';
      }
    },
    recipeNutrition() {
      let totalCalorie = 0;
      let totalCarb = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let totalSodium = 0;
      if (
        this.recipe.calorie === 0 &&
        this.recipe.carb === 0 &&
        this.recipe.protein === 0 &&
        this.recipe.fat === 0 &&
        this.recipe.sodium === 0
      ) {
        for (let ingredient in this.recipe.ingredients) {
          const calorieMeta = Ingredient.query().where('name', ingredient.name).get();
          const calorieByUnit =
            +calorieMeta.carbByUnit * 4 +
            +calorieMeta.proteinByUnit * 4 +
            +calorieMeta.fatByUnit * 9 +
            +calorieMeta.sodiumByUnit;
          totalCarb += +calorieMeta.carbByUnit * ingredient.unit;
          totalProtein += +calorieMeta.proteinByUnit * ingredient.unit;
          totalFat += +calorieMeta.fatByUnit * ingredient.unit;
          totalSodium += +calorieMeta.sodiumByUnit * ingredient.unit;
          totalCalorie += +calorieByUnit * ingredient.unit;
        }
      } else {
        totalCalorie = this.recipe.calorie;
        totalCarb = this.recipe.carb;
        totalProtein = this.recipe.protein;
        totalFat = this.recipe.fat;
        totalSodium = this.recipe.sodium;
      }
      if (totalCarb.length === 0) {
        totalCarb = '재료 정보 부족';
      }
      if (totalProtein.length === 0) {
        totalProtein = '재료 정보 부족';
      }
      if (totalFat.length === 0) {
        totalFat = '재료 정보 부족';
      }
      if (totalSodium.length === 0) {
        totalSodium = '재료 정보 부족';
      }
      return {
        calorie: totalCalorie,
        carb: totalCarb,
        protein: totalProtein,
        fat: totalFat,
        sodium: totalSodium
      };
    }
  },
  methods: {
    nutritionUnit(unit) {
      if (/^[0-9]+$/.test(unit)) {
        return 'g/mL';
      } else {
        return '';
      }
    },
    hideRecipe() {
      this.$emit('hide-recipe');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap');

.detail-container {
  background-color: white;
  width: 100%;
}

.detail-header-container {
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.recipe-name {
  font-size: 3.5vw;
  line-height: 3.5vw;
  font-family: 'Jua', sans-serif;
}

.detail-header-item:nth-child(1) {
  margin-right: 20px;
}

.detail-header-item:nth-child(2) {
  font-size: large;
}

.detail-header-item:nth-child(3) {
  font-size: small;
  margin-left: 20px;
}

.info-card-container {
  width: 100%;
  margin-left: 10px;
  margin-right: 10px;
}

.info-card-container:nth-last-child(1) {
  flex: 1 0 40%;
}

.info-card {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  margin-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
}

@media (min-width: 640px) {
  .info-card-container {
    width: auto;
  }

  .info-card {
    width: fit-content;
  }
}

.text-title {
  font-weight: bold;
  font-size: 1.3vw;
}
</style>
