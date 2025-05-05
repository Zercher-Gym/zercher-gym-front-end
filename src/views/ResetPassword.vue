<template>
  <div class="reset-password-container">
    <h1>Reset Password</h1>
    <div v-if="loading && !submitted">Verifying token...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <form v-else @submit.prevent="submit">
      <div>
        <label for="password">New Password</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          minlength="8"
        />
      </div>
      <div>
        <label for="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
          minlength="8"
        />
      </div>
      <button type="submit" :disabled="submitting">Reset Password</button>
    </form>
    <div v-if="submitted" class="success">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const token = route.query.token;
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const message = ref('');
const submitted = ref(false);
const password = ref('');
const confirmPassword = ref('');

onMounted(async () => {
  try {
    // Optionally verify token validity
    await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/auth/verify-reset-token`,
      { params: { token } }
    );
  } catch (err) {
    error.value = err.response?.data?.message ||
      'Invalid or expired token.';
  } finally {
    loading.value = false;
  }
});

const submit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }
  submitting.value = true;
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`,
      { password: password.value },
      { params: { token } }
    );
    message.value = response.data.message || 'Password has been reset successfully!';
    submitted.value = true;
  } catch (err) {
    error.value = err.response?.data?.message || 'Reset failed.';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.reset-password-container {
  max-width: 400px;
  margin: 2rem auto;
}
.error {
  color: red;
}
.success {
  color: green;
}
form > div {
  margin-bottom: 1rem;
}
button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
