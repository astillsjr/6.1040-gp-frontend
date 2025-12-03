// Pinia store for Transaction management
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as itemTransactionAPI from '@/api/itemTransaction'
import * as itemsAPI from '@/api/items'
import type { ItemTransaction } from '@/api/itemTransaction'
import type { Item } from '@/api/items'

export interface TransactionWithItem extends ItemTransaction {
  itemDetails: Item
  isLending: boolean // true if current user is the lender (from), false if borrower (to)
}

export const useTransactionStore = defineStore('transaction', () => {
  // State
  const transactions = ref<TransactionWithItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchTransactions(userId: string) {
    isLoading.value = true
    error.value = null

    try {
      const allTransactions = await itemTransactionAPI.getTransactionsByUser({ user: userId })

      // Fetch item details for each transaction
      const transactionsWithItems: TransactionWithItem[] = []

      for (const transaction of allTransactions) {
        try {
          const itemDetails = await itemsAPI.getItemById({ item: transaction.item })
          transactionsWithItems.push({
            ...transaction,
            itemDetails,
            isLending: transaction.from === userId,
          })
        } catch (err) {
          console.error(`Failed to fetch item details for transaction ${transaction._id}:`, err)
        }
      }

      transactions.value = transactionsWithItems
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch transactions'
      console.error('Error fetching transactions:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function markPickedUp(transactionId: string) {
    isLoading.value = true
    error.value = null

    try {
      await itemTransactionAPI.markPickedUp({ transaction: transactionId })

      // Update local state
      const transaction = transactions.value.find((t) => t._id === transactionId)
      if (transaction) {
        transaction.status = transaction.type === 'BORROW' ? 'IN_PROGRESS' : 'COMPLETED'
        transaction.pickedUpAt = new Date()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark as picked up'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function markReturned(transactionId: string) {
    isLoading.value = true
    error.value = null

    try {
      await itemTransactionAPI.markReturned({ transaction: transactionId })

      // Update local state
      const transaction = transactions.value.find((t) => t._id === transactionId)
      if (transaction) {
        transaction.status = 'PENDING_RETURN'
        transaction.returnedAt = new Date()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark as returned'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function confirmReturn(transactionId: string) {
    isLoading.value = true
    error.value = null

    try {
      await itemTransactionAPI.confirmReturn({ transaction: transactionId })

      // Update local state
      const transaction = transactions.value.find((t) => t._id === transactionId)
      if (transaction) {
        transaction.status = 'COMPLETED'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to confirm return'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function cancelTransaction(transactionId: string) {
    isLoading.value = true
    error.value = null

    try {
      await itemTransactionAPI.cancelTransaction({ transaction: transactionId })

      // Update local state
      const transaction = transactions.value.find((t) => t._id === transactionId)
      if (transaction) {
        transaction.status = 'CANCELLED'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to cancel transaction'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Handle SSE transaction updates
  async function handleTransactionUpdate(updatedTransaction: ItemTransaction) {
    const existingIndex = transactions.value.findIndex(
      (t) => t._id === updatedTransaction._id
    )

    if (existingIndex !== -1) {
      // Update existing transaction, preserving itemDetails and isLending
      const existing = transactions.value[existingIndex]
      transactions.value[existingIndex] = {
        ...updatedTransaction,
        itemDetails: existing.itemDetails,
        isLending: existing.isLending,
      }

      // If status changed to PENDING_PICKUP, show notification to item owner
      if (updatedTransaction.status === 'PENDING_PICKUP') {
        const { useNotificationStore } = await import('@/stores/notificationStore')
        const notificationStore = useNotificationStore()
        notificationStore.showTransactionCreatedNotification(updatedTransaction, existing.itemDetails)
      }
    } else {
      // New transaction - fetch item details and add it
      try {
        const itemDetails = await itemsAPI.getItemById({ item: updatedTransaction.item })
        
        // Get userId from authStore to determine isLending
        const { useAuthStore } = await import('@/stores/authStore')
        const authStore = useAuthStore()
        const userId = authStore.getCurrentUserId()
        const isLending = userId ? updatedTransaction.from === userId : false

        transactions.value.push({
          ...updatedTransaction,
          itemDetails,
          isLending,
        })

        // If transaction is PENDING_PICKUP, show notification to item owner
        if (updatedTransaction.status === 'PENDING_PICKUP') {
          const { useNotificationStore } = await import('@/stores/notificationStore')
          const notificationStore = useNotificationStore()
          notificationStore.showTransactionCreatedNotification(updatedTransaction, itemDetails)
        }
      } catch (err) {
        console.error('Failed to fetch item details for transaction:', err)
      }
    }
  }

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    markPickedUp,
    markReturned,
    confirmReturn,
    cancelTransaction,
    handleTransactionUpdate,
  }
})

