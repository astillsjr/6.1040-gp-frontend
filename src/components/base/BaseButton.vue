<template>
  <button :class="buttonClass" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
})

const buttonClass = computed(() => {
  // TODO: Use design tokens from useDesignTokens composable
  return `base-button base-button--${props.variant}`
})
</script>

<style scoped>
.base-button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.base-button--primary {
  background-color: #A31F34; /* MIT Red */
  color: white;
}

.base-button--secondary {
  background-color: #6c757d;
  color: white;
}

.base-button--danger {
  background-color: #dc3545;
  color: white;
}

.base-button--ghost {
  background-color: transparent;
  color: inherit;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

