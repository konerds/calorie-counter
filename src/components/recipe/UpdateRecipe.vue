<template>
  <a-card
    class="update-recipe-container text-font"
    :bodyStyle="{ width: '100%', marginLeft: '10px', marginRight: '10px' }"
  >
    <a-form
      class="update-recipe-item"
      ref="formRef"
      layout="vertical"
      :model="recipeData"
      :rules="rules"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
    >
      <div class="recipe-form">
        <a-upload-dragger
          list-type="picture-card"
          accept="image/jpeg, image/jpg"
          :customRequest="() => {}"
          :show-upload-list="false"
          @change="getImagePath"
        >
          <img
            v-if="recipeData.largeImg.length !== 0 && !isUploaded"
            class="update-upload-image"
            :src="recipeData.largeImg"
          />
          <img
            v-else-if="imageData"
            class="update-upload-image"
            :src="getImagePicture(imageData)"
          />
          <div v-else>
            <PlusOutlined />
            <div>Upload</div>
          </div>
        </a-upload-dragger>
      </div>
      <a-form-item
        class="recipe-form"
        has-feedback
        name="name"
        label="레시피 이름"
      >
        <a-input v-model:value.trim="recipeData.name" type="text">
          <template #prefix></template>
        </a-input>
      </a-form-item>
      <a-form-item
        class="recipe-form"
        has-feedback
        name="method"
        label="조리 방식"
      >
        <a-input
          v-model:value.trim="recipeData.method"
          type="text"
          autocomplete="off"
        >
          <template #prefix></template>
        </a-input>
      </a-form-item>
      <a-form-item
        class="recipe-form"
        has-feedback
        name="type"
        label="레시피 종류"
      >
        <a-input
          v-model:value.trim="recipeData.type"
          type="text"
          autocomplete="off"
        >
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
          <a-select-option
            v-for="ingredient in ingredients"
            :key="ingredient.name"
          >
            <template #label>
              <span style="margin-left: 0.5rem;">
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
              style="text-align:right;max-width:70%;"
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
        <a-button class="update-button" type="primary" html-type="submit"
          ><EditOutlined />레시피 수정</a-button
        >
      </div>
    </a-form>
  </a-card>
</template>

