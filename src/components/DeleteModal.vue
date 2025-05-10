<template>
  <div class="modal-backdrop">
    <div class="modal">
      <p>{{ message || `Ești sigur cuă vrei să ștergi ${itemType} ${id}?` }}</p>
      <button @click="confirm">Da</button>
      <button @click="cancel">Nu</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteModal',
  props: { 
    id: String,
    itemType: {
      type: String,
      default: 'elementul'
    },
    message: {
      type: String,
      default: ''
    }
  },
  methods: {
    confirm() { this.$emit('confirm', this.id); },
    cancel() { this.$emit('cancel'); }
  }
};
</script>

<style scoped>
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
  .modal { background: white; padding: 2rem; border-radius: 8px; }
  button { margin: 0 0.5rem; }
</style>