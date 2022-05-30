<template>
  <a-card
    class="result-element-container"
    bodyStyle="width:100%"
    bordered
    @click="showDetail"
  >
    <template #cover>
      <div class="card-cover-container">
        <a-button
          class="toggle-cart-button"
          v-if="isLoggedIn && getUser.type === 0"
          @click="
            (event) => {
              toggleCart();
              event.stopImmediatePropagation();
            }
          "
          ><CheckCircleOutlined
            style="font-size:0.6vw;line-height:0.6vw;margin:auto;"
            v-if="!isInCart"
          /><CloseCircleOutlined
            style="font-size:0.6vw;line-height:0.6vw;"
            v-else
          />{{ toggleCartLabel }}</a-button
        >
        <a-button
          class="update-recipe-button"
          v-if="
            getUser.type === 1 ||
              (isLoggedIn && getUser.type === 0 && isCreator)
          "
          @click="
            (event) => {
              updateRecipe();
              event.stopImmediatePropagation();
            }
          "
          ><EditOutlined
            style="font-size:0.6vw;line-height:0.6vw;margin:auto;"
          />레시피 편집</a-button
        >
        <a-button
          class="delete-recipe-button"
          v-if="
            getUser.type === 1 ||
              (isLoggedIn && getUser.type === 0 && isCreator)
          "
          @click="
            (event) => {
              deleteRecipe();
              event.stopImmediatePropagation();
            }
          "
          ><DeleteOutlined
            style="font-size:0.6vw;line-height:0.6vw;margin:auto;"
          />레시피 삭제</a-button
        >
        <img
          class="cover-image"
          :src="result.smallImg"
          onerror="this.src='data:image/png;base64,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'"
        />
      </div>
    </template>
    <a-card-meta>
      <template #title>
        <a-row>
          <a-col class="result-detail-title-container">
            <p class="result-detail-title-meta">
              {{ result.type }} / {{ result.method }}
            </p>
            <p class="result-detail-title-name">{{ result.name }}</p>
            <p class="result-detail-title-calorie">
              {{ result.calorie }} 칼로리
            </p>
          </a-col>
        </a-row>
      </template>
    </a-card-meta>
  </a-card>
</template>

<script>
import UserInfo from "../../store/models/UserInfo.js";
import Recipe from "../../store/models/Recipe.js";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
export default {
  emits: ["show-detail", "show-error", "update-recipe"],
  props: ["result", "bordered"],
  components: {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
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
    isLoggedIn() {
      return !!this.getUser.token;
    },
    userFavoriteRecipe() {
      return Array.from(this.getUser.favoriteRecipe);
    },
    isInCart() {
      if (this.userFavoriteRecipe.length > 0) {
        for (let index in this.userFavoriteRecipe) {
          if (this.userFavoriteRecipe[index] == this.result.id) {
            return index;
          }
        }
      }
      return false;
    },
    toggleCartLabel() {
      if (this.isInCart) {
        return "장바구니에서 제외";
      } else {
        return "장바구니에 추가";
      }
    },
    isCreator() {
      if (this.getUser.userId === this.result.creator[0]) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    showDetail() {
      this.$emit("show-detail", this.result.id);
    },
    showError(error) {
      this.$emit("show-error", error);
    },
    async toggleCart() {
      UserInfo.commit((state) => {
        state.fetching = true;
      });
      let prevFavoriteRecipe = Array.from(UserInfo.all()[0].favoriteRecipe);
      if (this.isInCart !== false) {
        prevFavoriteRecipe.splice(this.isInCart, 1);
        if (prevFavoriteRecipe === []) {
          prevFavoriteRecipe = "";
        }
        const payload = {
          userId: this.getUser.userId,
          token: this.getUser.token,
          data: { favoriteRecipe: prevFavoriteRecipe },
        };
        const fetchResult = await UserInfo.api().toggleCart(payload);
        if (fetchResult.response.data.error) {
          this.showError("레시피를 장바구니에서 삭제하는 데 실패하였습니다!");
        }
      } else {
        if (this.userFavoriteRecipe.length === 0) {
          prevFavoriteRecipe = [];
        }
        prevFavoriteRecipe.push(+this.result.id);
        const payload = {
          userId: this.getUser.userId,
          token: this.getUser.token,
          data: { favoriteRecipe: prevFavoriteRecipe },
        };
        const fetchResult = await UserInfo.api().toggleCart(payload);
        if (fetchResult.response.data.error) {
          this.showError("레시피를 장바구니에 추가하는 데 실패하였습니다!");
        }
      }
      const fetchResult = await UserInfo.api().fetch(
        this.getUser.userId,
        this.getUser.token
      );
      if (fetchResult.response.data.error) {
        this.showError("사용자 정보를 불러올 수 없습니다!");
      }
      UserInfo.commit((state) => {
        state.fetching = false;
      });
    },
    updateRecipe() {
      this.$emit("update-recipe", this.result.name);
    },
    async deleteRecipe() {
      Recipe.commit((state) => {
        state.fetching = true;
      });
      const fetchResult = await Recipe.api().deleteRecipe(
        this.result.id,
        this.getUser.token
      );
      if (fetchResult.response.status !== 200) {
        this.showError("레시피를 삭제하는 데 실패하였습니다!");
      }
      Recipe.commit((state) => {
        state.fetching = false;
      });
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Jua&display=swap");
.result-element-container {
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 15%);
  width: 16vw;
}

.card-cover-container {
  display: inline-block;
  width: 100%;
  position: relative;
}

.toggle-cart-button {
  position: absolute;
  width: fit-content;
  height: fit-content;
  padding-left: 0.3vw;
  padding-right: 0.3vw;
  top: 0.3vh;
  right: 0.1vw;
  font-size: 0.6vw;
  line-height: 0.6vw;
}

.update-recipe-button {
  position: absolute;
  width: fit-content;
  height: fit-content;
  padding: 0.3vw;
  bottom: 0.3vh;
  left: 0.1vw;
  font-size: 0.6vw;
  line-height: 0.6vw;
}

.delete-recipe-button {
  position: absolute;
  width: fit-content;
  height: fit-content;
  padding: 0.3vw;
  bottom: 0.3vh;
  right: 0.1vw;
  font-size: 0.6vw;
  line-height: 0.6vw;
}

.cover-image {
  display: block;
  margin: 0px auto;
  width: 100%;
  height: 20vh;
}

.result-detail-title-container {
  width: 100%;
}

.result-detail-title-meta,
.result-detail-title-name,
.result-detail-title-calorie,
.result-detail-description {
  display: block;
  width: 100%;
  text-align: left;
  margin: 0px auto;
}

.result-detail-title-meta {
  font-size: 0.6vw;
  font-weight: bold;
  color: #f47b0f;
}

.result-detail-title-name {
  font-size: 1.2vw;
  font-family: "Jua", sans-serif;
  text-align: center;
}

.result-detail-title-calorie {
  font-size: 0.6vw;
  color: #f47b0f;
  text-align: right;
  font-weight: bold;
}
</style>
