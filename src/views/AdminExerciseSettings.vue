<template>
    <div class="exercise-settings">
      <div class="header">
        <h2>Setări Exerciții</h2>
        <router-link to="/admin/dashboard" class="btn-back">Înapoi la Dashboard</router-link>
      </div>
  
      <div class="settings-card">
        <h3>Limite Exerciții Personalizate pe Roluri</h3>
        <p class="description">
          Setați limita maximă de exerciții personalizate pe care utilizatorii cu diferite roluri le pot crea.
        </p>
  
        <div v-if="loading" class="loading">Se încarcă...</div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div v-if="showSuccess" class="success-message">
          {{ successMessage }}
        </div>
  
        <table v-if="!loading && !error">
          <thead>
            <tr>
              <th>Rol</th>
              <th>Limită Exerciții</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id">
              <td>{{ role.name }} </td>
              <td>
                <input 
                  type="number" 
                  v-model.number="roleLimits[role.id]" 
                  min="0" 
                  :disabled="saving === role.id"
                />
              </td>
              <td>
                <button 
                  @click="saveLimit(role.id)" 
                  :disabled="saving === role.id || !hasChanged(role.id)"
                  class="btn-save"
                >
                  {{ saving === role.id ? 'Se salvează...' : 'Salvează' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
  
        <div class="info-box">
          <i class="fas fa-info-circle"></i>
          <span>
            Setarea limitei la 0 va dezactiva posibilitatea de a crea exerciții personalizate pentru utilizatorii cu acel rol.
          </span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { setRoleExerciseLimit, fetchRoleLimits } from '../services/roleService';
  
  export default {
    name: 'AdminExerciseSettings',
    data() {
      return {
        roles: [],
        originalLimits: {},
        roleLimits: {},
        loading: true,
        saving: null,
        error: null,
        successMessage: null,
        showSuccess: false
      };
    },
    methods: {
      async loadData() {
        this.loading = true;
        this.error = null;
        
        try {
          // Load all roles and limits from a single endpoint
          const response = await fetchRoleLimits();
          // Extract data from response
          let rolesData = response.data;
          
          // Check if data is nested within another object
          if (rolesData && typeof rolesData === 'object' && rolesData.data) {
            rolesData = rolesData.data;
          }
          
          // If we have a list of role-limit objects
          if (Array.isArray(rolesData)) {
            this.roles = rolesData.map(item => ({
              id: item.id,
              name: item.name
            }));
            
            this.originalLimits = {};
            this.roleLimits = {};
            
            // Set limits directly from the data
            rolesData.forEach(item => {
              const roleId = item.roleId || item.id;
              const limitValue = item.exerciseLimit !== undefined ? item.exerciseLimit : 0;
              
              if (roleId) {
                this.originalLimits[roleId] = limitValue;
                this.roleLimits[roleId] = limitValue;
              } else {
                console.error('Invalid role object (missing ID):', item);
              }
            });
          } else if (rolesData && typeof rolesData === 'object') {
            
            // Extract roles and limits from the object structure
            const roles = [];
            this.originalLimits = {};
            this.roleLimits = {};
            
            // Handle various possible response formats
            if (rolesData.roles && Array.isArray(rolesData.roles)) {
              // If roles are in a nested 'roles' property
              roles.push(...rolesData.roles);
            } else {
              // Try to extract role information from the object
              Object.entries(rolesData).forEach(([key, value]) => {
                if (value && typeof value === 'object' && (value.id || value.roleId)) {
                  roles.push(value);
                }
              });
            }
            
            this.roles = roles;
            
            // Sort roles by name
            this.roles.sort((a, b) => a.name.localeCompare(b.name));
            
            // Extract limits
            roles.forEach(role => {
              const roleId = role.roleId || role.id;
              const limitValue = role.exerciseLimit !== undefined ? role.exerciseLimit : 0;
              
              if (roleId) {
                this.originalLimits[roleId] = limitValue;
                this.roleLimits[roleId] = limitValue;
              }
            });
          } else {
            console.error('Unexpected data format:', rolesData);
            this.roles = [];
            throw new Error('Format de date neașteptat de la server');
          }
        } catch (err) {
          console.error('Error loading role data:', err);
          this.error = 'Eroare la încărcarea datelor. Vă rugăm să încercați din nou.';
        } finally {
          this.loading = false;
        }
      },
      
      async saveLimit(roleId) {
        if (this.saving || !this.hasChanged(roleId)) return;
        
        this.saving = roleId;
        // Clear any previous messages
        this.error = null;
        this.showSuccess = false;
        
        try {
          await setRoleExerciseLimit(roleId, this.roleLimits[roleId]);
          // Update original limit after successful save
          this.originalLimits[roleId] = this.roleLimits[roleId];
          
          // Show success message
          this.successMessage = 'Limita a fost actualizată cu succes!';
          this.showSuccess = true;
          
          // Hide success message after 3 seconds
          setTimeout(() => {
            this.showSuccess = false;
          }, 3000);
        } catch (err) {
          console.error('Error saving limit:', err);
          this.error = 'Eroare la salvarea limitei. Vă rugăm să încercați din nou.';
          // Revert to original value
          this.roleLimits[roleId] = this.originalLimits[roleId];
        } finally {
          this.saving = null;
        }
      },
      
      hasChanged(roleId) {
        return this.originalLimits[roleId] !== this.roleLimits[roleId];
      }
    },
    mounted() {
      this.loadData();
    }
  };
  </script>
  
  <style scoped>
  .exercise-settings {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .btn-back {
    padding: 0.5rem 1rem;
    background-color: #6c757d;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  
  .settings-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h3 {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.25rem;
  }
  
  .description {
    color: #6c757d;
    margin-bottom: 1.5rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
  }
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
  
  input[type="number"] {
    width: 80px;
    padding: 0.375rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
  }
  
  .btn-save {
    padding: 0.375rem 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .btn-save:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }
  
  .error-message {
    color: #dc3545;
    padding: 1rem;
    background-color: #f8d7da;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  
  .success-message {
    color: #155724;
    padding: 1rem;
    background-color: #d4edda;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  
  .info-box {
    display: flex;
    align-items: flex-start;
    padding: 0.75rem;
    background-color: #e2f3fd;
    border-radius: 0.25rem;
    color: #0c5460;
  }
  
  .info-box i {
    margin-right: 0.5rem;
    margin-top: 0.125rem;
  }
  </style>
  
  
  