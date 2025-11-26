// API client for ItemListing concept
import { apiClient, buildApiPath, extractData } from './client'

export type ListingType = 'BORROW' | 'TRANSFER'
export type ListingStatus = 'AVAILABLE' | 'PENDING' | 'CLAIMED' | 'EXPIRED'
export type WindowStatus = 'AVAILABLE' | 'RESERVED'

export interface Listing {
  _id: string
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
  await apiClient.post(buildApiPath('ItemListing/listItem'), data)
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
  await apiClient.post(buildApiPath('ItemListing/addPhoto'), data)
}

export async function removePhoto(data: RemovePhotoRequest): Promise<void> {
  await apiClient.post(buildApiPath('ItemListing/removePhoto'), data)
}

export async function setAvailability(
  data: SetAvailabilityRequest
): Promise<SetAvailabilityResponse> {
  const response = await apiClient.post<SetAvailabilityResponse>(
    buildApiPath('ItemListing/setAvailability'),
    data
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
  await apiClient.post(buildApiPath('ItemListing/removeAvailability'), data)
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

