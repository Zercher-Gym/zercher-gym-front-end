<template>
  <!-- Full‑screen wrapper that centrează cardul -->
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
    <!-- Glass / frosted card -->
    <div class="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-slate-900/70 shadow-2xl rounded-3xl p-10 border border-white/40 dark:border-slate-900/40">
      <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 text-center tracking-tight">
        Edit&nbsp;User
      </h2>

      <form @submit.prevent="save" class="space-y-6">
        <!-- Just display username / email -->
        <div class="grid gap-1">
          <label class="text-sm font-medium text-slate-600 dark:text-slate-300" for="username">Username</label>
          <input id="username" v-model="user.username" disabled
                 class="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200/60 dark:bg-slate-700/50 px-4 py-2 text-slate-700 dark:text-slate-100 focus:outline-none cursor-not-allowed" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-medium text-slate-600 dark:text-slate-300" for="email">Email</label>
          <input id="email" v-model="user.email" disabled
                 class="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200/60 dark:bg-slate-700/50 px-4 py-2 text-slate-700 dark:text-slate-100 focus:outline-none cursor-not-allowed" />
        </div>

        <!-- Fancy switches -->
        <div class="space-y-4">
          <!-- Enabled toggle -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200 select-none">Enabled</span>
            <label class="inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="user.enabled" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-emerald-500 relative transition-colors">
                <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full border border-slate-300 transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          <!-- Locked toggle -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200 select-none">Locked</span>
            <label class="inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="user.locked" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-rose-500 relative transition-colors">
                <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full border border-slate-300 transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>
        </div>

        <button type="submit"
                class="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2.5 rounded-xl shadow hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all">
          Save changes
        </button>
      </form>
    </div>
  </div>
</template>

<script>
// Folosim axios direct pentru PUT (endpointul nu acceptă PATCH)
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
        enabled: false,
        locked: false,
        roles: []
      }
    }
  },
  mounted() {
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
        await axios.put(`${baseURL}/api/user/admin/${this.id}`,
          {
            enabled: this.user.enabled,
            locked: this.user.locked,
            roles: this.user.roles
          },
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          }
        )
        this.$router.push('/admin/users')
      } catch (err) {
        console.error('Failed to update user', err)
      }
    }
  }
}
</script>