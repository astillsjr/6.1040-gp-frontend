// API client for ItemListing concept
import { apiClient, buildApiPath, extractData } from './client'

export type ListingType = 'BORROW' | 'TRANSFER'
export type ListingStatus = 'AVAILABLE' | 'PENDING' | 'CLAIMED' | 'EXPIRED'
export type WindowStatus = 'AVAILABLE' | 'RESERVED'

export interface Listing {
  _id: string
  item?: string
  type: ListingType
  status: ListingStatus
  dormVisibility: string
}

export interface ItemPhoto {
  _id: string
  item: string
  photoUrl: string
  order: number
}

export interface AvailabilityWindow {
  _id: string
  item: string
  startTime: Date
  endTime: Date
  status: WindowStatus
}

export interface ListItemRequest {
  item: string
  type: ListingType
  dormVisibility: string
}

export interface UpdateListingDetailsRequest {
  item: string
  dormVisibility: string
  type: ListingType
}

export interface AddPhotoRequest {
  item: string
  photoUrl: string
  order: number
}

export interface RemovePhotoRequest {
  item: string
  photoUrl: string
}

export interface SetAvailabilityRequest {
  item: string
  startTime: Date
  endTime: Date
}

export interface SetAvailabilityResponse {
  window: string
}

export interface UpdateListingStatusRequest {
  item: string
  status: ListingStatus
}

export interface ReserveWindowRequest {
  window: string
}

export interface RemoveAvailabilityRequest {
  window: string
}

export interface GetListingsRequest {
  type?: ListingType
  status?: ListingStatus
  dormVisibility?: string
}

export async function listItem(data: ListItemRequest): Promise<void> {
  // Include accessToken in request body for sync authentication
  // Sync will verify user owns the item
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemListing/listItem'), { ...data, accessToken })
}

export async function unlistItem(data: { item: string }): Promise<void> {
  await apiClient.post(buildApiPath('ItemListing/unlistItem'), data)
}

export async function updateListingDetails(
  data: UpdateListingDetailsRequest
): Promise<void> {
  await apiClient.post(buildApiPath('ItemListing/updateListingDetails'), data)
}

export async function addPhoto(data: AddPhotoRequest): Promise<void> {
  // Include accessToken in request body for sync authentication
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemListing/addPhoto'), { ...data, accessToken })
}

export async function removePhoto(data: RemovePhotoRequest): Promise<void> {
  // Include accessToken in request body for sync authentication
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemListing/removePhoto'), { ...data, accessToken })
}

export async function setAvailability(
  data: SetAvailabilityRequest
): Promise<SetAvailabilityResponse> {
  // Include accessToken in request body for sync authentication
  const accessToken = localStorage.getItem('accessToken')
  const response = await apiClient.post<SetAvailabilityResponse>(
    buildApiPath('ItemListing/setAvailability'),
    { ...data, accessToken }
  )
  return extractData(response)
}

export async function updateListingStatus(
  data: UpdateListingStatusRequest
): Promise<void> {
  await apiClient.post(buildApiPath('ItemListing/updateListingStatus'), data)
}

export async function reserveWindow(data: ReserveWindowRequest): Promise<void> {
  await apiClient.post(buildApiPath('ItemListing/reserveWindow'), data)
}

export async function removeAvailability(
  data: RemoveAvailabilityRequest
): Promise<void> {
  // Include accessToken in request body for sync authentication
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemListing/removeAvailability'), { ...data, accessToken })
}

export async function getListingByItem(data: { item: string }): Promise<Listing> {
  const response = await apiClient.post<Listing[]>(
    buildApiPath('ItemListing/_getListingByItem'),
    data
  )
  const result = extractData(response)
  return result[0]
}

export async function getPhotosByItem(data: { item: string }): Promise<ItemPhoto[]> {
  const response = await apiClient.post<ItemPhoto[]>(
    buildApiPath('ItemListing/_getPhotosByItem'),
    data
  )
  return extractData(response)
}

export async function getAvailabilityByItem(
  data: { item: string }
): Promise<AvailabilityWindow[]> {
  const response = await apiClient.post<AvailabilityWindow[]>(
    buildApiPath('ItemListing/_getAvailabilityByItem'),
    data
  )
  return extractData(response)
}

export async function getWindow(data: { window: string }): Promise<AvailabilityWindow> {
  const response = await apiClient.post<AvailabilityWindow[]>(
    buildApiPath('ItemListing/_getWindow'),
    data
  )
  const result = extractData(response)
  return result[0]
}

export async function getListings(
  data: GetListingsRequest = {}
): Promise<Listing[]> {
  const response = await apiClient.post<Listing[]>(
    buildApiPath('ItemListing/_getListings'),
    data
  )
  return extractData(response)
}

export interface GetAvailableItemCountResponse {
  count: number
}

export async function getAvailableListingCount(): Promise<number> {
  try {
    console.log('📦 Fetching available item count...')
    const response = await apiClient.post<Array<GetAvailableItemCountResponse>>(
      buildApiPath('ItemListing/_getAvailableItemCount'),
      {}
    )
    const result = extractData(response)
    const count = result.length > 0 ? result[0].count : 0
    console.log('✅ Available item count received:', count)
    return count
  } catch (error: any) {
    console.error('❌ Error fetching available item count:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    })
    return 0
  }
}

