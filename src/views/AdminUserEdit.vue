<template>
    <div class="edit-form">
      <h2>Edit User</h2>
      <form @submit.prevent="save">
        <div><label for="username">Username<input id="username" v-model="user.username" /></label></div>
        <div><label for="email">Email<input id="email" v-model="user.email" /></label></div>
        <div><label><input type="checkbox" v-model="user.enabled" /> Enabled</label></div>
        <div><label><input type="checkbox" v-model="user.locked" /> Locked</label></div>
        <button type="submit">Save</button>
      </form>
    </div>
  </template>
  
  <script>
  import { fetchUsers, updateUser } from '../services/userService.js';
  export default {
    name: 'AdminUserEdit',
    props: ['id'],
    data() {
      return { user: { username: '', email: '', enabled: false, locked: false } };
    },
    mounted() {
      fetchUsers({ page: 0, size: 1, id: this.id }).then(res => {
        const found = res.data.data.content[0];
        if (found) Object.assign(this.user, found);
      });
    },
    methods: {
      async save() {
        await updateUser(this.id, this.user);
        this.$router.push('/admin/users');
      }
    }
  };
  </script>


<style scoped>
.edit-form { max-width: 400px; margin: 2rem auto; }
form > div { margin-bottom: 1rem; }
button { padding: 0.5rem 1rem; }
</style>
