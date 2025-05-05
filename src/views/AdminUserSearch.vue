<template>
    <div class="admin-search-container">
      <h1>Admin User Search</h1>
      <form @submit.prevent="loadUsers">
        <input v-model="filters.username" placeholder="Username" />
        <input v-model="filters.email" placeholder="Email" />
        <button type="submit">Search</button>
      </form>
  
      <div v-if="error" class="error">{{ error }}</div>
      <ul v-else>
        <li v-for="user in users" :key="user.id">
          {{ user.username }} ({{ user.email }})
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { adminSearch } from '../services/userService.js';
  
  const filters = ref({
    page: 0,
    size: 20,
    username: '',
    email: '',
    id: '',
    enabled: true,
    locked: false
  });
  const users = ref([]);
  const error = ref('');
  
  async function loadUsers() {
    error.value = '';
    try {
      const response = await adminSearch(filters.value);
      // Assuming response.data.data.content holds the array
      users.value = response.data.data.content;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    }
  }
  </script>
  
  <style scoped>
  .admin-search-container { max-width: 600px; margin: 2rem auto; }
  .error { color: red; }
  form > input { margin-right: 0.5rem; }
  </style>
  