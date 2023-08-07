import { createRouter, createWebHistory } from 'vue-router';

import SearchRecipe from './pages/recipe/SearchRecipe.vue';
import NotFound from './pages/NotFound.vue';
import UserLogin from './pages/auth/UserLogin.vue';
import UserRegister from './pages/auth/UserRegister.vue';
import store from './store/index.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/search' },
    {
      path: '/search',
      component: SearchRecipe
    },
    { path: '/auth', component: UserLogin, meta: { requiresUnauth: true } },
    {
      path: '/register',
      component: UserRegister,
      meta: { requiresUnauth: true }
    },
    { path: '/:notFound(.*)', component: NotFound }
  ]
});

router.beforeEach(function (to, _, next) {
  if (to.meta.requiresAuth) {
    if (store.$db().model('userinfo').all().length === 0) {
      next('/auth');
    } else {
      if (store.$db().model('userinfo').all()[0].token === null) {
        next('/auth');
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
