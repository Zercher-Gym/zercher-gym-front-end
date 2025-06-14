<template>
  <div class="user-list">
    <div class="header">
      <h2>Gestionare Utilizatori</h2>
      <router-link to="/admin/users/new" class="btn-add">Adauga Utilizator</router-link>
    </div>

    <!-- Filters -->
    <div class="filters-container">
      <form @submit.prevent="load" class="filters">
        <div class="filter-group">
          <input v-model="filters.username" placeholder="Username" />
          <input v-model="filters.email" placeholder="Email" />
          <input v-model="filters.id" placeholder="User ID" />
        </div>
        <div class="filter-group">
          <select v-model="filters.enabled">
            <option value="">Toate Statusurile</option>
            <option :value="true">Activ</option>
            <option :value="false">Inactiv</option>
          </select>
          <select v-model="filters.locked">
            <option value="">Toate Blocajele</option>
            <option :value="true">Blocat</option>
            <option :value="false">Deblocat</option>
          </select>
          <button type="submit" class="btn-filter">Filtreaza</button>
        </div>
      </form>
    </div>

    <!-- Users table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>ID</th>
            <th>Status</th>
            <th>Blocat</th>
            <th>Data Crearii</th>
            <th>Roluri</th>
            <th>Actiuni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td class="text-xs whitespace-nowrap">{{ u.id }}</td>
            <td>
              <span :class="['status-badge', u.enabled ? 'status-active' : 'status-inactive']">
                {{ u.enabled ? 'Activ' : 'Inactiv' }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', u.locked ? 'status-locked' : 'status-unlocked']">
                {{ u.locked ? 'Da' : 'Nu' }}
              </span>
            </td>
            <td>{{ new Date(u.createdAt || u.created).toLocaleString() }}</td>
            <td>
              <div class="roles-container">
                <span v-for="role in (Array.isArray(u.roles) ? u.roles : [u.roles])" 
                      :key="role" 
                      class="role-badge">
                  {{ role }}
                </span>
              </div>
            </td>
            <td class="actions">
              <router-link :to="`/admin/users/${u.id}`" class="btn-edit">
                <i class="fas fa-edit"></i> Edit
              </router-link>
              <button @click="confirmDelete(u.id)" class="btn-delete">
                <i class="fas fa-trash"></i> Delete
              </button>
            </td>
          </tr>
          <tr v-if="!loading && users.length === 0">
            <td colspan="8" class="text-center no-data">Nu s-au gasit utilizatori</td>
          </tr>
          <tr v-if="loading">
            <td colspan="8" class="text-center loading">
              <div class="loader"></div>
              Se incarca...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prev" :disabled="pageNumber <= 0 || loading" class="btn-page">
        <i class="fas fa-chevron-left"></i> Anterior
      </button>
      <span class="page-info">Pagina {{ pageNumber + 1 }} din {{ totalPages }}</span>
      <button @click="next" :disabled="pageNumber + 1 >= totalPages || loading" class="btn-page">
        Urmator <i class="fas fa-chevron-right"></i>
      </button>
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
:root {
  --color-primary: #5B47FB;
  --color-primary-hover: #4736c7;
  --color-danger: #f44336;
  --color-danger-hover: #c62828;
  --color-secondary: #f3f4f6;
  --color-secondary-text: #333;
}
.user-list { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header h2 { font-size: 1.8rem; color: #2c3e50; margin: 0; }
.btn-add { padding: 0.5rem 1.2rem; background-color: var(--color-primary); color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; border: none; transition: background 0.2s; }
.btn-add:hover { background-color: var(--color-primary-hover); color: #fff; }
.filters-container { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
.filters { display: flex; flex-direction: column; gap: 1rem; }
.filter-group { display: flex; flex-wrap: wrap; gap: 1rem; }
.filters input, .filters select { flex: 1; min-width: 160px; padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-family: inherit; }
.btn-filter { padding: 0.75rem 1.5rem; background: #fff; color: var(--color-primary); border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; transition: border 0.2s, color 0.2s, background 0.2s; }
.btn-filter:hover { border-color: var(--color-primary); color: var(--color-primary-hover); background: #f6f7fe; }
.table-container { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 2rem; }
.table-container table { width: 100%; border-collapse: collapse; font-size: 1rem; }
th { background-color: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; }
td { padding: 1rem; border-bottom: 1px solid #e0e0e0; color: #4a5568; }
.status-badge { padding: 0.25em 0.7em; border-radius: 4px; font-size: 0.95em; font-weight: 500; }
.status-active { background: #e6f4ea; color: #1b7f3a; }
.status-inactive { background: #fbe9e7; color: #c62828; }
.status-locked { background: #fbe9e7; color: #c62828; }
.status-unlocked { background: #e6f4ea; color: #1b7f3a; }
.roles-container { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.role-badge { background: #ede7f6; color: #5B47FB; border-radius: 4px; padding: 0.2em 0.7em; font-size: 0.95em; font-weight: 500; }
.actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn-edit, .btn-delete { min-width: 90px; justify-content: center; }
.btn-edit { padding: 0.5rem 1.2rem; background-color: var(--color-primary); color: #fff; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; font-weight: 500; transition: background 0.2s; }
.btn-edit:hover { background-color: var(--color-primary-hover); color: #fff; }
.btn-delete { padding: 0.5rem 1.2rem; background-color: var(--color-danger); color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; transition: background 0.2s; }
.btn-delete:hover { background-color: var(--color-danger-hover); color: #fff; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin-top: 2rem; }
.btn-page { padding: 0.75rem 1.5rem; background-color: var(--color-secondary); color: var(--color-secondary-text); border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; transition: background 0.2s; }
.btn-page:hover:not(:disabled) { background-color: #e0e0e0; }
.btn-page:disabled { background-color: #f8f9fa; color: #adb5bd; cursor: not-allowed; }
.page-info { font-size: 0.95rem; color: #4a5568; }
.loading { padding: 2rem !important; }
.loader { border: 3px solid #f3f3f3; border-radius: 50%; border-top: 3px solid #4CAF50; width: 24px; height: 24px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.no-data { color: #888; }
.text-xs { font-size: 0.75rem; }
.whitespace-nowrap { white-space: nowrap; }
</style>
