<template>
  <a-card
    class="create-recipe-container text-font"
    :bodyStyle="{ width: '100%', marginLeft: '10px', marginRight: '10px' }"
  >
    <a-form
      class="create-recipe-item"
      ref="formRef"
      layout="vertical"
      :model="recipeData"
      :rules="rules"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
    >
      <a-auto-complete
        class="recipe-form"
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
          placeholder="기존에 등록된 레시피를 불러올 수 있어요!"
        >
          <template #prefix> <SearchOutlined /> </template
        ></a-input>
      </a-auto-complete>

      <div class="recipe-form">
        <a-upload-dragger
          class="image-uploader"
          list-type="picture-card"
          accept="image/jpeg, image/jpg"
          :customRequest="() => {}"
          :show-upload-list="false"
          @change="getImagePath"
        >
          <img
            v-if="recipeData.largeImg.length !== 0 && !isUploaded"
            class="create-upload-image"
            :src="recipeData.largeImg"
          />
          <img
            v-else-if="imageData"
            class="create-upload-image"
            :src="getImagePicture(imageData)"
          />
          <div v-else>
            <PlusOutlined />
            <div>Upload</div>
          </div>
        </a-upload-dragger>
      </div>

      <a-form-item class="recipe-form" has-feedback name="name" label="레시피 이름">
        <a-input v-model:value.trim="recipeData.name" type="text">
          <template #prefix></template>
        </a-input>
      </a-form-item>
      <a-form-item class="recipe-form" has-feedback name="method" label="조리 방식">
        <a-input v-model:value.trim="recipeData.method" type="text" autocomplete="off">
          <template #prefix></template>
        </a-input>
      </a-form-item>
      <a-form-item class="recipe-form" has-feedback name="type" label="레시피 종류">
        <a-input v-model:value.trim="recipeData.type" type="text" autocomplete="off">
          <template #prefix></template>
        </a-input>
      </a-form-item>
      <a-auto-complete
        class="recipe-form"
        v-model:value="ingredientValue"
        :dropdown-match-select-width="false"
        option-label-prop="title"
        :filterOption="true"
        @select="selectIngredient"
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
          size="large"
          v-model:value.trim="ingredientValue"
          type="text"
          placeholder="레시피에 필요한 재료를 추가하세요!"
        >
          <template #prefix> <PlusOutlined /> </template>
        </a-input>
      </a-auto-complete>
      <a-card class="recipe-form recipe-ingredients">
        <p>레시피 재료</p>
        <div class="recipe-ingredients-container">
          <div
            class="recipe-ingredients-item"
            v-for="(ingredient, index) in recipeData.ingredients"
            :key="index"
          >
            <a-input
              v-model:value.trim="recipeData.ingredients[index].unit"
              type="number"
              placeholder="(g/mL)"
              min="0"
              style="text-align: right; max-width: 70%"
            >
              <template #addonBefore>{{ ingredient.name }}</template>
              <template #addonAfter>
                <DeleteOutlined @click="deleteIngredient(index)" />
              </template>
            </a-input>
          </div>
        </div>
      </a-card>
      <a-card class="recipe-form recipe-steps" title="조리 방법">
        <div v-for="(step, index) in recipeData.steps" :key="index">
          <a-input
            v-model:value.trim="recipeData.steps[index]"
            type="text"
            :placeholder="stepPlaceholder(index)"
          >
            <template #prefix></template>
            <template #suffix
              ><DeleteOutlined v-if="index !== 0" @click="deleteStep(index)"
            /></template>
          </a-input>
        </div>
      </a-card>
      <div class="recipe-form">
        <a-button class="create-button" type="primary" html-type="submit">레시피 만들기</a-button>
      </div>
    </a-form>
  </a-card>
</template>

