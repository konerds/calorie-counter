<template>
  <div class="result-container">
    <a-card :style="{ backgroundColor: '#d5e3e6' }">
      <p class="header-title">
        {{ headerMessage }}
      </p>
      <div class="result-item-container">
        <div class="result-item-element" v-for="result in filteredResult" :key="result">
          <result-element
            type="search-list"
            :result="result"
            :bordered="false"
            @show-detail="showDetail"
            @update-recipe="updateRecipe"
          ></result-element>
        </div>
      </div>
      <a-pagination
        v-model:current="currentPage"
        :page-size-options="pageSizeOptions"
        :total="rawResult.length"
        show-size-changer
        :page-size="pageSize"
        @showSizeChange="onShowSizeChange"
      >
        <template #buildOptionText="props">
          <span v-if="props.value !== '50'">페이지 당 {{ props.value }}개 조회</span>
          <span v-else>페이지 당 {{ props.value }}개 조회</span>
        </template>
      </a-pagination>
    </a-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import Recipe from '../../store/models/Recipe.js';
import ResultElement from './ResultElement.vue';
export default {
  components: {
    ResultElement
  },
  props: ['searched-result', 'keyword'],
  emits: ['show-detail', 'update-recipe'],
  data() {
    return {
      currentPage: ref(1),
      pageSize: ref(12),
      pageSizeOptions: ref(['12', '24', '36', '48', '60'])
    };
  },
  watch: {
    searchedResult(val, preVal) {
      this.currentPage = 1;
    }
  },
  computed: {
    rawResult() {
      if (this.searchedResult.length === 0 && this.keyword.length === 0) {
        return Recipe.all();
      }
      return this.searchedResult;
    },
    filteredResult() {
      const result = [];
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = this.currentPage * this.pageSize;
      for (let index in this.rawResult) {
        if (index >= startIndex && index < endIndex) {
          result.push(this.rawResult[index]);
        }
      }
      return result;
    },
    headerMessage() {
      if (this.keyword === '') {
        return '총 ' + this.rawResult.length + ' 개의 레시피가 존재합니다';
      } else if (this.rawResult.length === 0) {
        return `"` + this.keyword + `" 키워드에 대한 레시피 검색 결과가 없습니다`;
      } else {
        return (
          `"` + this.keyword + `" 키워드에 대한 ` + this.rawResult.length + '개의 레시피 검색 결과'
        );
      }
    }
  },
  methods: {
    showDetail(recipeId) {
      this.$emit('show-detail', recipeId);
    },
    onShowSizeChange(currentPage, pageSize) {
      this.pageSize = pageSize;
    },
    updateRecipe(recipeName) {
      this.$emit('update-recipe', recipeName);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');
.result-container {
  width: 100%;
  background-color: #d5e3e6;
}

.header-title {
  margin: 0;
  font-size: x-large;
  font-family: 'Jua', sans-serif;
}

.result-item-container {
  width: 100%;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(1, minmax(100px, 1fr));
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 32px;
}

@media (min-width: 640px) {
  .result-item-container {
    grid-template-columns: repeat(3, minmax(100px, 1fr));
  }
}

@media (min-width: 1920px) {
  .result-item-container {
    grid-template-columns: repeat(5, minmax(100px, 1fr));
  }
}

.result-item-element {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-top: 20px;
}

@media (max-width: 375px) {
  .ant-pagination-item-4 {
    display: none !important;
  }
}
</style>
