<template>
  <div class="exercise-list">
    <div class="header">
      <h2>Exerciții Predefinite</h2>
      <router-link to="/admin/exercises/new" class="btn-add">Adaugă Exercițiu</router-link>
    </div>

    <!-- Filters -->
    <form @submit.prevent="load" class="filters">
      <input v-model="filters.identifier" placeholder="Identificator" />
      <input v-model="filters.title" placeholder="Titlu" />
      <input v-model="filters.description" placeholder="Descriere" />
      <button type="submit">Filtrează</button>
    </form>

    <!-- Exercises table -->
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
        <tr v-for="exercise in exercises" :key="exercise.id">
          <td>{{ exercise.identifier }}</td>
          <td>{{ getRomanianLabel(exercise.labels)?.title }}</td>
          <td>{{ getRomanianLabel(exercise.labels)?.description }}</td>
          <td>
            <router-link :to="`/admin/exercises/${exercise.id}/edit`">Editează</router-link>
            <button @click="confirmDelete(exercise.id)">Șterge</button>
          </td>
        </tr>
        <tr v-if="!loading && exercises.length === 0">
          <td colspan="4" class="text-center">Nu s-au găsit exerciții</td>
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
      const params = this.clean({
        ...this.filters,
        page: this.pageNumber,
        size: this.pageSize
      })
      fetchExercises(params)
        .then(res => {
          const data = res.data
          this.exercises = data.content || []
          this.pageNumber = data.pageNumber ?? data.page ?? this.pageNumber
          this.pageSize = data.pageSize ?? data.size ?? this.pageSize
          this.totalElements = data.totalElements ?? data.total ?? this.exercises.length
        })
        .catch(err => {
          console.error('Error loading exercises:', err)
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
    getRomanianLabel(labels) {
      return labels?.find(label => label.language === 'RO')
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
  }
}
</script>

<style scoped>
.exercise-list {
  max-width: 1000px;
  margin: 2rem auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-add {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filters input {
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
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-center {
  text-align: center;
}
</style> 