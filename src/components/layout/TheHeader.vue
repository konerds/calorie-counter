<template>
  <a-row class="header-container">
    <a-col class="header-item">
      <router-link to="/search"><img class="header-icon" src="/assets/logo.jpg" /> </router-link>
    </a-col>
    <a-col class="header-item"></a-col>
    <a-col class="header-item">
      <div id="auth-btn">
        <router-link v-if="!isLoggedIn" to="/auth"
          ><a-avatar class="header-avatar" src="/assets/account.svg" :size="60" />
        </router-link>
        <div v-else>
          <a-dropdown-button>
            <UserOutlined />{{ userNickname }}
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="logout">
                  <LogoutOutlined />
                  <span class="menu-text">로그아웃</span>
                </a-menu-item>
                <a-menu-item v-if="getUser.type === 0" key="create" @click="showCreateRecipe">
                  <AppstoreAddOutlined />
                  <span class="menu-text">나만의 레시피 만들기</span>
                </a-menu-item>
                <a-menu-item v-if="getUser.type === 1" key="admin" @click="showAdmin">
                  <SettingOutlined />
                  관리자 페이지
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown-button>
        </div>
      </div>
    </a-col>
  </a-row>
</template>

<script>
import UserInfo from '../../store/models/UserInfo.js';
import {
  UserOutlined,
  AppstoreAddOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons-vue';
export default {
  components: {
    UserOutlined,
    AppstoreAddOutlined,
    LogoutOutlined,
    SettingOutlined
  },
  emits: ['show-create', 'show-admin'],
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
    isLoggedIn() {
      return !!this.getUser.token;
    },
    userNickname() {
      return this.getUser.nickname;
    }
  },
  methods: {
    logout() {
      UserInfo.deleteAll();
      this.$router.replace('/auth');
    },
    showCreateRecipe() {
      this.$emit('show-create');
    },
    showAdmin() {
      this.$emit('show-admin', true);
    }
  }
};
</script>

<style scoped>
* {
  font-family: 'Nanum Gothic', sans-serif;
}

.header-container {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.header-item:nth-child(1) {
  margin-left: 30px;
}

.header-item:nth-child(3) {
  margin-right: 30px;
}

.header-icon {
  width: 100px;
}

@media (min-width: 500px) {
  .header-icon {
    width: 140px;
  }
  .header-avatar {
    width: 75px !important;
    height: 75px !important;
    line-height: 75px !important;
    font-size: 18px !important;
  }
}

.menu-text {
  font-family: 'Nanum Gothic', sans-serif;
}

a,
a:link,
a:visited,
a:hover {
  color: inherit;
  text-decoration: inherit;
}
</style>
