<template>
  <div class="register-container">
    <a-form
      class="register-item"
      ref="formRef"
      :model="authFormState"
      :rules="rules"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
    >
      <a-form-item class="register-form" has-feedback name="email">
        <a-input v-model:value.trim="authFormState.email" type="email" placeholder="이메일">
          <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>
      <a-form-item class="register-form" has-feedback name="password">
        <a-input-password
          v-model:value.trim="authFormState.password"
          type="password"
          autocomplete="off"
          placeholder="비밀번호"
        >
          <template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input-password>
      </a-form-item>
      <a-form-item class="register-form" has-feedback name="repassword">
        <a-input-password
          v-model:value.trim="authFormState.repassword"
          type="password"
          autocomplete="off"
          placeholder="비밀번호 확인"
        >
          <template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input-password>
      </a-form-item>
      <a-form-item class="register-form" has-feedback name="nickname">
        <a-input
          class="register-form-nickname"
          v-model:value.trim="authFormState.nickname"
          type="text"
          placeholder="닉네임"
        >
        </a-input>
      </a-form-item>
      <div class="register-form">
        <a-button class="register-button" type="primary" html-type="submit">회원가입</a-button>
      </div>
    </a-form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue';
import UserInfo from '../../store/models/UserInfo.js';
export default {
  components: {
    LockOutlined,
    UserOutlined
  },
  emits: ['show-error'],
  data() {
    return {
      formRef: ref(),
      authFormState: reactive({
        email: '',
        password: '',
        repassword: '',
        nickname: ''
      }),
      rules: {
        email: [{ required: true, validator: this.validateEmail, trigger: 'change' }],
        password: [
          {
            required: true,
            validator: this.validatePassword,
            trigger: 'change'
          }
        ],
        repassword: [
          {
            validator: this.validateRepassword,
            trigger: 'change'
          }
        ],
        nickname: [
          {
            required: true,
            validator: this.validateNickname,
            trigger: 'change'
          }
        ]
      }
    };
  },
  methods: {
    async validateEmail(rule, value) {
      if (value === '') {
        return Promise.reject(new Error('이메일 주소를 입력해주세요'));
      } else if (!value.includes('@')) {
        return Promise.reject(new Error('올바른 이메일 주소를 입력해주세요'));
      } else {
        return Promise.resolve();
      }
    },
    async validatePassword(rule, value) {
      if (value === '') {
        return Promise.reject(new Error('비밀번호를 입력해주세요'));
      } else if (value.length < 6) {
        return Promise.reject(new Error('비밀번호는 최소 6자리 이상입니다'));
      } else {
        return Promise.resolve();
      }
    },
    async validateRepassword(rule, value) {
      if (value === '' || value !== this.authFormState.password) {
        return Promise.reject(new Error('비밀번호를 정확하게 입력해주세요'));
      } else if (value.length < 6) {
        return Promise.reject(new Error('비밀번호는 최소 6자리 이상입니다'));
      } else {
        return Promise.resolve();
      }
    },
    async validateNickname(rule, value) {
      if (value === '') {
        return Promise.reject(new Error('닉네임을 입력해주세요'));
      }
      return Promise.resolve();
    },
    async handleFinish(values) {
      UserInfo.commit((state) => {
        state.fetching = true;
      });
      const actionPayload = {
        mode: 'signup',
        email: values.email,
        password: values.password
      };
      try {
        await UserInfo.api().auth({
          ...actionPayload,
          nickname: values.nickname,
          type: 0
        });
        const redirectUrl = '/' + (this.$route.query.redirect || 'search');
        this.$router.replace(redirectUrl);
      } catch (authError) {
        this.showError(authError.message || '인증 과정에서 문제가 발생하였습니다');
      }
      UserInfo.commit((state) => {
        state.fetching = false;
      });
    },
    handleFinishFailed(errors) {
      this.showError('입력 데이터를 다시 한 번 확인해주세요' || errors);
    },
    showError(error) {
      this.$emit('show-error', error);
    }
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  width: 100%;
  height: 87.5%;
  position: absolute;
  top: 12.5%;
  align-items: center;
  justify-content: center;
}

.register-item {
  width: 90%;
  height: 50%;
  border-radius: 60px;
  background-color: white;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 25%);
}

@media (min-width: 1024px) {
  .register-item {
    width: 60%;
  }
}

.register-form {
  width: 320px;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}

@media (min-width: 640px) {
  .register-form {
    width: 550px;
  }
}

@media (min-width: 1500px) {
  .register-form {
    width: 60%;
  }
}

.register-form:nth-child(1) {
  margin-top: 4vh;
}

.register-button {
  background-color: #3ddbf7;
  border-color: transparent;
  margin-bottom: 4vh;
}
</style>
