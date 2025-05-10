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
  import { fetchUserProfile } from '../services/userProfileService.js';
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
          const response = await signIn({ username: this.username, password: this.password });
          if (response && response.data && response.data.data) {
            // Salvează tokenul JWT
            sessionStorage.setItem('jwt', response.data.data);
            
            // Obține profilul utilizatorului pentru a avea rolurile
            try {
              console.log('Fetching user profile...');
              const profileData = await fetchUserProfile();
              console.log('User profile loaded:', profileData);
              
              // Redirecționează către dashboard
              await this.$router.push('/admin/dashboard');
            } catch (profileError) {
              console.error('Error fetching user profile:', profileError);
              // Continuă chiar dacă obținerea profilului eșuează
              await this.$router.push('/admin/dashboard');
            }
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (e) {
          console.error('Login error:', e);
          this.error = e.response?.data?.error || 'Login failed. Please try again.';
          sessionStorage.removeItem('jwt');
          sessionStorage.removeItem('userRoles');
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
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  button {
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover:not(:disabled) {
    background-color: #45a049;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .error {
    color: #f44336;
    text-align: center;
    margin-top: 1rem;
  }
  </style>