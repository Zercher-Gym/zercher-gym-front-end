<template>
    <div class="login-container">
      <h1>Admin Sign In</h1>
      <form @submit.prevent="submit">
        <div>
          <label for="username">Username</label>
          <input id="username" v-model="username" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input id="password" type="password" v-model="password" required />
        </div>
        <button :disabled="loading">{{ loading ? 'Signing in…' : 'Sign In' }}</button>
        <div v-if="error" class="error">{{ error }}</div>
      </form>
    </div>
  </template>
  
  <script>
  import { signIn } from '../services/authService.js';
  export default {
    name: 'Login',
    data() {
      return {
        username: '',
        password: '',
        loading: false,
        error: ''
      };
    },
    methods: {
      async submit() {
        this.error = '';
        this.loading = true;
        try {
          await signIn({ username: this.username, password: this.password });
          this.$router.push('/admin/users');
        } catch (e) {
          this.error = e.response?.data?.error || 'Login failed';
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 2rem auto;
    text-align: center;
  }
  .error { color: red; margin-top: 1rem; }
  button { margin-top: 1rem; padding: 0.5rem 1rem; }
  </style>