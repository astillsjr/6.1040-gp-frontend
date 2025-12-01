<template>
  <div class="min-h-screen bg-background pb-8">
    <!-- Header -->
    <div class="bg-card/95 backdrop-blur-sm border-b border-border">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-foreground text-3xl font-bold">Activity</h1>
        <p class="text-muted-foreground text-base mt-2">Manage your requests, borrows, and transfers</p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-16">
        <div class="text-muted-foreground text-lg">Loading activity...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-destructive/10 text-destructive p-5 rounded-xl border-2 border-destructive/20">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="hasNoActivity" class="text-center py-16">
        <div class="text-muted-foreground mb-6">
          <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-foreground mb-3">No Activity Yet</h3>
        <p class="text-muted-foreground mb-6 text-lg">Start browsing and requesting items to get started!</p>
        <Button @click="$router.push('/items')" class="rounded-xl">Browse Items</Button>
      </div>

      <!-- Activity Sections -->
      <div v-else class="space-y-8">
        <!-- ACTION REQUIRED -->
        <section v-if="actionRequired.length > 0" class="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
          <h2 class="text-2xl font-bold text-amber-900 mb-5 flex items-center gap-3">
            <span class="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {{ actionRequired.length }}
            </span>
            Action Required
          </h2>
          <div class="space-y-4">
            <ActivityCard
              v-for="item in actionRequired"
              :key="item.id"
              :item="item"
              @action="handleAction"
            />
          </div>
        </section>

        <!-- WAITING FOR RESPONSE -->
        <section v-if="waiting.length > 0">
          <h2 class="text-xl font-bold text-foreground mb-5">
            Waiting for Response ({{ waiting.length }})
          </h2>
          <div class="space-y-4">
            <ActivityCard
              v-for="item in waiting"
              :key="item.id"
              :item="item"
              @action="handleAction"
            />
          </div>
        </section>

        <!-- ACTIVE (IN PROGRESS) -->
        <section v-if="active.length > 0">
          <h2 class="text-xl font-bold text-foreground mb-5">
            Active ({{ active.length }})
          </h2>
          <div class="space-y-4">
            <ActivityCard
              v-for="item in active"
              :key="item.id"
              :item="item"
              @action="handleAction"
            />
          </div>
        </section>

        <!-- RECENT (Completed/Cancelled) -->
        <section v-if="recent.length > 0">
          <details class="group">
            <summary class="cursor-pointer list-none">
              <h2 class="text-xl font-bold text-muted-foreground mb-5 inline-flex items-center gap-2 hover:text-foreground transition-colors">
                Recent ({{ recent.length }})
                <svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </h2>
            </summary>
            <div class="space-y-4 opacity-75">
              <ActivityCard
                v-for="item in recent"
                :key="item.id"
                :item="item"
                @action="handleAction"
              />
            </div>
          </details>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRequestStore } from '@/stores/requestStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { Button } from '@/components/ui'
import { useRouter } from 'vue-router'
import ActivityCard from '@/components/ActivityCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const requestStore = useRequestStore()
const transactionStore = useTransactionStore()

const isLoading = ref(false)
const error = ref<string | null>(null)

interface ActivityItem {
  id: string
  type: 'incoming-request' | 'outgoing-request' | 'transaction'
  title: string
  subtitle: string
  status: string
  statusBadge: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  date: Date
  timeInfo?: string
  notes?: string
  actions: Array<{
    label: string
    variant?: 'default' | 'outline' | 'destructive'
    handler: () => void
  }>
  rawData: any
}

const actionRequired = computed(() => {
  const items: ActivityItem[] = []

  // Incoming PENDING requests
  requestStore.incomingRequests
    .filter((r) => r.status === 'PENDING')
    .forEach((req) => {
      items.push({
        id: `req-in-${req._id}`,
        type: 'incoming-request',
        title: req.itemDetails?.title || 'Item',
        subtitle: `${req.type} request from user ${req.requester.slice(0, 8)}...`,
        status: 'PENDING',
        statusBadge: { text: 'NEEDS RESPONSE', variant: 'default' },
        date: new Date(req.createdAt),
        timeInfo: req.requestedStartTime && req.requestedEndTime
          ? `Pickup: ${formatDateTime(req.requestedStartTime)}`
          : undefined,
        notes: req.requesterNotes,
        actions: [
          { label: 'Accept', handler: () => handleAcceptRequest(req._id) },
          { label: 'Reject', variant: 'outline', handler: () => handleRejectRequest(req._id) },
        ],
        rawData: req,
      })
    })

  // Transactions awaiting pickup
  transactionStore.transactions
    .filter((t) => t.status === 'PENDING_PICKUP')
    .forEach((tx) => {
      items.push({
        id: `tx-${tx._id}`,
        type: 'transaction',
        title: tx.itemDetails?.title || 'Item',
        subtitle: tx.isLending ? '🟢 Lending' : '🔵 Borrowing',
        status: 'PENDING_PICKUP',
        statusBadge: { text: 'CONFIRM PICKUP', variant: 'default' },
        date: new Date(tx.createdAt),
        notes: tx.toNotes,
        actions: [
          { label: 'Confirm Pickup', handler: () => handleMarkPickedUp(tx._id) },
          { label: 'Cancel', variant: 'destructive', handler: () => handleCancelTransaction(tx._id) },
        ],
        rawData: tx,
      })
    })

  // Transactions awaiting return confirmation (only for lenders)
  transactionStore.transactions
    .filter((t) => t.status === 'PENDING_RETURN' && t.isLending)
    .forEach((tx) => {
      items.push({
        id: `tx-return-${tx._id}`,
        type: 'transaction',
        title: tx.itemDetails?.title || 'Item',
        subtitle: '🟢 Item returned - confirm receipt',
        status: 'PENDING_RETURN',
        statusBadge: { text: 'CONFIRM RETURN', variant: 'secondary' },
        date: new Date(tx.returnedAt!),
        actions: [
          { label: 'Confirm Return', handler: () => handleConfirmReturn(tx._id) },
        ],
        rawData: tx,
      })
    })

  return items.sort((a, b) => b.date.getTime() - a.date.getTime())
})

