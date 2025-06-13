<template>
  <div class="modal-backdrop" @click.self="emitCancel">
    <div class="modal">
      <button class="btn-close" @click="emitCancel">✕</button>

      <h3 class="modal-title">Selectează exercițiu</h3>

      <!-- STEP 1 : search list -->
      <div v-if="!selectedExercise">
        <form @submit.prevent="doSearch" class="search-bar">
          <input v-model.trim="query" placeholder="Caută după titlu / identificator" />
          <button type="submit" :disabled="query.length < 2">Caută</button>
        </form>

        <div class="results" v-if="results.length">
          <div
            v-for="ex in results"
            :key="ex.id"
            class="result-row"
            @click="chooseExercise(ex)"
          >
            <strong>{{ ex.identifier }}</strong>
            <span>{{ getRoLabel(ex.labels).title }}</span>
          </div>
        </div>
        <p v-else-if="searched" class="no-results">Nu s-au găsit rezultate</p>
        <p v-if="loading" class="loading">Se caută...</p>
      </div>

      <!-- STEP 2 : pick unit -->
      <div v-else>
        <p class="chosen-ex"><strong>{{ selectedExercise.identifier }}</strong> — {{ getRoLabel(selectedExercise.labels).title }}</p>
        <MultiSelectDropdown
          v-model="unitIds"
          :options="selectedExercise.units"
          label-field="code"
          value-field="id"
          :multiple="false"
          placeholder="Selectează unitate"
        />
        <div class="actions">
          <button class="btn-primary" :disabled="!unitIds.length" @click="confirm">Confirmă</button>
          <button class="btn-secondary" @click="clearExercise">Înapoi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { searchExercises } from '../services/exerciseService';
import MultiSelectDropdown from './MultiSelectDropdown.vue';

export default {
  name: 'ExerciseSelectModal',
  components: { MultiSelectDropdown },
  emits: ['selected', 'cancel'],
  data() {
    return {
      query: '',
      results: [],
      loading: false,
      searched: false,
      selectedExercise: null,
      unitIds: []
    };
  },
  methods: {
    doSearch() {
      if (!this.query) return;
      this.loading = true;
      this.results = [];
      this.searched = false;
      searchExercises({ text: this.query, size: 20 })
        .then(res => {
          this.results = res.data?.data || [];
          this.searched = true;
        })
        .catch(err => {
          console.error('Exercise search error', err);
          alert('Eroare la căutare exerciții');
        })
        .finally(() => (this.loading = false));
    },
    chooseExercise(ex) {
      this.selectedExercise = ex;
      this.unitIds = ex.units && ex.units.length ? [ex.units[0].id] : [];
    },
    clearExercise() {
      this.selectedExercise = null;
      this.unitIds = [];
    },
    confirm() {
      if (!this.unitIds.length) return;
      this.$emit('selected', {
        exercise: this.selectedExercise,
        unitId: this.unitIds[0]
      });
    },
    emitCancel() {
      this.$emit('cancel');
    },
    getRoLabel(labels) {
      if (!labels) return {};
      if (Array.isArray(labels)) {
        return labels.find(l => (l.language || '').toLowerCase() === 'ro') || labels[0] || {};
      }
      return labels.ro || labels.RO || {};
    }
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #fff;
  width: 500px;
  max-width: 90vw;
  border-radius: 8px;
  padding: 1.5rem;
  position: relative;
}
.btn-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}
.modal-title {
  margin-top: 0;
}
.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.search-bar input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.search-bar button {
  padding: 0.5rem 1rem;
}
.results {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
}
.result-row {
  padding: 0.5rem 0.6rem;
  border-bottom: 1px solid #f3f3f3;
  cursor: pointer;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.result-row:hover {
  background: #f5f5f5;
}
.no-results {
  margin-top: 1rem;
  color: #888;
}
.loading {
  margin-top: 1rem;
}
.chosen-ex {
  margin-bottom: 1rem;
}
.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.btn-primary {
  background: #4caf50;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  background: #e0e0e0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
