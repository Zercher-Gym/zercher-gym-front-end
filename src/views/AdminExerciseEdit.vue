<template>
  <div class="exercise-edit">
    <h2>{{ isNew ? 'Adaugă Exercițiu' : 'Editează Exercițiu' }}</h2>

    <form @submit.prevent="save" v-if="!loading">
      <!-- Identifier is only shown when creating a new exercise -->
      <div class="form-group" v-if="isNew">
        <label>Identificator:</label>
        <input v-model="form.identifier" required />
      </div>
      <!-- In edit mode, we display the identifier as text -->
      <div class="form-group" v-else>
        <label>Identificator:</label>
        <div class="readonly-field">{{ form.identifier }}</div>
      </div>
      <!-- Title and description can be edited in both modes -->
      <div class="form-group">
        <label>Titlu (RO):</label>
        <input v-model="form.title" required />
      </div>
      <div class="form-group">
        <label>Descriere (RO):</label>
        <textarea v-model="form.description" required></textarea>
      </div>
      <div class="form-group">
        <label>Unități (separate prin virgulă):</label>
        <input v-model="form.units" placeholder="ex: 9007199254740991" />
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
        description: '',
        units: ''
      },
      numericId: null, // adaugam id-ul numeric pentru actualizare
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
          console.log('Raw response:', res);
          const exercise = res.data;
          console.log('Loaded exercise data:', JSON.stringify(exercise, null, 2));
          
          // Analyze the data structure to find the numeric ID
          console.log('Exercise data keys:', Object.keys(exercise));
          
          // Try to find the numeric ID in different possible locations
          let foundId = null;
          
          // From logs, we observed that the numeric ID is in labels[0].id
          if (exercise.labels && exercise.labels.length > 0 && exercise.labels[0].id !== undefined) {
            foundId = exercise.labels[0].id;
            console.log('Found numeric ID in exercise.labels[0].id:', foundId);
          } else if (exercise.data && exercise.data.labels && exercise.data.labels.length > 0 && exercise.data.labels[0].id !== undefined) {
            foundId = exercise.data.labels[0].id;
            console.log('Found numeric ID in exercise.data.labels[0].id:', foundId);
          } else if (exercise.id !== undefined) {
            foundId = exercise.id;
            console.log('Found ID directly in exercise.id:', foundId);
          } else if (exercise.exerciseId !== undefined) {
            foundId = exercise.exerciseId;
            console.log('Found ID in exercise.exerciseId:', foundId);
          } else if (exercise.data && exercise.data.id !== undefined) {
            foundId = exercise.data.id;
            console.log('Found ID in exercise.data.id:', foundId);
          }
          
          // Save the numeric ID for update
          this.numericId = foundId;
          console.log('Numeric ID for update:', this.numericId);
          
          // Check if we have a valid ID
          if (this.numericId === null || this.numericId === undefined) {
            console.error('Could not find a valid numeric ID for this exercise!');
          }
          
          this.form.identifier = exercise.identifier
          const roLabel = exercise.labels?.find(label => label.language.toLowerCase() === 'ro')
          if (roLabel) {
            this.form.title = roLabel.title
            this.form.description = roLabel.description
          }
          
          if (exercise.units) {
            this.form.units = exercise.units.join(', ')
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
      
      let payload;
      let action;
      
      if (this.isNew) {
        const units = this.form.units.split(',')
          .map(u => parseInt(u.trim(), 10))
          .filter(u => !isNaN(u) && u !== null);

        payload = {
          identifier: this.form.identifier,
          labels: [{
            title: this.form.title,
            description: this.form.description,
            language: 'ro'
          }],
          units: units
        };
        
        console.log('Creating new exercise with payload:', JSON.stringify(payload));
        action = createExercise(payload);
      } else {
        payload = {
          title: this.form.title,
          description: this.form.description
        };
        
        // Folosim ID-ul numeric pentru actualizare
        console.log(`Updating exercise with numeric ID ${this.numericId} with payload:`, JSON.stringify(payload));
        action = updateExercise(this.numericId, payload);
      }

      action
        .then(response => {
          console.log('Exercise saved successfully:', response.data)
          // Force a larger delay to ensure backend processing is complete
          setTimeout(() => {
            // Set a flag in sessionStorage to indicate that the list should be reloaded
            sessionStorage.setItem('exerciseListNeedsReload', 'true')
            this.$router.push('/admin/exercises')
          }, 1000)
        })
        .catch(err => {
          console.error('Error saving exercise:', err)
          console.error('Error details:', err.response ? err.response.data : 'No response data')
          
          // Verificu0103 dacu0103 este eroarea de identificator duplicat
          if (err.response && err.response.data && err.response.data.error === 'exerciseWithIdentifierExists') {
            alert(`Identificatorul '${this.form.identifier}' existu0103 deja. Te rog alege un alt identificator.`)
          } else {
            alert(`Eroare la salvarea exercițiului: ${err.response ? err.response.data.message || err.response.statusText : err.message}`)
          }
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
.readonly-field {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #6c757d;
}

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