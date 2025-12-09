// Pinia store for ItemListing management
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as itemListingAPI from '@/api/itemListing'
import type {
  Listing,
  ItemPhoto,
  AvailabilityWindow,
  ListItemRequest,
  AddPhotoRequest,
  SetAvailabilityRequest,
  UpdateListingDetailsRequest,
} from '@/api/itemListing'

export const useItemListingStore = defineStore('itemListing', () => {
  // State
  const listings = ref<Listing[]>([])
  const currentListing = ref<Listing | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Cache for photos and availability by item ID
  const photosCache = ref<Map<string, ItemPhoto[]>>(new Map())
  const availabilityCache = ref<Map<string, AvailabilityWindow[]>>(new Map())

  // Getters
  const availableListings = computed(() => {
    return listings.value.filter(listing => listing.status === 'AVAILABLE')
  })

  // Actions
  
  // Get listing by item ID
  async function getListingByItem(itemId: string): Promise<Listing | null> {
    try {
      isLoading.value = true
      error.value = null
      const listing = await itemListingAPI.getListingByItem({ item: itemId })
      currentListing.value = listing
      return listing
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch listing'
      console.error('Failed to fetch listing:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Get photos by item ID (with caching)
  async function getPhotosByItem(itemId: string): Promise<ItemPhoto[]> {
    // Check cache first
    if (photosCache.value.has(itemId)) {
      return photosCache.value.get(itemId)!
    }

    try {
      isLoading.value = true
      error.value = null
      const photos = await itemListingAPI.getPhotosByItem({ item: itemId })
      photosCache.value.set(itemId, photos)
      return photos
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch photos'
      console.error('Failed to fetch photos:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Get availability windows by item ID (with caching)
  async function getAvailabilityByItem(itemId: string): Promise<AvailabilityWindow[]> {
    // Check cache first
    if (availabilityCache.value.has(itemId)) {
      return availabilityCache.value.get(itemId)!
    }

    try {
      isLoading.value = true
      error.value = null
      const windows = await itemListingAPI.getAvailabilityByItem({ item: itemId })
      availabilityCache.value.set(itemId, windows)
      return windows
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch availability'
      console.error('Failed to fetch availability:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // List an item
  async function listItem(data: ListItemRequest): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      await itemListingAPI.listItem(data)
      // Invalidate cache for this item
      photosCache.value.delete(data.item)
      availabilityCache.value.delete(data.item)
      // Refresh listing if it's the current one
      if (currentListing.value?._id === data.item) {
        await getListingByItem(data.item)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to list item'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Add photo to item
  async function addPhoto(data: AddPhotoRequest): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      await itemListingAPI.addPhoto(data)
      // Invalidate cache for this item
      photosCache.value.delete(data.item)
    } catch (err: any) {
      error.value = err.message || 'Failed to add photo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Set availability window
  async function setAvailability(data: SetAvailabilityRequest): Promise<string> {
    try {
      isLoading.value = true
      error.value = null
      const response = await itemListingAPI.setAvailability(data)
      // Invalidate cache for this item
      availabilityCache.value.delete(data.item)
      return response.window
    } catch (err: any) {
      error.value = err.message || 'Failed to set availability'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update listing details
  async function updateListingDetails(data: UpdateListingDetailsRequest): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      await itemListingAPI.updateListingDetails(data)
      // Refresh listing if it's the current one
      if (currentListing.value?._id === data.item) {
        await getListingByItem(data.item)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update listing'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Unlist an item
  async function unlistItem(itemId: string): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      await itemListingAPI.unlistItem({ item: itemId })
      // Clear caches
      photosCache.value.delete(itemId)
      availabilityCache.value.delete(itemId)
      // Remove from listings if present
      listings.value = listings.value.filter(l => l._id !== itemId)
      if (currentListing.value?._id === itemId) {
        currentListing.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to unlist item'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Fetch all listings (with optional filters)
  async function fetchListings(filters?: {
    type?: 'BORROW' | 'TRANSFER'
    status?: 'AVAILABLE' | 'PENDING' | 'CLAIMED' | 'EXPIRED'
    dormVisibility?: string
  }): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      const fetchedListings = await itemListingAPI.getListings(filters || {})
      listings.value = fetchedListings
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch listings'
      console.error('Failed to fetch listings:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Clear caches for an item (useful after updates)
  function clearItemCache(itemId: string) {
    photosCache.value.delete(itemId)
    availabilityCache.value.delete(itemId)
  }

  // Clear all state
  function clearListings() {
    listings.value = []
    currentListing.value = null
    photosCache.value.clear()
    availabilityCache.value.clear()
    error.value = null
  }

  return {
    // State
    listings,
    currentListing,
    isLoading,
    error,
    // Getters
    availableListings,
    // Actions
    getListingByItem,
    getPhotosByItem,
    getAvailabilityByItem,
    listItem,
    addPhoto,
    setAvailability,
    updateListingDetails,
    unlistItem,
    fetchListings,
    clearItemCache,
    clearListings,
  }
})

