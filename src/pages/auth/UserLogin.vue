<template>
  <div class="login-container">
    <a-form
      class="login-item"
      ref="formRef"
      :model="authFormState"
      :rules="rules"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
    >
      <p class="login-header">로그인하여 당신의 식단을 관리하세요!</p>
      <a-form-item class="login-form" has-feedback name="email">
        <a-input
          v-model:value.trim="authFormState.email"
          type="email"
          size="large"
          placeholder="이메일"
        >
          <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>
      <a-form-item class="login-form" has-feedback name="password">
        <a-input
          v-model:value.trim="authFormState.password"
          type="password"
          size="large"
          autocomplete="off"
          placeholder="비밀번호"
        >
          <template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>
      <div class="login-footer">
        <div class="login-footer-container">
          <div class="login-footer-message">
            <router-link to="/register"> 아직 회원이 아니신가요? 계정을 만드세요! </router-link>
          </div>
          <a-button class="login-button" type="primary" html-type="submit">로그인</a-button>
        </div>
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
        password: ''
      }),
      rules: {
        email: [{ required: true, validator: this.validateEmail, trigger: 'change' }],
        password: [
          {
            required: true,
            validator: this.validatePassword,
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
    async handleFinish(values) {
      UserInfo.commit((state) => {
        state.fetching = true;
      });
      const actionPayload = {
        mode: 'login',
        email: values.email,
        password: values.password
      };
      try {
        await UserInfo.api().auth(actionPayload);
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
.login-container {
  display: flex;
  width: 100%;
  height: 87.5%;
  position: absolute;
  top: 12.5%;
  align-items: center;
  justify-content: center;
}

.login-item {
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
  .login-item {
    width: 60%;
  }
}

.login-header {
  width: 100%;
  font-size: large;
  margin-top: 50px;
  margin-bottom: 0;
  color: #32c2c8;
}

@media (min-width: 640px) {
  .login-header {
    font-size: xx-large;
  }
}

@media (min-width: 1920px) {
  .login-header {
    font-size: xxx-large;
  }
}

.login-form {
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
  .login-form {
    width: 550px;
  }
}

@media (min-width: 1500px) {
  .login-form {
    width: 60%;
  }
}

.login-footer {
  width: 100%;
  margin-top: 0;
  margin-bottom: 50px;
}

.login-footer-container {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.login-footer-message {
  font-size: smaller;
  color: #f7593d;
  text-decoration: underline;
  margin-left: 0;
  margin-right: 30px;
}

@media (min-width: 640px) {
  .login-footer-message {
    font-size: large;
  }

  .login-footer-message {
    margin-left: 0;
    margin-right: 150px;
  }
}

.login-button {
  background-color: #3ddbf7;
  border-color: transparent;
}

a,
a:link,
a:visited,
a:hover {
  color: inherit;
  text-decoration: inherit;
}
</style>
