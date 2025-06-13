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
      <!-- Language selector -->
      <div class="form-group">
        <label>Limba:</label>
        <select v-model="currentLang">
          <option v-for="l in languages" :key="l" :value="l">{{ l.toUpperCase() }}</option>
        </select>
      </div>
      <!-- Title and description can be edited in both modes -->
      <div class="form-group">
        <label>Titlu ({{ currentLang.toUpperCase() }}):</label>
        <input v-model="form.title" required />
      </div>
      <div class="form-group">
        <label>Descriere ({{ currentLang.toUpperCase() }}):</label>
        <textarea v-model="form.description" required></textarea>
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
        title: '',
        description: ''
      },
      currentLang: 'ro',
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
    },
    languages() {
      return Object.keys(this.labelsMap).length ? Object.keys(this.labelsMap) : ['ro'];
    }
  },
  watch: {
    currentLang(newLang){
      const lb = this.labelsMap[newLang] || { title:'', description:'', id:null };
      this.form.title = lb.title;
      this.form.description = lb.description;
    },
    'form.title'(val){
      if(!this.labelsMap[this.currentLang]) this.$set(this.labelsMap, this.currentLang, { title:'', description:'', id:null });
      this.labelsMap[this.currentLang].title = val;
    },
    'form.description'(val){
      if(!this.labelsMap[this.currentLang]) this.$set(this.labelsMap, this.currentLang, { title:'', description:'', id:null });
      this.labelsMap[this.currentLang].description = val;
    }
  },
  components: { MultiSelectDropdown },
  methods: {
    load() {
      if (this.isNew) return

      this.loading = true
      getExercise(this.id)
        .then(res => {
          console.log('Raw response:', res);
          // API may wrap payload as { success, error, data }
          const wrapper = res.data;
          const exercise = wrapper && wrapper.data ? wrapper.data : wrapper;
          console.log('Loaded exercise data (unwrapped):', JSON.stringify(exercise, null, 2));
          
          // Set identifier for display
          this.form.identifier = exercise.identifier || '';
          
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

          if(!this.labelsMap[this.currentLang]) this.currentLang = Object.keys(this.labelsMap)[0] || 'ro';
          const cur = this.labelsMap[this.currentLang] || { title:'', description:'' };
          this.form.title = cur.title;
          this.form.description = cur.description;
          
          // `exercise.units` may come as an array of objects or ids; normalise to an array of ids.
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
      
      if (this.isNew) {
        const labelEntries = Object.entries(this.labelsMap).length
          ? Object.entries(this.labelsMap).map(([lang,data])=>({ title:data.title, description:data.description, language:lang }))
          : [{ language:this.currentLang, title:this.form.title, description:this.form.description }];

        payload = {
          identifier: this.form.identifier,
          labels: labelEntries,
          // compatibilitate
          title: this.form.title,
          description: this.form.description,
          units: this.selectedUnitIds.map(Number)
        };
        
        console.log('Creating new exercise with payload:', JSON.stringify(payload));
        action = createExercise(payload);
      } else {
        const labelEntry = this.labelsMap[this.currentLang];
        if(!labelEntry || !labelEntry.id){
          alert('Nu există label pentru această limbă. Crearea de label nou nu este suportată momentan.');
          this.saving=false; return;
        }
        payload = { title: labelEntry.title, description: labelEntry.description };
        console.log(`Updating label ${labelEntry.id} lang ${this.currentLang} with`, payload);
        action = updateExercise(labelEntry.id, payload);

        extraAction = updateExerciseUnits(
          this.id,
          this.form.identifier,
          this.selectedUnitIds,
          this.form.title,
          this.form.description
        );
      }

      const promises = extraAction ? [action, extraAction] : [action];

      Promise.all(promises)
        .then(responseArr => {
          console.log('Exercise saved successfully:', responseArr.map(r=>r.data))
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