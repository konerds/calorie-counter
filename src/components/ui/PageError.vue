<template>
  <a-modal
    centered
    :visible="!!error"
    @cancel="initError"
    cancelText="확인"
    :okButtonProps="{
      disabled: true,
      style: { display: 'none' }
    }"
    :cancelButtonProps="{
      style: {
        fontFamily: `'Nanum Gothic', sans-serif`
      }
    }"
  >
    <template #title>
      <span class="text-font"> 오류 </span>
    </template>
    <span class="text-font">{{ error }}</span>
  </a-modal>
</template>
<script>
export default {
  props: ['error'],
  emits: ['init-error'],
  methods: {
    initError() {
      this.$emit('init-error');
    }
  }
};
</script>

<style scoped>
.text-font {
  font-family: 'Nanum Gothic', sans-serif;
}
</style>
