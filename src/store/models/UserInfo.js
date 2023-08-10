import { Model } from '@vuex-orm/core';
import axios from 'axios';

export default class UserInfo extends Model {
  static entity = 'userinfo';
  static state() {
    return {
      fetching: false
    };
  }
  static fields() {
    return {
      userId: this.attr(null),
      nickname: this.attr(null),
      token: this.attr(null),
      favoriteRecipe: this.attr([]),
      type: this.attr(null)
    };
  }
  static apiConfig = {
    actions: {
      async auth(payload) {
        const mode = payload.mode;
        let authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
          import.meta.env.VITE_FIREBASE_API_KEY
        }`;
        if (mode === 'signup') {
          authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
            import.meta.env.VITE_FIREBASE_API_KEY
          }`;
        }
        try {
          const response = await axios.post(authUrl, {
            email: payload.email,
            password: payload.password,
            returnSecureToken: true
          });
          if (mode === 'signup') {
            const fetchResult = await this.put(
              `users/${response.data.localId}.json?auth=${response.data.idToken}`,
              {
                nickname: payload.nickname,
                favoriteRecipe: '',
                type: payload.type
              },
              {
                persistBy: 'create'
              }
            );
            if (fetchResult.response.data.error) {
              throw new Error(
                '서버와의 통신이 원활하지 않습니다! 지속되는 경우, 관리자에게 문의하세요!'
              );
            }
          }
          const fetchResult = await this.fetch(response.data.localId, response.data.idToken);
          if (fetchResult.response.data.error) {
            throw new Error('유저 정보를 불러올 수 없습니다!');
          }
        } catch (error) {
          console.error(error);
          throw new Error('인증에 실패하였습니다! 이메일과 비밀번호를 다시 확인해주세요!');
        }
      },
      fetch(userId, token) {
        return this.get(`users/${userId}.json?auth=${token}`, {
          persistBy: 'create',
          dataTransformer: (response) => {
            let filteredFavoriteRecipe = '';
            if (response.data.favoriteRecipe !== null) {
              filteredFavoriteRecipe = response.data.favoriteRecipe;
            }
            const result = {
              userId: userId,
              nickname: response.data.nickname,
              token: token,
              favoriteRecipe: filteredFavoriteRecipe,
              type: response.data.type
            };
            return result;
          }
        });
      },
      toggleCart(payload) {
        return this.patch(`users/${payload.userId}.json?auth=${payload.token}`, payload.data);
      }
    }
  };
}
