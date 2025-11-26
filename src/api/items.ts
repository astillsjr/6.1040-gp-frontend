// API client for Item concept
import { apiClient, buildApiPath, extractData } from './client'

export interface Item {
  _id: string
  owner: string
  title: string
  description: string
  category: string
  condition: string
  createdAt: Date
}

export interface CreateItemRequest {
  owner: string
  title: string
  description: string
  category: string
  condition: string
}

export interface CreateItemResponse {
  item: string
}

export interface CreateOwnerlessItemRequest {
  title: string
  description: string
  category: string
}

export interface UpdateItemDetailsRequest {
  item: string
  title: string
  description: string
  category: string
  condition: string
}

export interface DeleteItemRequest {
  item: string
  owner: string
}

export interface GetItemByIdRequest {
  item: string
}

export interface GetItemsByOwnerRequest {
  owner: string
}

export interface GetItemsByOwnerResponse {
  items: Item[]
}

export interface GetAllItemsResponse {
  items: Item[]
}

export async function createItem(
  data: CreateItemRequest
): Promise<CreateItemResponse> {
  const response = await apiClient.post<CreateItemResponse>(
    buildApiPath('Item/createItem'),
    data
  )
  return extractData(response)
}

export async function createOwnerlessItem(
  data: CreateOwnerlessItemRequest
): Promise<CreateItemResponse> {
  const response = await apiClient.post<CreateItemResponse>(
    buildApiPath('Item/createOwnerlessItem'),
    data
  )
  return extractData(response)
}

export async function updateItemDetails(data: UpdateItemDetailsRequest): Promise<void> {
  await apiClient.post(buildApiPath('Item/updateItemDetails'), data)
}

export async function deleteItem(data: DeleteItemRequest): Promise<void> {
  await apiClient.post(buildApiPath('Item/deleteItem'), data)
}

export async function getItemById(data: GetItemByIdRequest): Promise<Item> {
  const response = await apiClient.post<Array<{ item: Item }>>(
    buildApiPath('Item/_getItemById'),
    data
  )
  const result = extractData(response)
  return result[0].item
}

export async function getItemsByOwner(
  data: GetItemsByOwnerRequest
): Promise<GetItemsByOwnerResponse> {
  const response = await apiClient.post<GetItemsByOwnerResponse>(
    buildApiPath('Item/_getItemsByOwner'),
    data
  )
  return extractData(response)
}

export async function getAllItems(): Promise<GetAllItemsResponse> {
  const response = await apiClient.post<GetAllItemsResponse>(
    buildApiPath('Item/_getAllItems'),
    {}
  )
  return extractData(response)
}

