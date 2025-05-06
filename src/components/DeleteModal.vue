<template>
    <div class="modal-backdrop">
      <div class="modal">
        <p>Are you sure you want to delete user {{ id }}?</p>
        <button @click="confirm">Yes</button>
        <button @click="cancel">No</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DeleteModal',
    props: { id: String },
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