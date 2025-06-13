<template>
  <div class="workout-edit">
    <h2>{{ isNew ? 'Adaugă Antrenament' : 'Editează Antrenament' }}</h2>

    <form @submit.prevent="save" v-if="!loading">
      <div class="form-group" v-if="isNew">
        <label>Identificator:</label>
        <input v-model="form.identifier" required />
      </div>
      <div class="form-group" v-else>
        <label>Identificator:</label>
        <div class="readonly-field">{{ form.identifier }}</div>
      </div>
      <div class="form-group">
        <label>Titlu (RO):</label>
        <input v-model="form.title" required />
      </div>
      <div class="form-group">
        <label>Descriere (RO):</label>
        <textarea v-model="form.description" required></textarea>
      </div>
      <div class="form-group">
        <label>Exerciții</label>
        <table class="exercise-table">
          <thead>
            <tr>
              <th>Identificator</th>
              <th>Titlu</th>
              <th>Cantitate</th>
              <th>Unit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ex, idx) in exercises" :key="idx">
              <td>{{ ex.identifier }}</td>
              <td>{{ ex.title }}</td>
              <td><input type="number" v-model.number="ex.quantity" min="1" required /></td>
              <td>{{ ex.unitLabel }}</td>
              <td><button type="button" @click="removeEx(idx)">✕</button></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn-add-row" @click="showModal = true">Adaugă exercițiu</button>
      </div>
      <div class="form-actions">
        <router-link to="/admin/workouts" class="btn-cancel">Anulează</router-link>
        <button type="submit" :disabled="saving">{{ isNew ? 'Adaugă' : 'Salvează' }}</button>
      </div>
    </form>

    <ExerciseSelectModal v-if="showModal" @selected="onExerciseSelected" @cancel="showModal=false" />
    <div v-else class="loading" v-if="loading">Se încarcă...</div>
  </div>
</template>

<script>
import { getWorkout, createWorkout, updateWorkoutLabel } from '../services/workoutService';
import ExerciseSelectModal from '../components/ExerciseSelectModal.vue';

export default {
  name: 'AdminWorkoutEdit',
  props: {
    id: { type: String, default: null }
  },
  data() {
    return {
      form: { identifier: '', title: '', description: '' },
      exercises: [],
      loading: false,
      saving: false,
      labelId: null,
      showModal: false
    };
  },
  computed: {
    isNew() { return !this.id; }
  },
  components: { ExerciseSelectModal },
  methods: {
    getRoLabel(labels){
      if(!labels) return {};
      if(Array.isArray(labels)) return labels.find(l=> (l.language||'').toLowerCase()==='ro')||labels[0]||{};
      return labels.ro||labels.RO||{};
    },
    onExerciseSelected({ exercise, unitId }) {
      const ro = this.getRoLabel(exercise.labels);
      this.exercises.push({
        exerciseId: exercise.id,
        identifier: exercise.identifier,
        title: ro.title,
        quantity: 1,
        unitId: unitId,
        unitLabel: (exercise.units.find(u=>u.id===unitId)||{}).code || unitId
      });
      this.showModal = false;
    },
    addEx() {},
    removeEx(idx) {
      this.exercises.splice(idx, 1);
    },
    load() {
      if (this.isNew) return;
      this.loading = true;
      getWorkout(this.id)
        .then(res => {
          const workout = res.data;
          console.log('Loaded workout', workout);
          this.form.identifier = workout.identifier;
          console.log(workout.data.labels);
          const roLabel = Array.isArray(workout.data.labels)
            ? (workout.data.labels.find(l => (l.language || '').toLowerCase() === 'ro') || workout.data.labels[0])
            : (workout.data.labels?.ro || workout.data.labels?.RO || Object.values(workout.data.labels || {})[0] || null);
          console.log('Derived roLabel', roLabel);
          if (roLabel) {
            this.labelId = roLabel.id ?? roLabel.labelId ?? roLabel.labelID ?? null;
            this.form.title = roLabel.title;
            this.form.description = roLabel.description;
          }
          if (Array.isArray(workout.exercises)) {
            this.exercises = workout.exercises.map(e => ({
              exerciseId: e.exerciseId || e.exercise?.id || '',
              identifier: e.exercise?.identifier || '',
              title: e.exercise?.labels?.ro?.title || '',
              quantity: e.quantity || 1,
              unitId: e.unitId || e.units?.id || 1,
              unitLabel: e.units?.type || e.unitId
            }));
          }
        })
        .catch(err => {
          console.error('Error loading workout:', err);
          alert('Eroare la încărcarea antrenamentului');
        })
        .finally(() => { this.loading = false; });
    },
    validate() {
      if (this.exercises.length === 0) {
        alert('Adăugați cel puțin un exercițiu');
        return false;
      }
      for (const ex of this.exercises) {
        if (!ex.exerciseId || !ex.quantity || !ex.unitId) {
          alert('Completați toate câmpurile exercițiilor');
          return false;
        }
      }
      return true;
    },
    save() {
      if (this.isNew && !this.validate()) return;
      this.saving = true;
      let action;
      if (this.isNew) {
        const payload = {
          identifier: this.form.identifier,
          exercises: this.exercises.map(e => ({
            exerciseId: e.exerciseId,
            quantity: Number(e.quantity),
            unitId: Number(e.unitId)
          })),
          labels: [{ title: this.form.title, description: this.form.description, language: 'ro' }]
        };
        console.debug('Creating workout payload', payload);
        action = createWorkout(payload);
      } else {
        if (!this.labelId) {
          alert('Nu s-a putut determina ID-ul etichetei pentru acest antrenament. Reîncărcați pagina.');
          this.saving = false;
          return;
        }
        const payload = { title: this.form.title, description: this.form.description };
        const targetId = this.labelId;
        console.debug('Updating label', { targetId, payload });
        action = updateWorkoutLabel(targetId, payload);
      }
      action
        .then(() => {
          sessionStorage.setItem('workoutListNeedsReload', 'true');
          setTimeout(() => { this.$router.push('/admin/workouts'); }, 500);
        })
        .catch(err => {
          console.error('Error saving workout:', err);
          alert('Eroare la salvarea antrenamentului');
        })
        .finally(() => { this.saving = false; });
    }
  },
  mounted() { this.load(); }
};
</script>

<style scoped>
.readonly-field { padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 4px; background: #f8f9fa; color: #6c757d; }
.workout-edit { max-width: 800px; margin: 2rem auto; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
.form-group textarea { height: 100px; resize: vertical; }
.exercise-table { width: 100%; border-collapse: collapse; margin-bottom: 0.5rem; }
.exercise-table th, .exercise-table td { border: 1px solid #eee; padding: 0.4rem; text-align: left; }
.btn-add-row { margin-top: 0.3rem; padding: 0.25rem 0.75rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
button { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; background: #4CAF50; color: white; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel { padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; background: #f44336; color: white; }
.loading { text-align: center; padding: 2rem; font-style: italic; color: #666; }
</style>
