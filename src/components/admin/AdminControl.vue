<template>
  <div class="admin-container">
    <a-menu v-model:selectedKeys="current" mode="horizontal">
      <a-menu-item key="ingredient">
        <template #icon>
          <SettingOutlined />
        </template>
      </a-menu-item>
      <a-menu-item key="user">
        <template #icon>
          <UserOutlined />
        </template>
      </a-menu-item>
    </a-menu>
    <div class="admin-container line-break" v-if="current[0] === 'ingredient'">
      <a-list
        :grid="{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 }"
        :data-source="formData"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-card>
              <template #title>
                {{ item.id }}
              </template>
              <a-input v-model:value.trim="formData[item.id].name" type="text"> </a-input>
              <a-input v-model:value.trim="formData[item.id].carbByUnit" type="text">
                <template #prefix>탄수화물</template>
              </a-input>
              <a-input v-model:value.trim="formData[item.id].proteinByUnit" type="text">
                <template #prefix>단백질</template>
              </a-input>
              <a-input v-model:value.trim="formData[item.id].fatByUnit" type="text">
                <template #prefix>지방</template>
              </a-input>
              <a-input v-model:value.trim="formData[item.id].sodiumByUnit" type="text">
                <template #prefix>나트륨</template>
              </a-input>
              <a-button @click="updateIngredient(formData[item.id])">재료 수정</a-button>
            </a-card>
          </a-list-item>
        </template>
      </a-list>
    </div>
    <div class="admin-container line-break" v-if="current[0] === 'user'">사용자 관리</div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { SettingOutlined, UserOutlined } from '@ant-design/icons-vue';
import UserInfo from '../../store/models/UserInfo.js';
import Ingredient from '../../store/models/Ingredient.js';
export default {
  components: {
    SettingOutlined,
    UserOutlined
  },
  data() {
    return {
      formData: reactive([]),
      current: ref(['ingredient'])
    };
  },
  mounted() {
    this.formData = Array.from(Ingredient.all());
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
    }
  },
  methods: {
    async updateIngredient(ingredient) {
      Ingredient.commit((state) => {
        state.fetching = true;
      });
      const payload = {
        index: +ingredient.id,
        token: this.getUser.token,
        data: {
          id: +ingredient.id,
          name: ingredient.name,
          carbByUnit: ingredient.carbByUnit,
          proteinByUnit: ingredient.proteinByUnit,
          fatByUnit: ingredient.fatByUnit,
          sodiumByUnit: ingredient.sodiumByUnit
        }
      };
      const result = await Ingredient.api().updateIngredient(payload);
      if (result.response.data.error) {
        this.showError('재료를 수정하는 데 실패하였습니다!');
      }
      this.formData = Array.from(Ingredient.all());
      Ingredient.commit((state) => {
        state.fetching = false;
      });
    },
    showError(error) {
      this.$emit('show-error', error);
    }
  }
};
</script>

<style scoped>
.admin-container {
}

.admin-content {
  display: block;
}

.line-break {
  width: 100%;
  margin: 0px auto;
  text-align: center;
}
</style>
