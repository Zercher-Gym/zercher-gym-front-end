<template>
  <div class="exercise-edit card">
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
      <!-- Titlu și descriere -->
      <div class="form-group">
        <label>Titlu (RO):</label>
        <input v-model="form.ro.title" required />
      </div>
      <div class="form-group">
        <label>Descriere (RO):</label>
        <textarea v-model="form.ro.description" required></textarea>
      </div>
      <div class="form-group">
        <label>Titlu (EN):</label>
        <input v-model="form.en.title" required />
      </div>
      <div class="form-group">
        <label>Descriere (EN):</label>
        <textarea v-model="form.en.description" required></textarea>
      </div>
      <div class="form-group">
        <label>Unitate{{ isNew ? ' (selectează una sau mai multe)' : '' }}:</label>
        <MultiSelectDropdown
          v-model="selectedUnitIds"
          :options="unitsList"
          label-field="code"
          value-field="id"
          placeholder="Selectează unități"
        />
      </div>
      <div class="form-actions">
        <router-link to="/admin/exercises" class="btn btn-secondary">Anulează</router-link>
        <button type="submit" :disabled="saving" class="btn btn-primary">{{ isNew ? 'Adaugă' : 'Salvează' }}</button>
      </div>
    </form>

    <div v-else class="loading">
      Se încarcă...
    </div>
  </div>
</template>

<script>
import { getExercise, createExercise, updateExercise, updateExerciseUnits } from '../services/exerciseService'
import { fetchUnits } from '../services/unitService'
import MultiSelectDropdown from '../components/MultiSelectDropdown.vue'

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
        ro: { title: '', description: '' },
        en: { title: '', description: '' }
      },
      labelsMap: {}, // { lang: { title, description, id } }
      selectedUnitIds: [],
      unitsList: [],
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
  components: { MultiSelectDropdown },
  methods: {
    load() {
      if (this.isNew) return

      this.loading = true
      getExercise(this.id)
        .then(res => {
          const wrapper = res.data;
          const exercise = wrapper && wrapper.data ? wrapper.data : wrapper;
          this.form.identifier = exercise.identifier || '';
          let foundId = null;
          if (exercise.labels && exercise.labels.length > 0 && exercise.labels[0].id !== undefined) {
            foundId = exercise.labels[0].id;
          } else if (exercise.data && exercise.data.labels && exercise.data.labels.length > 0 && exercise.data.labels[0].id !== undefined) {
            foundId = exercise.data.labels[0].id;
          } else if (exercise.id !== undefined) {
            foundId = exercise.id;
          } else if (exercise.exerciseId !== undefined) {
            foundId = exercise.exerciseId;
          } else if (exercise.data && exercise.data.id !== undefined) {
            foundId = exercise.data.id;
          }
          this.numericId = foundId;
          this.labelsMap = {};
          if (Array.isArray(exercise.labels)) {
            exercise.labels.forEach(l=>{
              const lang = (l.language||'ro').toLowerCase();
              this.labelsMap[lang] = { title:l.title, description:l.description, id:l.id ?? l.labelId };
            });
          } else if (exercise.labels && typeof exercise.labels==='object') {
            Object.entries(exercise.labels).forEach(([lang,l])=>{
              this.labelsMap[lang.toLowerCase()] = { title:l.title, description:l.description, id:l.id ?? l.labelId };
            });
          }
          // Setează valorile pentru form.ro și form.en
          this.form.ro.title = this.labelsMap['ro']?.title || '';
          this.form.ro.description = this.labelsMap['ro']?.description || '';
          this.form.en.title = this.labelsMap['en']?.title || '';
          this.form.en.description = this.labelsMap['en']?.description || '';
          if (Array.isArray(exercise.units)) {
            this.selectedUnitIds = exercise.units.map(u => {
              return typeof u === 'object' && u !== null ? u.id ?? u.unitId ?? u.value : u;
            });
          } else {
            this.selectedUnitIds = [];
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
    loadUnits() {
      fetchUnits()
        .then(res => {
          const list = res.data?.data || [];
          this.unitsList = list;
          if (this.isNew && !this.selectedUnitIds.length && list.length) {
            this.selectedUnitIds = [list[0].id];
          }
        })
        .catch(err => console.error('Error fetching units', err));
    },
    save() {
      this.saving = true
      let payload;
      let action;
      let extraAction = null;
      // Construim labels pentru ambele limbi
      const labelEntries = [
        { language: 'ro', title: this.form.ro.title, description: this.form.ro.description },
        { language: 'en', title: this.form.en.title, description: this.form.en.description }
      ];
      if (this.isNew) {
        payload = {
          identifier: this.form.identifier,
          labels: labelEntries,
          title: this.form.ro.title, // compatibilitate
          description: this.form.ro.description, // compatibilitate
          units: this.selectedUnitIds.map(Number)
        };
        action = createExercise(payload);
      } else {
        // Trebuie să actualizăm ambele label-uri
        const roLabel = this.labelsMap['ro'];
        const enLabel = this.labelsMap['en'];
        if(!roLabel?.id || !enLabel?.id){
          alert('Nu există label pentru una din limbi. Crearea de label nou nu este suportată momentan.');
          this.saving=false; return;
        }
        // Update pentru ambele label-uri
        const updateRo = updateExercise(roLabel.id, { title: this.form.ro.title, description: this.form.ro.description });
        const updateEn = updateExercise(enLabel.id, { title: this.form.en.title, description: this.form.en.description });
        action = Promise.all([updateRo, updateEn]);
        extraAction = updateExerciseUnits(
          this.id,
          this.form.identifier,
          this.selectedUnitIds,
          this.form.ro.title,
          this.form.ro.description
        );
      }
      const promises = extraAction ? [action, extraAction] : [action];
      Promise.all(promises)
        .then(responseArr => {
          setTimeout(() => {
            sessionStorage.setItem('exerciseListNeedsReload', 'true')
            this.$router.push('/admin/exercises')
          }, 1000)
        })
        .catch(err => {
          console.error('Error saving exercise:', err)
          console.error('Error details:', err.response ? err.response.data : 'No response data')
          if (err.response && err.response.data && err.response.data.error === 'exerciseWithIdentifierExists') {
            alert(`Identificatorul '${this.form.identifier}' există deja. Te rog alege un alt identificator.`)
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
    this.loadUnits();
    this.load();
  }
}
</script>

<style>
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

.select-units { 
  display: none; /* legacy hidden */
}

.form-actions button, .form-actions .btn-cancel { 
  min-width: 120px; 
}
</style>