<template>
  <div class="workout-list">
    <div class="header">
      <h2>Antrenamente Predefinite</h2>
      <router-link to="/admin/workouts/new" class="btn btn-primary">Adaugă Antrenament</router-link>
    </div>

    <!-- Filters -->
    <div class="filters-container">
      <form @submit.prevent="load" class="filters">
        <div class="filter-group">
          <input v-model="filters.identifier" placeholder="Identificator antrenament" />
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

    <!-- Workouts table -->
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
          <tr v-for="workout in workouts" :key="workout.id">
            <td>{{ workout.identifier }}</td>
            <td>{{ getLabel(workout.labels, 'ro')?.title }}</td>
            <td>{{ getLabel(workout.labels, 'ro')?.description }}</td>
            <td>{{ getLabel(workout.labels, 'en')?.title }}</td>
            <td>{{ getLabel(workout.labels, 'en')?.description }}</td>
            <td class="actions">
              <router-link :to="`/admin/workouts/${workout.id}`" class="btn-edit">
                <i class="fas fa-edit"></i> Editează
              </router-link>
              <button class="btn-delete" @click="confirmDelete(workout.id)">
                <i class="fas fa-trash"></i> Șterge
              </button>
            </td>
          </tr>
          <tr v-if="!loading && workouts.length === 0">
            <td colspan="6" class="text-center no-data">Nu s-au găsit antrenamente</td>
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
      itemType="antrenamentul"
      @confirm="doDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script>
import { fetchWorkouts, deleteWorkout } from '../services/workoutService';
import DeleteModal from '../components/DeleteModal.vue';

export default {
  name: 'AdminWorkoutList',
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
      workouts: [],
      loading: false,
      showDelete: false,
      delId: null,
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalElements / this.pageSize) || 1;
    }
  },
  methods: {
    clean(obj) {
      const o = { ...obj };
      Object.keys(o).forEach(k => {
        if (o[k] === '' || o[k] === null || o[k] === undefined) {
          delete o[k];
        }
      });
      return o;
    },
    load() {
      this.loading = true;
      const params = this.clean({
        ...this.filters,
        page: this.pageNumber,
        size: this.pageSize
      });
      fetchWorkouts(params)
        .then(res => {
          let data = res.data;
          if (data && data.data) data = data.data;
          if (Array.isArray(data)) {
            this.workouts = data;
          } else if (data && data.content && Array.isArray(data.content)) {
            this.workouts = data.content;
          } else {
            this.workouts = [];
          }
          this.pageNumber = data.pageNumber ?? data.page ?? this.pageNumber;
          this.pageSize = data.pageSize ?? data.size ?? this.pageSize;
          this.totalElements = data.totalElements ?? data.total ?? this.workouts.length;
        })
        .catch(err => {
          console.error('Error loading workouts:', err);
          this.workouts = [];
        })
        .finally(() => {
          this.loading = false;
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
      this.delId = id;
      this.showDelete = true;
    },
    doDelete(id) {
      deleteWorkout(id)
        .then(() => {
          this.showDelete = false;
          this.load();
        })
        .catch(err => {
          console.error('Error deleting workout:', err);
          alert('Eroare la ștergerea antrenamentului');
        });
    }
  },
  mounted() {
    this.load();
  },
  activated() {
    // reload when navigating back
    setTimeout(() => this.load(), 300);
  }
};
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
.workout-list { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { padding: 0.5rem 1.2rem; background-color: var(--color-primary); color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500; border: none; transition: background 0.2s; }
.btn-primary:hover { background-color: var(--color-primary-hover); color: #fff; }
.filters-container { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
.filters { display: flex; flex-direction: column; gap: 1rem; }
.filter-group { display: flex; flex-wrap: wrap; gap: 1rem; }
.filters input { flex: 1; min-width: 180px; padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 6px; }
.btn-filter { padding: 0.75rem 1.5rem; background-color: var(--color-secondary); color: var(--color-secondary-text); border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; transition: background 0.2s; }
.btn-filter:hover { background-color: #e0e0e0; color: #222; }
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