<script>
import firebase from 'firebase/app';
import _ from 'lodash';
import { ref, reactive } from 'vue';
import { SearchOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import UserInfo from '../../store/models/UserInfo.js';
import Ingredient from '../../store/models/Ingredient.js';
import Recipe from '../../store/models/Recipe.js';
export default {
  emits: ['show-error', 'cancel'],
  components: {
    SearchOutlined,
    DeleteOutlined,
    PlusOutlined
  },
  data() {
    return {
      keywordValue: ref(''),
      searchText: ref(''),
      formRef: ref(),
      ingredientValue: ref(''),
      recipeData: reactive({
        name: '',
        method: '',
        type: '',
        smallImg: '',
        largeImg: '',
        ingredients: [],
        steps: [''],
        calorie: 0,
        carb: 0,
        protein: 0,
        fat: 0,
        sodium: 0
      }),
      rules: {
        name: [{ required: true, validator: this.validateName, trigger: 'change' }],
        method: [{ required: true, validator: this.validateMethod, trigger: 'change' }],
        type: [{ required: true, validator: this.validateType, trigger: 'change' }]
      },
      isUploaded: ref(false),
      imageData: ref('')
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
    ingredients() {
      return Ingredient.query()
        .where((ingredient) => {
          if (
            ingredient.carbByUnit === 0 &&
            ingredient.proteinByUnit === 0 &&
            ingredient.fatByUnit === 0 &&
            ingredient.sodiumByUnit === 0
          ) {
            return false;
          }
          if (this.recipeData.ingredients.length > 0) {
            if (
              this.recipeData.ingredients.filter((existIngredient) => {
                if (existIngredient.name === ingredient.name) {
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
  methods: {
    stepPlaceholder(index) {
      return `${index + 1}번째 조리 방법을 입력하세요!`;
    },
    getImagePicture(file) {
      return window.URL.createObjectURL(file);
    },
    getImagePath(info) {
      const image = info.file.originFileObj;
      this.imageData = image;
      this.isUploaded = true;
    },
    async validateName(rule, value) {
      if (this.recipeData.name === '') {
        return Promise.reject(new Error('레시피 이름을 입력해주세요'));
      } else if (Recipe.query().where('name', this.recipeData.name).exists()) {
        return Promise.reject(new Error('이미 존재하는 레시피 이름입니다'));
      }
      return Promise.resolve();
    },
    async validateMethod(rule, value) {
      if (this.recipeData.method === '') {
        return Promise.reject(new Error('조리 방식을 입력해주세요'));
      }
      return Promise.resolve();
    },
    async validateType(rule, value) {
      if (this.recipeData.type === '') {
        return Promise.reject(new Error('레시피 종류를 입력해주세요'));
      }
      return Promise.resolve();
    },
    async handleFinish(values) {
      Recipe.commit((state) => {
        state.fetching = true;
      });
      if (
        this.recipeData.smallImg.length !== 0 &&
        this.recipeData.largeImg.length !== 0 &&
        !this.isUploaded
      ) {
        const payload = {
          index: +Recipe.query().last().id + 1,
          token: this.getUser.token,
          data: {
            id: +Recipe.query().last().id + 1,
            creator: [UserInfo.all()[0].userId, UserInfo.all()[0].nickname],
            name: values.name,
            method: values.method,
            type: values.type,
            smallImg: this.recipeData.smallImg,
            largeImg: this.recipeData.largeImg,
            ingredients: this.recipeData.ingredients,
            steps: this.recipeData.steps
          }
        };
        const result = await Recipe.api().createRecipe(payload);
        if (result.response.data.error) {
          this.showError('레시피를 생성하는 데 실패하였습니다!');
        }
        Recipe.commit((state) => {
          state.fetching = false;
        });
        this.$emit('cancel');
      } else {
        const storageRef = firebase
          .storage()
          .ref(`recipes/${+Recipe.query().last().id + 1}/${this.getUser.userId}`)
          .put(this.imageData);
        storageRef.on(
          'state_changed',
          (snapshot) => {},
          (error) => {
            this.showError('이미지 업로드에 실패하였습니다' || error);
          },
          async () => {
            await firebase
              .storage()
              .ref(`recipes/${+Recipe.query().last().id + 1}`)
              .child(`${this.getUser.userId}`)
              .getDownloadURL()
              .then(async (url) => {
                const payload = {
                  index: +Recipe.query().last().id + 1,
                  token: this.getUser.token,
                  data: {
                    id: +Recipe.query().last().id + 1,
                    creator: [UserInfo.all()[0].userId, UserInfo.all()[0].nickname],
                    name: values.name,
                    method: values.method,
                    type: values.type,
                    smallImg: url,
                    largeImg: url,
                    ingredients: this.recipeData.ingredients,
                    steps: this.recipeData.steps
                  }
                };
                const result = await Recipe.api().createRecipe(payload);
                if (result.response.data.error) {
                  this.showError('레시피를 생성하는 데 실패하였습니다!');
                }
                Recipe.commit((state) => {
                  state.fetching = false;
                });
                this.$emit('cancel');
              });
          }
        );
      }
    },
    onSelect(searchText) {
      const foundRecipe = this.cleanObject(Recipe.query().where('name', searchText).get()[0]);
      this.recipeData.name = foundRecipe.name;
      this.recipeData.method = foundRecipe.method;
      this.recipeData.type = foundRecipe.type;
      this.recipeData.ingredients = foundRecipe.ingredients;
      this.recipeData.steps = foundRecipe.steps;
      this.recipeData.smallImg = foundRecipe.smallImg;
      this.recipeData.largeImg = foundRecipe.largeImg;
      this.isUploaded = false;
    },
    selectIngredient(name) {
      const ingredientData = this.cleanObject(this.recipeData.ingredients);
      ingredientData.push({
        name: name,
        unit: ''
      });
      this.recipeData.ingredients = ingredientData;
      this.ingredientValue = '';
    },
    deleteStep(index) {
      const steps = this.cleanObject(this.recipeData.steps);
      steps.splice(index, 1);
      this.recipeData.steps = steps;
    },
    deleteIngredient(index) {
      const ingredients = this.cleanObject(this.recipeData.ingredients);
      ingredients.splice(index, 1);
      this.recipeData.ingredients = ingredients;
    },
    handleFinishFailed(errors) {
      this.showError('입력 데이터를 다시 한 번 확인해주세요' || errors);
    },
    showError(error) {
      this.$emit('show-error', error);
    },
    cleanObject(object) {
      return JSON.parse(JSON.stringify(object));
    }
  }
};
</script>

<style scoped>
.create-recipe-container {
  display: flex;
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 25%);
}

.create-recipe-item {
  width: 100%;
  background-color: white;
  display: flex;
  flex-wrap: wrap;
}

.recipe-form {
  display: block;
  width: 100%;
  margin: 16px auto 0px auto;
  padding-top: 0;
  padding-bottom: 0;
}

.create-upload-image {
  width: 97%;
  height: 300px;
  object-fit: fill;
}

.recipe-ingredients {
  margin-top: 0;
}

.recipe-ingredients-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}

.recipe-ingredients-item {
  margin: 10px;
  width: fit-content;
}

.recipe-form:nth-child(1) {
  margin-bottom: 20px;
}

.recipe-form:nth-child(5) {
  margin-bottom: 20px;
}

.recipe-steps {
  margin-top: 10px;
  margin-bottom: 0;
}

.recipe-form:nth-last-child(2) {
  margin-bottom: 20px;
}

.recipe-form:nth-last-child(1) {
  text-align: center;
  margin-bottom: 20px;
}

.create-button {
  height: fit-content;
  padding: 10px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  font-family: 'Jua', sans-serif;
  background-color: #3ddbf7;
  border-color: transparent;
  font-size: xx-large;
}

.text-font {
  font-family: 'Nanum Gothic', sans-serif;
}
</style>
