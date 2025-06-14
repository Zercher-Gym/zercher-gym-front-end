<template>
  <div class="multi-select" @click.stop="toggle">
    <div class="selected-values" :class="{ placeholder: !selectedLabels.length }">
      <span v-if="selectedLabels.length">{{ selectedLabels.join(', ') }}</span>
      <span v-else>{{ placeholder }}</span>
    </div>
    <i class="caret" />
    <div v-if="open" class="dropdown">
      <div
        v-for="opt in options"
        :key="opt[valueField]"
        class="option"
        @click.stop="toggleValue(opt[valueField])"
      >
        <template v-if="multiple">
          <input type="checkbox" :checked="modelVal.includes(opt[valueField])" />
        </template>
        <template v-else>
          <input type="radio" :checked="modelVal.includes(opt[valueField])" />
        </template>
        <span>{{ opt[labelField] }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultiSelectDropdown',
  props: {
    options: { type: Array, default: () => [] },
    modelValue: { type: Array, default: () => [] },
    labelField: { type: String, default: 'label' },
    valueField: { type: String, default: 'value' },
    placeholder: { type: String, default: 'Select' },
    multiple: { type: Boolean, default: true }
  },
  emits: ['update:modelValue'],
  data() {
    return { open: false };
  },
  computed: {
    modelVal() {
      return this.modelValue || [];
    },
    selectedLabels() {
      // Coerce both option values and model values to strings for comparison to
      // avoid issues when one side is numeric and the other is string.
      const selected = this.modelVal.map(v => String(v));
      return this.options
        .filter(o => selected.includes(String(o[this.valueField])))
        .map(o => o[this.labelField]);
    }
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
    toggleValue(val) {
      // Work on a shallow copy so we do not mutate the prop directly.
      let newVal = [...this.modelVal];

      const findIndexLoose = arr => arr.findIndex(v => v == val);

      if (this.multiple) {
        const idx = findIndexLoose(newVal);
        if (idx >= 0) newVal.splice(idx, 1);
        else newVal.push(val);
      } else {
        newVal = [val];
        this.open = false;
      }

      this.$emit('update:modelValue', newVal);
    },
    onOutsideClick(e) {
      if (!this.$el.contains(e.target)) this.open = false;
    }
  },
  mounted() {
    document.addEventListener('click', this.onOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onOutsideClick);
  }
};
</script>

<style scoped>
.multi-select {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 2rem 0.5rem 0.5rem;
  cursor: pointer;
  background: #fff;
  user-select: none;
}
.multi-select .selected-values {
  min-height: 1.2rem;
  font-size: 0.95rem;
}
.multi-select .selected-values.placeholder {
  color: #888;
}
.multi-select .caret {
  position: absolute;
  right: 10px;
  top: 50%;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #555;
  transform: translateY(-50%);
  pointer-events: none;
}
.multi-select .dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 40;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.multi-select .option {
  padding: 0.4rem 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
}
.multi-select .option:hover {
  background: #f5f5f5;
}
</style>
