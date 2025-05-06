import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import ConfirmEmail from '../views/ConfirmEmail.vue';
import ResetPassword from '../views/ResetPassword.vue';
import AdminUserList from '../views/AdminUserList.vue';
import AdminUserEdit from '../views/AdminUserEdit.vue';

const routes = [
  // default to login
  { path: '/', name: 'Login', component: Login },
  { path: '/confirm-email', name: 'ConfirmEmail', component: ConfirmEmail },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  // post-login admin routes
  { path: '/admin/users', name: 'AdminUserList', component: AdminUserList, meta: { requiresAuth: true } },
  { path: '/admin/users/:id/edit', name: 'AdminUserEdit', component: AdminUserEdit, props: true, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const publicPages = ['Login', 'ConfirmEmail', 'ResetPassword'];

router.beforeEach((to, from, next) => {
    const token = sessionStorage.getItem('jwt');
    const authRequired = !publicPages.includes(to.name);
    if (authRequired && !token) {
      next({ name: 'Login' });
    } else {
      next();
    }
  });

export default router;