const waiting = computed(() => {
  const items: ActivityItem[] = []

  // Outgoing PENDING requests
  requestStore.outgoingRequests
    .filter((r) => r.status === 'PENDING')
    .forEach((req) => {
      items.push({
        id: `req-out-${req._id}`,
        type: 'outgoing-request',
        title: req.itemDetails?.title || 'Item',
        subtitle: `Your ${req.type} request`,
        status: 'PENDING',
        statusBadge: { text: 'WAITING', variant: 'outline' },
        date: new Date(req.createdAt),
        timeInfo: req.requestedStartTime && req.requestedEndTime
          ? `Pickup: ${formatDateTime(req.requestedStartTime)}`
          : undefined,
        notes: req.requesterNotes,
        actions: [
          { label: 'Cancel Request', variant: 'outline', handler: () => handleCancelRequest(req._id) },
        ],
        rawData: req,
      })
    })

  // Transactions awaiting return (borrowers waiting to return)
  transactionStore.transactions
    .filter((t) => t.status === 'PENDING_RETURN' && !t.isLending)
    .forEach((tx) => {
      items.push({
        id: `tx-waiting-${tx._id}`,
        type: 'transaction',
        title: tx.itemDetails?.title || 'Item',
        subtitle: '🔵 Waiting for owner to confirm return',
        status: 'PENDING_RETURN',
        statusBadge: { text: 'RETURN PENDING', variant: 'secondary' },
        date: new Date(tx.returnedAt!),
        actions: [],
        rawData: tx,
      })
    })

  return items.sort((a, b) => b.date.getTime() - a.date.getTime())
})

const active = computed(() => {
  const items: ActivityItem[] = []

  // Accepted requests (before they become transactions)
  requestStore.outgoingRequests
    .filter((r) => r.status === 'ACCEPTED')
    .forEach((req) => {
      items.push({
        id: `req-accepted-${req._id}`,
        type: 'outgoing-request',
        title: req.itemDetails?.title || 'Item',
        subtitle: 'Request accepted - coordinate pickup',
        status: 'ACCEPTED',
        statusBadge: { text: 'ACCEPTED', variant: 'secondary' },
        date: new Date(req.createdAt),
        notes: req.requesterNotes,
        actions: [],
        rawData: req,
      })
    })

  // In-progress borrows
  transactionStore.transactions
    .filter((t) => t.status === 'IN_PROGRESS')
    .forEach((tx) => {
      const actions: ActivityItem['actions'] = []
      
      // Only borrower can mark as returned
      if (!tx.isLending) {
        actions.push({ label: 'Mark as Returned', handler: () => handleMarkReturned(tx._id) })
      }

      items.push({
        id: `tx-active-${tx._id}`,
        type: 'transaction',
        title: tx.itemDetails?.title || 'Item',
        subtitle: tx.isLending ? '🟢 Currently lent out' : '🔵 Currently borrowing',
        status: 'IN_PROGRESS',
        statusBadge: { text: 'IN PROGRESS', variant: 'default' },
        date: new Date(tx.pickedUpAt!),
        timeInfo: tx.pickedUpAt ? `Picked up ${formatRelativeTime(tx.pickedUpAt)}` : undefined,
        actions,
        rawData: tx,
      })
    })

  return items.sort((a, b) => b.date.getTime() - a.date.getTime())
})

