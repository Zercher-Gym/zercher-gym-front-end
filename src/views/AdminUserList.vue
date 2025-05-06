<template>
  <div class="user-list">
    <h2>Users</h2>

    <!-- Filters -->
    <form @submit.prevent="load" class="filters">
      <input v-model="filters.username" placeholder="Username" />
      <input v-model="filters.email" placeholder="Email" />
      <input v-model="filters.id" placeholder="User ID" />
      <select v-model="filters.enabled">
        <option value="">Any Enabled</option>
        <option :value="true">Enabled</option>
        <option :value="false">Disabled</option>
      </select>
      <select v-model="filters.locked">
        <option value="">Any Locked</option>
        <option :value="true">Locked</option>
        <option :value="false">Unlocked</option>
      </select>
      <button type="submit">Filter</button>
    </form>

    <!-- Users table -->
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
          <td class="text-xs whitespace-nowrap">{{ u.id }}</td>
          <td>{{ u.enabled }}</td>
          <td>{{ u.locked }}</td>
          <td>{{ new Date(u.createdAt || u.created).toLocaleString() }}</td>
          <td>{{ Array.isArray(u.roles) ? u.roles.join(', ') : u.roles }}</td>
          <td>
            <router-link :to="`/admin/users/${u.id}/edit`">Edit</router-link>
            <button @click="confirmDelete(u.id)">Delete</button>
          </td>
        </tr>
        <tr v-if="!loading && users.length === 0">
          <td colspan="8" class="text-center">No users found</td>
        </tr>
        <tr v-if="loading">
          <td colspan="8" class="text-center">Loading...</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prev" :disabled="pageNumber <= 0 || loading">Prev</button>
      <span>Page {{ pageNumber + 1 }} of {{ totalPages }}</span>
      <button @click="next" :disabled="pageNumber + 1 >= totalPages || loading">Next</button>
    </div>

    <!-- Delete modal -->
    <DeleteModal
      v-if="showDelete"
      :id="delId"
      @confirm="doDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script>
import { fetchUsers, deleteUser } from '../services/userService.js'
import DeleteModal from '../components/DeleteModal.vue'

export default {
  name: 'AdminUserList',
  components: { DeleteModal },
  data() {
    return {
      filters: {
        page: 0,
        size: 10,
        username: '',
        email: '',
        id: '',
        enabled: '',
        locked: ''
      },
      users: [],
      loading: false,
      showDelete: false,
      delId: null,
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalElements / this.pageSize) || 1
    }
  },
  methods: {
    clean(obj) {
      const o = { ...obj }
      Object.keys(o).forEach(k => {
        if (o[k] === '' || o[k] === null || o[k] === undefined) {
          delete o[k]
        }
      })
      return o
    },
    load() {
      this.loading = true
      const params = this.clean({
        ...this.filters,
        page: this.pageNumber,
        size: this.pageSize
      })
      fetchUsers(params)
        .then(res => {
          const data = res.data
          // Accept several response shapes
          const list = Array.isArray(data)
            ? data
            : data.data || data.content || data.users || []
          this.users = list
          this.pageNumber = data.pageNumber ?? data.page ?? this.pageNumber
          this.pageSize = data.pageSize ?? data.size ?? this.pageSize
          this.totalElements = data.totalElements ?? data.total ?? list.length
        })
        .catch(err => {
          console.error('load users error', err)
          this.users = []
        })
        .finally(() => {
          this.loading = false
        })
    },
    prev() {
      if (this.pageNumber > 0) {
        this.pageNumber--
        this.load()
      }
    },
    next() {
      if (this.pageNumber + 1 < this.totalPages) {
        this.pageNumber++
        this.load()
      }
    },
    confirmDelete(id) {
      this.delId = id
      this.showDelete = true
    },
    doDelete(id) {
      deleteUser(id).then(() => {
        this.showDelete = false
        this.load()
      })
    }
  },
  mounted() {
    this.load()
  }
}
</script>

<style scoped>
.user-list {
  max-width: 1000px;
  margin: 2rem auto;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.filters input,
.filters select {
  flex: 1 1 150px;
  padding: 0.25rem 0.5rem;
}
.filters button {
  padding: 0.25rem 0.75rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}
.pagination {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.text-xs {
  font-size: 0.75rem;
}
.whitespace-nowrap {
  white-space: nowrap;
}
</style>