<script>
import firebase from "firebase/app";
import { ref, reactive } from "vue";
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons-vue";
import UserInfo from "../../store/models/UserInfo.js";
import Ingredient from "../../store/models/Ingredient.js";
import Recipe from "../../store/models/Recipe.js";
export default {
  emits: ["show-error", "cancel"],
  components: {
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
  },
  props: ["recipe-name"],
  mounted() {
    this.onSelect(this.recipeName);
  },
  data() {
    return {
      formRef: ref(),
      ingredientValue: ref(""),
      recipeData: reactive({
        name: "",
        method: "",
        type: "",
        smallImg: "",
        largeImg: "",
        ingredients: [],
        steps: [""],
      }),
      rules: {
        name: [
          { required: true, validator: this.validateName, trigger: "change" },
        ],
        method: [
          { required: true, validator: this.validateMethod, trigger: "change" },
        ],
        type: [
          { required: true, validator: this.validateType, trigger: "change" },
        ],
      },
      isUploaded: ref(false),
      imageData: ref(""),
    };
  },
  computed: {
    getUser() {
      if (UserInfo.all().length === 0) {
        return {
          userId: null,
          nickname: null,
          token: null,
          favoriteRecipe: [],
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
        .orderBy("name", "asc")
        .get();
    },
    recipes() {
      return Recipe.query()
        .orderBy("name", "asc")
        .get();
    },
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
      if (this.recipeData.name === "") {
        return Promise.reject(new Error("레시피 이름을 입력해주세요"));
      }
      return Promise.resolve();
    },
    async validateMethod(rule, value) {
      if (this.recipeData.method === "") {
        return Promise.reject(new Error("조리 방식을 입력해주세요"));
      }
      return Promise.resolve();
    },
    async validateType(rule, value) {
      if (this.recipeData.type === "") {
        return Promise.reject(new Error("레시피 종류를 입력해주세요"));
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
          index: +Recipe.query().last().id,
          token: this.getUser.token,
          data: {
            id: +Recipe.query().last().id,
            creator: [UserInfo.all()[0].userId, UserInfo.all()[0].nickname],
            name: values.name,
            method: values.method,
            type: values.type,
            smallImg: this.recipeData.smallImg,
            largeImg: this.recipeData.largeImg,
            ingredients: this.recipeData.ingredients,
            steps: this.recipeData.steps,
          },
        };
        const result = await Recipe.api().updateRecipe(payload);
        if (result.response.data.error) {
          this.showError("레시피를 수정하는 데 실패하였습니다!");
        }
        Recipe.commit((state) => {
          state.fetching = false;
        });
        this.$emit("cancel");
      } else {
        const storageRef = firebase
          .storage()
          .ref(`recipes/${+Recipe.query().last().id}/${this.getUser.userId}`)
          .put(this.imageData);
        storageRef.on(
          "state_changed",
          (snapshot) => {},
          (error) => {
            this.showError("이미지 업로드에 실패하였습니다" || error);
          },
          async () => {
            await firebase
              .storage()
              .ref(`recipes/${+Recipe.query().last().id}`)
              .child(`${this.getUser.userId}`)
              .getDownloadURL()
              .then(async (url) => {
                const payload = {
                  index: +Recipe.query().last().id,
                  token: this.getUser.token,
                  data: {
                    id: +Recipe.query().last().id,
                    creator: [
                      UserInfo.all()[0].userId,
                      UserInfo.all()[0].nickname,
                    ],
                    name: values.name,
                    method: values.method,
                    type: values.type,
                    smallImg: url,
                    largeImg: url,
                    ingredients: this.recipeData.ingredients,
                    steps: this.recipeData.steps,
                  },
                };
                const result = await Recipe.api().updateRecipe(payload);
                if (result.response.data.error) {
                  this.showError("레시피를 수정하는 데 실패하였습니다!");
                }
                Recipe.commit((state) => {
                  state.fetching = false;
                });
                this.$emit("cancel");
              });
          }
        );
      }
    },
    onSelect(recipeName) {
      const foundRecipe = this.cleanObject(
        Recipe.query()
          .where("name", recipeName)
          .get()[0]
      );
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
        unit: "",
      });
      this.recipeData.ingredients = ingredientData;
      this.ingredientValue = "";
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
      this.showError("입력 데이터를 다시 한 번 확인해주세요" || errors);
    },
    showError(error) {
      this.$emit("show-error", error);
    },
    cleanObject(object) {
      return JSON.parse(JSON.stringify(object));
    },
  },
};
</script>

<style scoped>
.update-recipe-container {
  display: flex;
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 25%);
}

.update-recipe-item {
  width: 100%;
  background-color: white;
  display: flex;
  flex-wrap: wrap;
}

.recipe-form {
  display: block;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2vh;
  padding-top: 0;
  padding-bottom: 0;
}

.update-upload-image {
  width: 97%;
  height: 30vh;
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
  margin: 0.3vw;
  width: fit-content;
}

.recipe-form:nth-child(4) {
  margin-bottom: 5vh;
}

.recipe-steps {
  margin-top: 3vh;
  margin-bottom: 0;
}

.recipe-form:nth-last-child(2) {
  margin-bottom: 3vh;
}

.recipe-form:nth-last-child(1) {
  text-align: center;
  margin-bottom: 1vh;
}

.update-button {
  height: fit-content;
  padding-left: 1.2vw;
  padding-right: 1.2vw;
  padding-top: 1.3vh;
  padding-bottom: 1.1vh;
  font-family: "Jua", sans-serif;
  background-color: #3ddbf7;
  border-color: transparent;
  font-size: 1.5vw;
  line-height: 1.5vw;
}

.text-font {
  font-family: "Nanum Gothic", sans-serif;
}
</style>
