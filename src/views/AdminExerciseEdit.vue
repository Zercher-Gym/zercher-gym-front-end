<template>
  <div class="exercise-edit">
    <h2>{{ isNew ? 'Adaugă Exercițiu' : 'Editează Exercițiu' }}</h2>

    <form @submit.prevent="save" v-if="!loading">
      <div class="form-group">
        <label>Identificator:</label>
        <input v-model="form.identifier" required />
      </div>
      <div class="form-group">
        <label>Titlu (RO):</label>
        <input v-model="form.title" required />
      </div>
      <div class="form-group">
        <label>Descriere (RO):</label>
        <textarea v-model="form.description" required></textarea>
      </div>
      <div class="form-actions">
        <router-link to="/admin/exercises" class="btn-cancel">Anulează</router-link>
        <button type="submit" :disabled="saving">{{ isNew ? 'Adaugă' : 'Salvează' }}</button>
      </div>
    </form>

    <div v-else class="loading">
      Se încarcă...
    </div>
  </div>
</template>

<script>
import { getExercise, createExercise, updateExercise } from '../services/exerciseService'

export default {
  name: 'AdminExerciseEdit',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      form: {
        identifier: '',
        title: '',
        description: ''
      },
      loading: false,
      saving: false
    }
  },
  computed: {
    isNew() {
      return !this.id
    }
  },
  methods: {
    load() {
      if (this.isNew) return

      this.loading = true
      getExercise(this.id)
        .then(res => {
          const exercise = res.data
          this.form.identifier = exercise.identifier
          const roLabel = exercise.labels?.find(label => label.language === 'RO')
          if (roLabel) {
            this.form.title = roLabel.title
            this.form.description = roLabel.description
          }
        })
        .catch(err => {
          console.error('Error loading exercise:', err)
          alert('Eroare la încărcarea exercițiului')
        })
        .finally(() => {
          this.loading = false
        })
    },
    save() {
      this.saving = true
      const payload = {
        identifier: this.form.identifier,
        labels: [{
          title: this.form.title,
          description: this.form.description,
          language: 'RO'
        }]
      }

      const action = this.isNew
        ? createExercise(payload)
        : updateExercise(this.id, payload)

      action
        .then(() => {
          this.$router.push('/admin/exercises')
        })
        .catch(err => {
          console.error('Error saving exercise:', err)
          alert('Eroare la salvarea exercițiului')
        })
        .finally(() => {
          this.saving = false
        })
    }
  },
  mounted() {
    this.load()
  }
}
</script>

<style scoped>
.exercise-edit {
  max-width: 600px;
  margin: 2rem auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  background-color: #f44336;
  color: white;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  color: #666;
}
</style> 