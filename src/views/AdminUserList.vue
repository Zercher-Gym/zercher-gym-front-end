<template>
    <div class="user-list">
      <h2>Users</h2>
      <form @submit.prevent="load">
        <input v-model="filters.username" placeholder="Username filter" />
        <input v-model="filters.email" placeholder="Email filter" />
        <button type="submit">Filter</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>ID</th>
            <th>Enabled</th>
            <th>Locked</th>
            <th>Created At</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.id }}</td>
            <td>{{ u.enabled }}</td>
            <td>{{ u.locked }}</td>
            <td>{{ new Date(u.createdAt).toLocaleString() }}</td>
            <td>{{ u.roles.join(', ') }}</td>
            <td>
              <router-link :to="`/admin/users/${u.id}/edit`">Edit</router-link>
              <button @click="confirmDelete(u.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button @click="prev" :disabled="pageNumber <= 0">Prev</button>
        <span>Page {{ pageNumber + 1 }} of {{ totalPages }}</span>
        <button @click="next" :disabled="pageNumber + 1 >= totalPages">Next</button>
      </div>
      <DeleteModal
        v-if="showDelete"
        :id="delId"
        @confirm="doDelete"
        @cancel="showDelete = false"
      />
    </div>
  </template>
  
  <script>
  import { fetchUsers, deleteUser } from '../services/userService.js';
  import DeleteModal from '../components/DeleteModal.vue';
  export default {
    name: 'AdminUserList',
    components: { DeleteModal },
    data() {
      return {
        filters: { page: 0, size: 10, username: '', email: '' },
        users: [],
        showDelete: false,
        delId: null,
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
      };
    },
    computed: {
      totalPages() {
        return Math.ceil(this.totalElements / this.pageSize);
      }
    },
    methods: {
      load() {
        const params = { ...this.filters, page: this.pageNumber, size: this.pageSize };
        fetchUsers(params).then(res => {
          const resp = res.data;
          this.users = resp.data;
          this.pageNumber = resp.pageNumber;
          this.pageSize = resp.pageSize;
          this.totalElements = resp.totalElements;
        });
      },
      prev() {
        if (this.pageNumber > 0) {
          this.pageNumber--;
          this.load();
        }
      },
      next() {
        if (this.pageNumber + 1 < this.totalPages) {
          this.pageNumber++;
          this.load();
        }
      },
      confirmDelete(id) {
        this.delId = id;
        this.showDelete = true;
      },
      doDelete(id) {
        deleteUser(id).then(() => {
          this.showDelete = false;
          this.load();
        });
      }
    },
    mounted() {
      this.load();
    }
  };
  </script>
  
  <style scoped>
  .user-list { max-width: 800px; margin: 2rem auto; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
  .pagination { margin-top: 1rem; display: flex; align-items: center; gap: 1rem; }
  </style>