<template>
  <div class="custom-exercise-list">
    <div class="header">
      <h2>Exercitii Personalizate</h2>
    </div>

    <!-- Filters -->
    <div class="filters-container">
      <form @submit.prevent="load" class="filters">
        <div class="filter-group">
          <input v-model="filters.title" placeholder="Titlu exercitiu" />
          <input v-model="filters.username" placeholder="Username creator" />
          <input v-model="filters.id" placeholder="ID exercitiu" />
        </div>
        <div class="filter-group">
          <button type="submit" class="btn-filter">
            <i class="fas fa-search"></i> Filtreaza
          </button>
        </div>
      </form>
    </div>

    <!-- Exercises table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Titlu</th>
            <th>Descriere</th>
            <th>Creator</th>
            <th>Data Crearii</th>
            <th>Actiuni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exercise in exercises" :key="exercise.id">
            <td>{{ exercise.title }}</td>
            <td>{{ exercise.description }}</td>
            <td>{{ exercise.createdBy?.username || 'Necunoscut' }}</td>
            <td>{{ new Date(exercise.createdAt).toLocaleString() }}</td>
            <td class="actions">
              <button @click="confirmDelete(exercise.id)" class="btn-delete">
                <i class="fas fa-trash"></i> Sterge
              </button>
            </td>
          </tr>
          <tr v-if="!loading && exercises.length === 0">
            <td colspan="5" class="text-center no-data">Nu s-au gasit exercitii personalizate</td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="text-center loading">
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
import { fetchCustomExercises, deleteCustomExercise } from '../services/customExerciseService.js'
import DeleteModal from '../components/DeleteModal.vue'

export default {
  name: 'AdminCustomExerciseList',
  components: { DeleteModal },
  data() {
    return {
      filters: {
        page: 0,
        size: 10,
        title: '',
        username: '',
        id: ''
      },
      exercises: [],
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
      fetchCustomExercises(params)
        .then(res => {
          const data = res.data
          const list = Array.isArray(data)
            ? data
            : data.data || data.content || data.exercises || []
          this.exercises = list
          this.pageNumber = data.pageNumber ?? data.page ?? this.pageNumber
          this.pageSize = data.pageSize ?? data.size ?? this.pageSize
          this.totalElements = data.totalElements ?? data.total ?? list.length
        })
        .catch(err => {
          console.error('load exercises error', err)
          this.exercises = []
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
      deleteCustomExercise(id).then(() => {
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
.custom-exercise-list {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.filters-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.filters input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  outline: none;
}

.btn-filter {
  padding: 0.75rem 1.5rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-filter:hover {
  background-color: #1976D2;
  transform: translateY(-1px);
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  color: #4a5568;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-delete {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background-color: #d32f2f;
  transform: translateY(-1px);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.btn-page {
  padding: 0.75rem 1.5rem;
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-page:hover:not(:disabled) {
  background-color: #e9ecef;
  transform: translateY(-1px);
}

.btn-page:disabled {
  background-color: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.95rem;
  color: #4a5568;
}

.loading {
  padding: 2rem !important;
}

.loader {
  border: 3px solid #f3f3f3;
  border-radius: 50%;
  border-top: 3px solid #4CAF50;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data {
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
  }

  .filters input {
    width: 100%;
  }

  .btn-filter {
    width: 100%;
    justify-content: center;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    min-width: 800px;
  }
}
</style> 