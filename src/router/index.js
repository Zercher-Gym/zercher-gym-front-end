import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import ConfirmEmail from '../views/ConfirmEmail.vue';
import ResetPassword from '../views/ResetPassword.vue';
import AdminUserList from '../views/AdminUserList.vue';
import AdminUserEdit from '../views/AdminUserEdit.vue';
import AdminExerciseList from '../views/AdminExerciseList.vue';
import AdminExerciseEdit from '../views/AdminExerciseEdit.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import AdminCustomExerciseList from '../views/AdminCustomExerciseList.vue';
import AdminExerciseSettings from '../views/AdminExerciseSettings.vue';

const routes = [
  // default to login
  { path: '/', name: 'Login', component: Login },
  { path: '/confirm-email', name: 'ConfirmEmail', component: ConfirmEmail },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  // post-login admin routes
  { path: '/admin/dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/admin/users', name: 'AdminUserList', component: AdminUserList, meta: { requiresAuth: true } },
  { path: '/admin/users/new', name: 'AdminUserNew', component: AdminUserEdit, meta: { requiresAuth: true } },
  { path: '/admin/users/:id', name: 'AdminUserEdit', component: AdminUserEdit, props: true, meta: { requiresAuth: true } },
  { path: '/admin/exercises', name: 'AdminExerciseList', component: AdminExerciseList, meta: { requiresAuth: true } },
  { path: '/admin/exercises/new', name: 'AdminExerciseNew', component: AdminExerciseEdit, meta: { requiresAuth: true } },
  { path: '/admin/exercises/:id', name: 'AdminExerciseEdit', component: AdminExerciseEdit, props: true, meta: { requiresAuth: true } },
  {
    path: '/admin/exercises/custom',
    name: 'AdminCustomExerciseList',
    component: AdminCustomExerciseList,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/exercises/settings',
    name: 'AdminExerciseSettings',
    component: AdminExerciseSettings,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Lista de rute publice care nu necesita autentificare
const publicPages = ['Login', 'ConfirmEmail', 'ResetPassword'];

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('jwt');
  const authRequired = !publicPages.includes(to.name);
  
  // Verifica daca ruta necesita autentificare
  if (authRequired) {
    // Daca nu exista token, redirectioneaza la login
    if (!token) {
      next({ name: 'Login' });
      return;
    }
    
    // Verifica daca token-ul este expirat
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (tokenData.exp * 1000 < Date.now()) {
        sessionStorage.removeItem('jwt');
        next({ name: 'Login' });
        return;
      }
    } catch (e) {
      sessionStorage.removeItem('jwt');
      next({ name: 'Login' });
      return;
    }
  }
  
  // Daca utilizatorul este autentificat si incearca sa acceseze pagina de login,
  // redirectioneaza-l la dashboard
  if (to.name === 'Login' && token) {
    next({ name: 'AdminDashboard' });
    return;
  }
  
  next();
});

export default router;