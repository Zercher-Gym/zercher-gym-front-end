<template>
  <div class="custom-workout-list">
    <div class="header">
      <h2>Antrenamente Personalizate</h2>
    </div>

    <!-- Filters -->
    <div class="filters-container">
      <form @submit.prevent="load" class="filters">
        <div class="filter-group">
          <input v-model="filters.identifier" placeholder="Identificator antrenament" />
          <input v-model="filters.title" placeholder="Titlu antrenament" />
          <input v-model="filters.username" placeholder="Username creator" />
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
            <th>Titlu</th>
            <th>Descriere</th>
            <th>Creator</th>
            <th>Data Creării</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="workout in workouts" :key="workout.id">
            <td>{{ workout.identifier }}</td>
            <td>{{ workout.title || getRomanianLabel(workout.labels).title }}</td>
            <td>{{ workout.description || getRomanianLabel(workout.labels).description }}</td>
            <td>{{ workout.createdBy?.username || 'Necunoscut' }}</td>
            <td>{{ new Date(workout.createdAt).toLocaleString() }}</td>
            <td class="actions">
              <button @click="confirmDelete(workout.id)" class="btn-delete">
                <i class="fas fa-trash"></i> Șterge
              </button>
            </td>
          </tr>
          <tr v-if="!loading && workouts.length === 0">
            <td colspan="6" class="text-center no-data">Nu s-au găsit antrenamente personalizate</td>
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
      <button @click="prev" :disabled="pageNumber <= 0 || loading" class="btn-page">
        <i class="fas fa-chevron-left"></i> Anterior
      </button>
      <span class="page-info">Pagina {{ pageNumber + 1 }} din {{ totalPages }}</span>
      <button @click="next" :disabled="pageNumber + 1 >= totalPages || loading" class="btn-page">
        Următor <i class="fas fa-chevron-right"></i>
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
import { fetchCustomWorkouts, deleteCustomWorkout } from '../services/customWorkoutService.js';
import DeleteModal from '../components/DeleteModal.vue';

export default {
  name: 'AdminCustomWorkoutList',
  components: { DeleteModal },
  data() {
    return {
      filters: {
        page: 0,
        size: 10,
        identifier: '',
        title: '',
        username: ''
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
        if (o[k] === '' || o[k] === null || o[k] === undefined) delete o[k];
      });
      return o;
    },
    getRomanianLabel(labels) {
      if (!labels) return {};
      if (Array.isArray(labels)) {
        return labels.find(l => (l.language || '').toLowerCase() === 'ro') || labels[0] || {};
      }
      if (labels.ro) return labels.ro;
      if (labels.RO) return labels.RO;
      return Object.values(labels)[0] || {};
    },
    load() {
      this.loading = true;
      const params = this.clean({
        ...this.filters,
        page: this.pageNumber,
        size: this.pageSize
      });
      fetchCustomWorkouts(params)
        .then(res => {
          const data = res.data;
          const list = Array.isArray(data) ? data : data.data || data.content || data.workouts || [];
          this.workouts = list;
          this.pageNumber = data.pageNumber ?? data.page ?? this.pageNumber;
          this.pageSize = data.pageSize ?? data.size ?? this.pageSize;
          this.totalElements = data.totalElements ?? data.total ?? list.length;
        })
        .catch(err => {
          console.error('Error loading custom workouts', err);
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
    confirmDelete(id) {
      this.delId = id;
      this.showDelete = true;
    },
    doDelete(id) {
      deleteCustomWorkout(id)
        .then(() => {
          this.showDelete = false;
          this.load();
        })
        .catch(err => {
          console.error('Error deleting custom workout', err);
          alert('Eroare la ștergerea antrenamentului');
        });
    }
  },
  mounted() {
    this.load();
  }
};
</script>

<style scoped>
/* Basic style inherits from custom exercise list; duplicated minimal essentials */
.custom-workout-list { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.filters-container { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
.filters { display: flex; flex-direction: column; gap: 1rem; }
.filter-group { display: flex; flex-wrap: wrap; gap: 1rem; }
.filters input { flex: 1; min-width: 200px; padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 6px; }
.btn-filter { padding: 0.75rem 1.5rem; background-color: #2196F3; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.table-container { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 2rem; }
.table-container table { width: 100%; border-collapse: collapse; }
th { background-color: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; }
.actions { display: flex; gap: 0.5rem; }
.btn-delete { padding: 0.5rem 1rem; background-color: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin-top: 2rem; }
.btn-page { padding: 0.75rem 1.5rem; background-color: #f8f9fa; color: #2c3e50; border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.btn-page:hover:not(:disabled) { background-color: #e9ecef; }
.btn-page:disabled { background-color: #f8f9fa; color: #adb5bd; cursor: not-allowed; }
.page-info { font-size: 0.95rem; color: #4a5568; }
.loading { padding: 2rem !important; }
.loader { border: 3px solid #f3f3f3; border-radius: 50%; border-top: 3px solid #4CAF50; width: 24px; height: 24px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