const recent = computed(() => {
  const items: ActivityItem[] = []

  // Completed/Rejected/Cancelled requests
  requestStore.incomingRequests
    .filter((r) => ['REJECTED', 'CANCELLED'].includes(r.status))
    .forEach((req) => {
      items.push({
        id: `req-in-recent-${req._id}`,
        type: 'incoming-request',
        title: req.itemDetails?.title || 'Item',
        subtitle: `Request ${req.status.toLowerCase()}`,
        status: req.status,
        statusBadge: { text: req.status, variant: 'destructive' },
        date: new Date(req.createdAt),
        actions: [],
        rawData: req,
      })
    })

  requestStore.outgoingRequests
    .filter((r) => ['REJECTED', 'CANCELLED'].includes(r.status))
    .forEach((req) => {
      items.push({
        id: `req-out-recent-${req._id}`,
        type: 'outgoing-request',
        title: req.itemDetails?.title || 'Item',
        subtitle: `Your request ${req.status.toLowerCase()}`,
        status: req.status,
        statusBadge: { text: req.status, variant: 'destructive' },
        date: new Date(req.createdAt),
        actions: [],
        rawData: req,
      })
    })

  // Completed/Cancelled transactions
  transactionStore.transactions
    .filter((t) => ['COMPLETED', 'CANCELLED'].includes(t.status))
    .forEach((tx) => {
      items.push({
        id: `tx-recent-${tx._id}`,
        type: 'transaction',
        title: tx.itemDetails?.title || 'Item',
        subtitle: tx.isLending ? 'Lent out' : 'Borrowed',
        status: tx.status,
        statusBadge: { text: tx.status, variant: tx.status === 'COMPLETED' ? 'secondary' : 'destructive' },
        date: new Date(tx.createdAt),
        actions: [],
        rawData: tx,
      })
    })

  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10) // Show last 10
})

const hasNoActivity = computed(() => 
  actionRequired.value.length === 0 &&
  waiting.value.length === 0 &&
  active.value.length === 0 &&
  recent.value.length === 0
)

onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.userId) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await Promise.all([
      requestStore.fetchIncomingRequests(authStore.userId),
      requestStore.fetchOutgoingRequests(authStore.userId),
      transactionStore.fetchTransactions(authStore.userId),
    ])
  } catch (err: any) {
    error.value = err.message || 'Failed to load activity'
  } finally {
    isLoading.value = false
  }
})

function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatRelativeTime(date: Date | string | null): string {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function handleAction(action: { type: string; id: string; action: string }) {
  // Action handlers
  if (action.action === 'accept-request') {
    await handleAcceptRequest(action.id)
  } else if (action.action === 'reject-request') {
    await handleRejectRequest(action.id)
  } else if (action.action === 'cancel-request') {
    await handleCancelRequest(action.id)
  } else if (action.action === 'mark-picked-up') {
    await handleMarkPickedUp(action.id)
  } else if (action.action === 'mark-returned') {
    await handleMarkReturned(action.id)
  } else if (action.action === 'confirm-return') {
    await handleConfirmReturn(action.id)
  } else if (action.action === 'cancel-transaction') {
    await handleCancelTransaction(action.id)
  }
}

async function handleAcceptRequest(requestId: string) {
  try {
    await requestStore.acceptRequest(requestId)
    alert('Request accepted! A transaction has been created.')
    await transactionStore.fetchTransactions(authStore.userId!)
  } catch (err) {
    alert('Failed to accept request. Please try again.')
  }
}

async function handleRejectRequest(requestId: string) {
  if (!confirm('Are you sure you want to reject this request?')) return
  try {
    await requestStore.rejectRequest(requestId)
  } catch (err) {
    alert('Failed to reject request. Please try again.')
  }
}

async function handleCancelRequest(requestId: string) {
  if (!confirm('Are you sure you want to cancel this request?')) return
  try {
    await requestStore.cancelRequest(requestId, authStore.userId!)
  } catch (err) {
    alert('Failed to cancel request. Please try again.')
  }
}

async function handleMarkPickedUp(transactionId: string) {
  try {
    await transactionStore.markPickedUp(transactionId)
    alert('Pickup confirmed!')
  } catch (err) {
    alert('Failed to confirm pickup. Please try again.')
  }
}

async function handleMarkReturned(transactionId: string) {
  try {
    await transactionStore.markReturned(transactionId)
    alert('Marked as returned! Waiting for owner confirmation.')
  } catch (err) {
    alert('Failed to mark as returned. Please try again.')
  }
}

async function handleConfirmReturn(transactionId: string) {
  try {
    await transactionStore.confirmReturn(transactionId)
    alert('Return confirmed! Transaction completed.')
  } catch (err) {
    alert('Failed to confirm return. Please try again.')
  }
}

async function handleCancelTransaction(transactionId: string) {
  if (!confirm('Are you sure you want to cancel this transaction?')) return
  try {
    await transactionStore.cancelTransaction(transactionId)
    alert('Transaction cancelled.')
  } catch (err) {
    alert('Failed to cancel transaction. Please try again.')
  }
}
</script>

