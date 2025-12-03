// Pinia store for Item management
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as itemAPI from '@/api/items'
import * as itemListingAPI from '@/api/itemListing'
import * as itemRequestingAPI from '@/api/itemRequesting'
import * as userProfileAPI from '@/api/userProfile'
import type { Item as BackendItem } from '@/api/items'
import type { Listing } from '@/api/itemListing'
import type { UserProfile } from '@/api/userProfile'

// Display item type (combines Item + Listing + Profile data)
export interface DisplayItem {
  id: string
  name: string
  category: string
  image: string
  condition: 'Like New' | 'Good' | 'Fair'
  description: string
  owner: {
    id: string
    name: string
    avatar?: string
    rating: number
  }
  dorm: string
  pickupLocation: string
  tags: string[]
  listingId?: string
  listingType?: 'BORROW' | 'TRANSFER'
  listingStatus?: 'AVAILABLE' | 'PENDING' | 'CLAIMED' | 'EXPIRED'
}

export const useItemStore = defineStore('item', () => {
  // State
  const items = ref<DisplayItem[]>([])
  const currentItem = ref<DisplayItem | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Cache for profiles to avoid duplicate fetches
  const profileCache = ref<Map<string, UserProfile>>(new Map())

  // Getters
  const itemsByOwner = computed(() => {
    const grouped = new Map<string, DisplayItem[]>()
    items.value.forEach((item) => {
      const ownerId = item.owner.id
      if (!grouped.has(ownerId)) {
        grouped.set(ownerId, [])
      }
      grouped.get(ownerId)!.push(item)
    })
    return grouped
  })

  // Helper: Fetch profile and cache it
  async function getProfile(userId: string): Promise<UserProfile | null> {
    if (profileCache.value.has(userId)) {
      return profileCache.value.get(userId)!
    }

    try {
      const profile = await userProfileAPI.getProfile({ user: userId })
      if (profile) {
        profileCache.value.set(userId, profile)
        return profile
      }
      return null
    } catch (err) {
      console.error(`Failed to fetch profile for user ${userId}:`, err)
      return null
    }
  }

  // Helper: Get first photo URL for an item
  async function getItemPhoto(itemId: string): Promise<string | null> {
    try {
      const photos = await itemListingAPI.getPhotosByItem({ item: itemId })
      if (photos.length > 0) {
        // Sort by order and return first
        const sorted = photos.sort((a, b) => a.order - b.order)
        return sorted[0].photoUrl
      }
      return null
    } catch (err) {
      console.error(`Failed to fetch photos for item ${itemId}:`, err)
      return null
    }
  }

  // Helper: Check if an item is matched (has an accepted request)
  // An item is considered "matched" if it has an accepted request, which means
  // someone has already claimed it and a transaction has been created
  async function isItemMatched(itemId: string): Promise<boolean> {
    try {
      const requests = await itemRequestingAPI.getRequestsByItem({ item: itemId })
      // Check if any request has status ACCEPTED
      return requests.some((req) => req.status === 'ACCEPTED')
    } catch (err) {
      // If we can't fetch requests, assume item is not matched to be safe
      console.error(`Failed to check if item ${itemId} is matched:`, err)
      return false
    }
  }

  // Helper: Convert backend item to display item
  async function convertToDisplayItem(
    backendItem: BackendItem,
    listing?: Listing
  ): Promise<DisplayItem> {
    // Get owner profile
    const profile = await getProfile(backendItem.owner)
    const ownerName = profile?.displayName || 'Unknown User'
    const ownerDorm = profile?.dorm || 'Unknown Dorm'
    const ownerRating = profile
      ? (profile.lenderScore + profile.borrowerScore) / 2
      : 0

    // Get item photo
    const photoUrl = await getItemPhoto(backendItem._id)

    // Generate avatar URL from name (using dicebear like mock)
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ownerName)}`

    return {
      id: backendItem._id,
      name: backendItem.title,
      category: backendItem.category,
      image: photoUrl || 'https://via.placeholder.com/400x300?text=No+Image',
      condition: backendItem.condition as 'Like New' | 'Good' | 'Fair',
      description: backendItem.description,
      owner: {
        id: backendItem.owner,
        name: ownerName,
        avatar: avatarUrl,
        rating: Math.round(ownerRating * 10) / 10, // Round to 1 decimal
      },
      dorm: ownerDorm,
      pickupLocation: `${ownerDorm} - Main Lobby`, // Default, can be enhanced later
      tags: [], // Can be added later if needed
      listingId: listing?._id,
      listingType: listing?.type,
      listingStatus: listing?.status,
    }
  }

  // Actions
  async function fetchItems(filters?: {
    category?: string
    dorm?: string
    listingType?: string
    searchQuery?: string
  }) {
    try {
      isLoading.value = true
      error.value = null

      // Fetch all items
      const allItemsResponse = await itemAPI.getAllItems()
      const allItems = allItemsResponse.items

      // Check each item to see if it has an available listing and is not matched
      // Note: We check each item individually since listing response doesn't include item ID
      const itemsWithListings = await Promise.all(
        allItems.map(async (item) => {
          try {
            // Check if this item has an available listing
            const listing = await itemListingAPI.getListingByItem({
              item: item._id,
            })

            // Only include if listing exists and is available
            if (listing && listing.status === 'AVAILABLE') {
              // Check if item is already matched (has accepted request)
              const matched = await isItemMatched(item._id)
              if (matched) {
                // Item is matched, exclude it from browse page
                return null
              }

              // Apply dorm filter if specified
              if (
                filters?.dorm &&
                filters.dorm !== 'all' &&
                listing.dormVisibility !== filters.dorm
              ) {
                return null
              }

              // Apply listing type filter if specified
              if (
                filters?.listingType &&
                filters.listingType !== 'all' &&
                listing.type !== filters.listingType
              ) {
                return null
              }
              return { item, listing }
            }
            return null
          } catch (err) {
            // Item doesn't have a listing, skip it
            return null
          }
        })
      )

      const validItems = itemsWithListings.filter(
        (result) => result !== null
      ) as Array<{ item: BackendItem; listing: Listing }>

      // Convert to display items
      const displayItems = await Promise.all(
        validItems.map(({ item, listing }) =>
          convertToDisplayItem(item, listing)
        )
      )

      // Apply filters
      let filtered = displayItems

      if (filters?.category && filters.category !== 'all') {
        filtered = filtered.filter(
          (item) => item.category === filters.category
        )
      }

      if (filters?.listingType && filters.listingType !== 'all') {
        filtered = filtered.filter(
          (item) => item.listingType === filters.listingType
        )
      }

      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        )
      }

      items.value = filtered
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch items'
      error.value = errorMessage
      console.error('Error fetching items:', err)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchItemById(itemId: string) {
    try {
      isLoading.value = true
      error.value = null

      // Fetch item
      const backendItem = await itemAPI.getItemById({ item: itemId })

      // Try to get listing for this item
      let listing: Listing | undefined
      try {
        const listingResult = await itemListingAPI.getListingByItem({ item: itemId })
        if (listingResult) {
          listing = listingResult
        }
      } catch (err) {
        // Item might not be listed, that's okay
        console.log(`Item ${itemId} is not listed`)
      }

      // Convert to display item
      const displayItem = await convertToDisplayItem(backendItem, listing)
      currentItem.value = displayItem

      return displayItem
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch item'
      error.value = errorMessage
      console.error('Error fetching item:', err)
      currentItem.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createItem(data: {
    title: string
    description: string
    category: string
    condition: string
    owner: string
  }) {
    try {
      isLoading.value = true
      error.value = null

      const response = await itemAPI.createItem({
        owner: data.owner,
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition,
      })

      return response.item
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create item'
      error.value = errorMessage
      console.error('Error creating item:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(
    itemId: string,
    data: {
      title: string
      description: string
      category: string
      condition: string
    }
  ) {
    try {
      isLoading.value = true
      error.value = null

      await itemAPI.updateItemDetails({
        item: itemId,
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition,
      })

      // Refresh current item if it's the one being updated
      if (currentItem.value?.id === itemId) {
        await fetchItemById(itemId)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update item'
      error.value = errorMessage
      console.error('Error updating item:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(itemId: string, ownerId: string) {
    try {
      isLoading.value = true
      error.value = null

      await itemAPI.deleteItem({ item: itemId, owner: ownerId })

      // Remove from items list
      items.value = items.value.filter((item) => item.id !== itemId)

      // Clear current item if it's the one being deleted
      if (currentItem.value?.id === itemId) {
        currentItem.value = null
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete item'
      error.value = errorMessage
      console.error('Error deleting item:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearItems() {
    items.value = []
    currentItem.value = null
    error.value = null
    profileCache.value.clear()
  }

  return {
    // State
    items,
    currentItem,
    isLoading,
    error,
    // Getters
    itemsByOwner,
    // Actions
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    clearItems,
  }
})

