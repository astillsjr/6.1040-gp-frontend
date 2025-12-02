// Pinia store for Request management
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as itemRequestingAPI from '@/api/itemRequesting'
import * as itemsAPI from '@/api/items'
import type { ItemRequest } from '@/api/itemRequesting'
import type { Item } from '@/api/items'

export interface RequestWithItem extends ItemRequest {
  itemDetails: Item
}

export const useRequestStore = defineStore('request', () => {
  // State
  const incomingRequests = ref<RequestWithItem[]>([])
  const outgoingRequests = ref<RequestWithItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchIncomingRequests(userId: string) {
    isLoading.value = true
    error.value = null

    try {
      // Get all items owned by the user
      const { items } = await itemsAPI.getItemsByOwner({ owner: userId })

      // For each item, get requests
      const allRequests: RequestWithItem[] = []

      for (const item of items) {
        try {
          const requests = await itemRequestingAPI.getRequestsByItem({ item: item._id })

          for (const req of requests) {
            allRequests.push({
              ...req,
              itemDetails: item,
            })
          }
        } catch (err) {
          console.error(`Failed to fetch requests for item ${item._id}:`, err)
        }
      }

      // Sort by createdAt, newest first
      incomingRequests.value = allRequests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch incoming requests'
      console.error('Error fetching incoming requests:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOutgoingRequests(userId: string) {
    isLoading.value = true
    error.value = null

    try {
      // Get requests made by this user
      const requests = await itemRequestingAPI.getRequestsByRequester({ requester: userId })

      // Fetch item details for each request
      const requestsWithItems: RequestWithItem[] = []

      for (const req of requests) {
        try {
          const itemDetails = await itemsAPI.getItemById({ item: req.item })
          requestsWithItems.push({
            ...req,
            itemDetails,
          })
        } catch (err) {
          console.error(`Failed to fetch item details for request ${req._id}:`, err)
        }
      }

      outgoingRequests.value = requestsWithItems.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch outgoing requests'
      console.error('Error fetching outgoing requests:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function acceptRequest(requestId: string): Promise<RequestWithItem | null> {
    isLoading.value = true
    error.value = null

    try {
      await itemRequestingAPI.acceptRequest({ request: requestId })

      // Update local state
      const request = incomingRequests.value.find((r) => r._id === requestId)
      if (request) {
        request.status = 'ACCEPTED'
        return request
      }
      return null
    } catch (err: any) {
      error.value = err.message || 'Failed to accept request'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function rejectRequest(requestId: string) {
    isLoading.value = true
    error.value = null

    try {
      await itemRequestingAPI.rejectRequest({ request: requestId })

      // Update local state
      const request = incomingRequests.value.find((r) => r._id === requestId)
      if (request) {
        request.status = 'REJECTED'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to reject request'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function cancelRequest(requestId: string, userId: string) {
    isLoading.value = true
    error.value = null

    try {
      await itemRequestingAPI.cancelRequest({ request: requestId, user: userId })

      // Update local state
      const request = outgoingRequests.value.find((r) => r._id === requestId)
      if (request) {
        request.status = 'CANCELLED'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to cancel request'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    incomingRequests,
    outgoingRequests,
    isLoading,
    error,
    fetchIncomingRequests,
    fetchOutgoingRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
  }
})

