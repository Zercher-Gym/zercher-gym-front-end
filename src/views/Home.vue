
// src/views/Home.vue
<template>
  <div class="home-container">
    <h1>Welcome to the App</h1>
    <p>Please confirm your email or reset your password:</p>
    <div class="links">
      <router-link to="/confirm-email">Confirm Email</router-link>
      |
      <router-link to="/reset-password">Reset Password</router-link>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed for the static home page
</script>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
}
.links {
  margin-top: 1rem;
}
.links a {
  margin: 0 0.5rem;
  text-decoration: underline;
  color: #42b983;
}
</style>
