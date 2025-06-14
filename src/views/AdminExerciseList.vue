<template>
  <div class="exercise-list">
    <div class="header">
      <h2>Exerciții Predefinite</h2>
      <router-link to="/admin/exercises/new" class="btn-add">Adaugă Exercițiu</router-link>
    </div>

    <!-- Filters -->
    <div class="filters-container">
      <form @submit.prevent="load" class="filters">
        <div class="filter-group">
          <input v-model="filters.identifier" placeholder="Identificator exercițiu" />
          <input v-model="filters.title" placeholder="Titlu" />
          <input v-model="filters.description" placeholder="Descriere" />
        </div>
        <div class="filter-group">
          <button type="submit" class="btn-filter">
            <i class="fas fa-search"></i> Filtrează
          </button>
        </div>
      </form>
    </div>

    <!-- Exercises table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Identificator</th>
            <th>Titlu (RO)</th>
            <th>Descriere (RO)</th>
            <th>Titlu (EN)</th>
            <th>Descriere (EN)</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exercise in exercises" :key="exercise.id">
            <td>{{ exercise.identifier }}</td>
            <td>{{ getLabel(exercise.labels, 'ro')?.title || exercise.title }}</td>
            <td>{{ getLabel(exercise.labels, 'ro')?.description || exercise.description }}</td>
            <td>{{ getLabel(exercise.labels, 'en')?.title }}</td>
            <td>{{ getLabel(exercise.labels, 'en')?.description }}</td>
            <td class="actions">
              <router-link :to="`/admin/exercises/${exercise.id}`" class="btn-edit">
                <i class="fas fa-edit"></i> Editează
              </router-link>
              <button @click="confirmDelete(exercise.id)" class="btn-delete">
                <i class="fas fa-trash"></i> Șterge
              </button>
            </td>
          </tr>
          <tr v-if="!loading && exercises.length === 0">
            <td colspan="6" class="text-center no-data">Nu s-au găsit exerciții</td>
          </tr>
          <tr v-if="loading">
            <td colspan="6" class="text-center loading">
              <div class="loader"></div>
              Se încarcă...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prev" :disabled="pageNumber <= 0 || loading">Anterior</button>
      <span>Pagina {{ pageNumber + 1 }} din {{ totalPages }}</span>
      <button @click="next" :disabled="pageNumber + 1 >= totalPages || loading">Următor</button>
    </div>

    <!-- Delete modal -->
    <DeleteModal
      v-if="showDelete"
      :id="delId"
      itemType="exercițiul"
      @confirm="doDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script>
import { fetchExercises, deleteExercise } from '../services/exerciseService'
import DeleteModal from '../components/DeleteModal.vue'

export default {
  name: 'AdminExerciseList',
  components: { DeleteModal },
  data() {
    return {
      filters: {
        page: 0,
        size: 10,
        identifier: '',
        title: '',
        description: ''
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
      
      const needsReload = sessionStorage.getItem('exerciseListNeedsReload')
      if (needsReload === 'true') {
        console.log('Exercise list needs reload flag detected, forcing reload')
        // resetam flag-ul
        sessionStorage.removeItem('exerciseListNeedsReload')
        // resetam filtrele
        this.filters = {
          identifier: '',
          title: ''
        }
      }
      
      const params = this.clean({
        ...this.filters,
        page: this.pageNumber,
        size: this.pageSize
      })
      // Adaugă și filtrarea pentru EN dacă există
      if (this.filters.titleEn) params['titleEn'] = this.filters.titleEn;
      if (this.filters.descriptionEn) params['descriptionEn'] = this.filters.descriptionEn;
      console.log('Loading exercises with params:', params)
      fetchExercises(params)
        .then(res => {
          console.log('Exercise list response:', res.data)
          
          // Check the response structure to correctly extract exercises
          let data = res.data;
          
          // Check if the response has a 'data' wrapper
          if (data && data.data) {
            console.log('Found data wrapper in response');
            data = data.data;
          }
          
          // Check if exercises are directly in an array or in the 'content' property
          if (Array.isArray(data)) {
            console.log('Response contains array of exercises');
            this.exercises = data;
          } else if (data && data.content && Array.isArray(data.content)) {
            console.log('Response contains paginated content');
            this.exercises = data.content;
          } else {
            console.warn('Could not find exercises in response, using empty array');
            this.exercises = [];
          }
          
          console.log('Exercises loaded:', this.exercises.length, 'items');
          console.log('Exercise sample:', this.exercises.length > 0 ? this.exercises[0] : 'No exercises');
          
          // Update pagination information
          this.pageNumber = data.pageNumber ?? data.page ?? this.pageNumber
          this.pageSize = data.pageSize ?? data.size ?? this.pageSize
          this.totalElements = data.totalElements ?? data.total ?? this.exercises.length
        })
        .catch(err => {
          console.error('Error loading exercises:', err)
          console.error('Error details:', err.response ? err.response.data : 'No response data')
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
    getLabel(labels, lang) {
      if (!labels) return {};
      if (Array.isArray(labels)) {
        return labels.find(l => (l.language || '').toLowerCase() === lang) || {};
      }
      if (labels[lang]) return labels[lang];
      if (labels[lang.toUpperCase()]) return labels[lang.toUpperCase()];
      if (typeof labels==='object') return Object.values(labels)[0] || {};
      return {};
    },

    confirmDelete(id) {
      this.delId = id
      this.showDelete = true
    },
    doDelete(id) {
      deleteExercise(id)
        .then(() => {
          this.showDelete = false
          this.load()
        })
        .catch(err => {
          console.error('Error deleting exercise:', err)
          alert('Eroare la ștergerea exercițiului')
        })
    }
  },
  mounted() {
    this.load()
  },
  // This will be called when navigating back to this page
  activated() {
    console.log('AdminExerciseList activated, reloading data')
    setTimeout(() => {
      this.load()
    }, 300)
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
.exercise-list { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-add { padding: 0.5rem 1.2rem; background-color: var(--color-primary); color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500; border: none; transition: background 0.2s; }
.btn-add:hover { background-color: var(--color-primary-hover); color: #fff; }
.filters-container { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
.filters { display: flex; flex-direction: column; gap: 1rem; }
.filter-group { display: flex; flex-wrap: wrap; gap: 1rem; }
.filters input { flex: 1; min-width: 180px; padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 6px; }
.btn-filter {
  padding: 0.75rem 1.5rem;
  background: #fff;
  color: var(--color-primary);
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: border 0.2s, color 0.2s, background 0.2s;
}
.btn-filter:hover {
  border-color: var(--color-primary);
  color: var(--color-primary-hover);
  background: #f6f7fe;
}
.table-container { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 2rem; }
.table-container table { width: 100%; border-collapse: collapse; }
th { background-color: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; }
.actions { display: flex; gap: 0.5rem; }
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
</style>