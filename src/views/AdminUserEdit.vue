<template>
  <div class="edit-user">
    <div class="header">
      <h2>{{ isNew ? 'Adauga Utilizator' : 'Editare Utilizator' }}</h2>
      <router-link to="/admin/users" class="btn-back">
        <i class="fas fa-arrow-left"></i> Inapoi la Lista
      </router-link>
    </div>

    <div class="card">
      <form @submit.prevent="save" class="form">
        <!-- Username -->
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            id="username" 
            v-model="user.username" 
            :disabled="!isNew"
            :class="{ 'input-disabled': !isNew }"
          />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            v-model="user.email" 
            :disabled="!isNew"
            :class="{ 'input-disabled': !isNew }"
          />
        </div>

        <!-- Password -->
        <div class="form-group" v-if="isNew">
          <label for="password">Parola</label>
          <input 
            id="password" 
            v-model="user.password" 
            type="password"
          />
        </div>

        <!-- Status Toggles -->
        <div class="toggles">
          <!-- Enabled Toggle -->
          <div class="toggle-group">
            <label class="toggle-label">
              <span>Status Cont</span>
              <div class="toggle-description">
                {{ user.enabled ? 'Contul este activ' : 'Contul este dezactivat' }}
              </div>
            </label>
            <label class="toggle">
              <input 
                type="checkbox" 
                v-model="user.enabled" 
                class="toggle-input"
              />
              <span class="toggle-slider" :class="{ 'active': user.enabled }"></span>
            </label>
          </div>

          <!-- Locked Toggle -->
          <div class="toggle-group">
            <label class="toggle-label">
              <span>Blocare Cont</span>
              <div class="toggle-description">
                {{ user.locked ? 'Contul este blocat' : 'Contul este deblocat' }}
              </div>
            </label>
            <label class="toggle">
              <input 
                type="checkbox" 
                v-model="user.locked" 
                class="toggle-input"
              />
              <span class="toggle-slider" :class="{ 'active': user.locked }"></span>
            </label>
          </div>
        </div>

        <!-- Save Button -->
        <div class="form-actions">
          <button type="submit" class="btn-save">
            <i class="fas fa-save"></i> {{ isNew ? 'Creeaza Utilizator' : 'Salveaza Modificarile' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { fetchUsers } from '../services/userService.js'

export default {
  name: 'AdminUserEdit',
  props: ['id'],
  data() {
    return {
      user: {
        username: '',
        email: '',
        enabled: true,
        locked: false,
        password: '',
        roles: ['USER']
      }
    }
  },
  computed: {
    isNew() {
      return !this.id;
    }
  },
  mounted() {
    // Daca este un utilizator nou, nu incarcam date
    if (this.isNew) return;
    
    fetchUsers({ page: 0, size: 1, id: this.id })
      .then(res => {
        const data = res.data
        let found = null
        if (Array.isArray(data)) found = data[0]
        else if (data?.data?.content) found = data.data.content[0]
        else if (data?.data) found = data.data[0]

        if (found) Object.assign(this.user, found)
        else console.warn('User not found', data)
      })
      .catch(err => console.error('Failed to load user', err))
  },
  methods: {
    async save() {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || ''
        const token = sessionStorage.getItem('jwt')
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        
        if (this.isNew) {
          // Cream un utilizator nou
          const payload = {
            username: this.user.username,
            email: this.user.email,
            password: this.user.password,
            enabled: this.user.enabled,
            roles: this.user.roles
          };
          
          await axios.post(`${baseURL}/api/user/admin/create`, payload, { headers });
        } else {
          // Actualizam un utilizator existent
          await axios.put(
            `${baseURL}/api/user/${this.id}`,
            {
              enabled: this.user.enabled,
              locked: this.user.locked,
              roles: this.user.roles
            },
            { headers }
          );
        }
        
        this.$router.push('/admin/users')
      } catch (err) {
        console.error('Failed to save user', err)
        alert(`Eroare: ${err.response?.data?.message || err.message}`);
      }
    }
  }
}
</script>

<style scoped>
.edit-user {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background-color: #f8f9fa;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.btn-back:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #2c3e50;
}

.input-disabled {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  font-size: 1rem;
}

.toggles {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1rem 0;
}

.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.toggle-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.toggle-label span {
  font-weight: 500;
  color: #2c3e50;
}

.toggle-description {
  font-size: 0.9rem;
  color: #6c757d;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e0e0e0;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-slider.active {
  background-color: #4CAF50;
}

.toggle-slider.active:before {
  transform: translateX(26px);
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-save:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .toggle-group {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>