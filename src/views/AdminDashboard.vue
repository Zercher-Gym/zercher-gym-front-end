<template>
  <div class="dashboard">
    <h1>Admin Dashboard</h1>
    
    <div class="grid">
      <!-- User Management -->
      <div class="card">
        <h2>Gestionare Utilizatori</h2>
        <div class="actions">
          <router-link to="/admin/users" class="btn">Lista Utilizatori</router-link>
          <router-link to="/admin/users/new" class="btn">Adauga Utilizator</router-link>
        </div>
      </div>

      <!-- Exercise Management -->
      <div class="card">
        <h2>Gestionare Exercitii</h2>
        <div class="actions">
          <router-link to="/admin/exercises" class="btn">Lista Exercitii</router-link>
          <router-link to="/admin/exercises/new" class="btn">Adauga Exercitiu</router-link>
        </div>
      </div>

      <!-- Account Management -->
      <div class="card">
        <h2>Gestionare Cont</h2>
        <div class="actions">
          <router-link to="/reset-password" class="btn">Resetare Parola</router-link>
          <button @click="logout" class="btn btn-danger">Deconectare</button>
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <h3>Gestionare Exercitii</h3>
      <div class="dashboard-links">
        <router-link to="/admin/exercises" class="dashboard-link">
          <i class="fas fa-dumbbell"></i>
          Exercitii Predefinite
        </router-link>
        <router-link to="/admin/exercises/custom" class="dashboard-link">
          <i class="fas fa-user-edit"></i>
          Exercitii Personalizate
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  methods: {
    logout() {
      sessionStorage.removeItem('jwt')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover {
  background-color: #45a049;
}

.btn-danger {
  background-color: #f44336;
}

.btn-danger:hover {
  background-color: #da190b;
}

.dashboard-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dashboard-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.dashboard-link:hover {
  background-color: #45a049;
}

.dashboard-link i {
  margin-right: 0.5rem;
}
</style> 