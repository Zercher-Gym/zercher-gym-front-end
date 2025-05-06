<template>
  <div class="confirm-email-container">
    <h1>Confirm Your Email</h1>
    <div v-if="loading">Confirming...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="success">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const token = route.query.token;
const loading = ref(true);
const error = ref('');
const message = ref('');

onMounted(async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/auth/confirm-email`,
      { params: { token } }
    );
    message.value = response.data.message || 'Your email has been confirmed!';
  } catch (err) {
    error.value = err.response?.data?.message ||
      'Confirmation failed. The link may be invalid or expired.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.confirm-email-container {
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>
