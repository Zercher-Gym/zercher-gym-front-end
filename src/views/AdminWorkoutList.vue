<template>
  <div class="workout-list">
    <div class="header">
      <h2>Antrenamente Predefinite</h2>
      <router-link to="/admin/workouts/new" class="btn-add">Adaugă Antrenament</router-link>
    </div>

    <!-- Filters -->
    <form @submit.prevent="load" class="filters">
      <input v-model="filters.identifier" placeholder="Identificator" />
      <input v-model="filters.title" placeholder="Titlu" />
      <input v-model="filters.description" placeholder="Descriere" />
      <button type="submit">Filtrează</button>
    </form>

    <!-- Workouts table -->
    <table>
      <thead>
        <tr>
          <th>Identificator</th>
          <th>Titlu</th>
          <th>Descriere</th>
          <th>Acțiuni</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="workout in workouts" :key="workout.id">
          <td>{{ workout.identifier }}</td>
          <td>{{ getRomanianLabel(workout.labels)?.title }}</td>
          <td>{{ getRomanianLabel(workout.labels)?.description }}</td>
          <td>
            <router-link :to="`/admin/workouts/${workout.id}`">Editează</router-link>
            <button @click="confirmDelete(workout.id)">Șterge</button>
          </td>
        </tr>
        <tr v-if="!loading && workouts.length === 0">
          <td colspan="4" class="text-center">Nu s-au găsit antrenamente</td>
        </tr>
        <tr v-if="loading">
          <td colspan="4" class="text-center">Se încarcă...</td>
        </tr>
      </tbody>
    </table>

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
          console.log(data);
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
    getRomanianLabel(labels) {
      if (!labels) return {};
      // If backend returns an array
      if (Array.isArray(labels)) {
        return labels.find(l => (l.language || '').toLowerCase() === 'ro') || labels[0] || {};
      }
      // If backend returns an object keyed by language (e.g., { RO: {...}, EN: {...} })
      if (labels.ro) return labels.ro;
      if (labels.RO) return labels.RO;
      // Fallback: return first value in object
      return Object.values(labels)[0] || {};
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
.workout-list { max-width: 1000px; margin: 2rem auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.btn-add { padding: 0.5rem 1rem; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
.filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.filters input { flex: 1 1 150px; padding: 0.25rem 0.5rem; }
.filters button { padding: 0.25rem 0.75rem; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd; }
th { background-color: #f5f5f5; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1rem; }
button { padding: 0.25rem 0.75rem; border: none; border-radius: 4px; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.text-center { text-align: center; }
</style>
