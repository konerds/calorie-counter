<template>
  <div class="filter-container">
    <div class="filter-item">
      <a-avatar class="filter-item-element" :src="filterIcon" />
      <div class="filter-item-element">{{ ingredient[0].name }}</div>
      <MinusOutlined class="filter-item-element" @click="unselectIngredient()" />
    </div>
  </div>
</template>

<script>
import { MinusOutlined } from '@ant-design/icons-vue';
export default {
  emits: ['unselect'],
  props: ['type', 'ingredient'],
  components: {
    MinusOutlined
  },
  computed: {
    filterIcon() {
      if (this.type === 'exist') {
        return '/assets/check-yes.svg';
      } else {
        return '/assets/check-no.svg';
      }
    }
  },
  methods: {
    unselectIngredient() {
      this.$emit('unselect', this.ingredient[0].name, this.type);
    }
  }
};
</script>

<style scoped>
.filter-container {
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 15%);
  border-radius: 20px;
}

.filter-item {
  display: flex;
  height: 6vh;
  align-items: center;
  padding-left: 0.5vw;
  padding-right: 0.5vw;
}

.filter-item-element {
  flex: 1 1 auto;
}

.filter-item-element:nth-child(2) {
  margin-left: 0.3vw;
  margin-right: 0.3vw;
}
</style>
