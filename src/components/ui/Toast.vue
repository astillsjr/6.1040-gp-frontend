<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-20 right-4 z-[1100] flex flex-col gap-2 pointer-events-none"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto min-w-[300px] max-w-md rounded-xl border-2 shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right"
        :class="getToastClasses(toast.type)"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-green-600" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-600" />
          <Info v-else class="w-5 h-5 text-blue-600" />
        </div>
        
        <!-- Message -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium" :class="getTextClasses(toast.type)">
            {{ toast.message }}
          </p>
        </div>
        
        <!-- Close Button -->
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 -mr-1 -mt-1"
          aria-label="Close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'
import { useToast, type ToastType } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

function getToastClasses(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200'
    case 'error':
      return 'bg-red-50 border-red-200'
    case 'info':
      return 'bg-blue-50 border-blue-200'
    default:
      return 'bg-card border-border'
  }
}

function getTextClasses(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'text-green-900'
    case 'error':
      return 'text-red-900'
    case 'info':
      return 'text-blue-900'
    default:
      return 'text-foreground'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

