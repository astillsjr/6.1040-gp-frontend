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

  async function acceptRequest(requestId: string) {
    isLoading.value = true
    error.value = null

    try {
      await itemRequestingAPI.acceptRequest({ request: requestId })

      // Update local state
      const request = incomingRequests.value.find((r) => r._id === requestId)
      if (request) {
        request.status = 'ACCEPTED'
      }
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

  async function createRequest(data: {
    requester: string
    item: string
    type: 'BORROW' | 'TRANSFER' | 'ITEM'
    requesterNotes: string
    requestedStartTime: Date | null
    requestedEndTime: Date | null
  }): Promise<string> {
    isLoading.value = true
    error.value = null

    try {
      const response = await itemRequestingAPI.createRequest({
        requester: data.requester,
        item: data.item,
        type: data.type,
        status: 'PENDING',
        requesterNotes: data.requesterNotes,
        requestedStartTime: data.requestedStartTime,
        requestedEndTime: data.requestedEndTime,
      })

      // Fetch the created request with item details and add to outgoing requests
      // This will be updated via SSE, but we can optimistically add it
      try {
        const itemDetails = await itemsAPI.getItemById({ item: data.item })
        const newRequest: RequestWithItem = {
          _id: response.request,
          requester: data.requester,
          item: data.item,
          type: data.type,
          status: 'PENDING',
          requesterNotes: data.requesterNotes,
          requestedStartTime: data.requestedStartTime,
          requestedEndTime: data.requestedEndTime,
          createdAt: new Date(),
          itemDetails,
        }
        outgoingRequests.value.unshift(newRequest)
      } catch (err) {
        // If we can't fetch item details, that's okay - SSE will update it
        console.warn('Could not fetch item details for new request:', err)
      }

      return response.request
    } catch (err: any) {
      error.value = err.message || 'Failed to create request'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Handle SSE request updates
  function handleRequestUpdate(updatedRequest: ItemRequest) {
    // Update in incoming requests if it exists
    const incomingIndex = incomingRequests.value.findIndex(
      (r) => r._id === updatedRequest._id
    )
    if (incomingIndex !== -1) {
      // Update the request, preserving itemDetails
      const existing = incomingRequests.value[incomingIndex]
      incomingRequests.value[incomingIndex] = {
        ...updatedRequest,
        itemDetails: existing.itemDetails,
      }
    }

    // Update in outgoing requests if it exists
    const outgoingIndex = outgoingRequests.value.findIndex(
      (r) => r._id === updatedRequest._id
    )
    if (outgoingIndex !== -1) {
      // Update the request, preserving itemDetails
      const existing = outgoingRequests.value[outgoingIndex]
      outgoingRequests.value[outgoingIndex] = {
        ...updatedRequest,
        itemDetails: existing.itemDetails,
      }

      // If request was accepted, show notification
      if (updatedRequest.status === 'ACCEPTED') {
        import('@/stores/notificationStore').then(async ({ useNotificationStore }) => {
          const notificationStore = useNotificationStore()
          await notificationStore.showRequestAcceptedNotification(updatedRequest, existing.itemDetails)
        })
      }
    } else if (updatedRequest.status === 'ACCEPTED') {
      // Request not in our list yet, but it was accepted - fetch item details and show notification
      itemsAPI.getItemById({ item: updatedRequest.item })
        .then(async (itemDetails) => {
          const { useNotificationStore } = await import('@/stores/notificationStore')
          const notificationStore = useNotificationStore()
          await notificationStore.showRequestAcceptedNotification(updatedRequest, itemDetails)
        })
        .catch((err) => {
          console.error('Failed to fetch item details for notification:', err)
        })
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
    createRequest,
    handleRequestUpdate,
  }
})

