// API client for ItemRequesting concept
import { apiClient, buildApiPath, extractData } from './client'

export type RequestType = 'BORROW' | 'TRANSFER' | 'ITEM'
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'

export interface ItemRequest {
  _id: string
  requester: string
  item: string
  type: RequestType
  status: RequestStatus
  requesterNotes: string
  requestedStartTime: Date | null
  requestedEndTime: Date | null
  createdAt: Date
}

export interface CreateRequestRequest {
  requester: string
  item: string
  type: RequestType
  status: RequestStatus
  requesterNotes: string
  requestedStartTime: Date | null
  requestedEndTime: Date | null
}

export interface CreateRequestResponse {
  request: string
}

export interface GetRequestRequest {
  request: string
}

export interface GetItemForRequestRequest {
  request: string
}

export interface GetItemForRequestResponse {
  item: string
}

export interface GetOtherPendingRequestsRequest {
  item: string
  exclude: string
}

export interface GetOtherPendingRequestsResponse {
  otherRequest: string
}

export async function createRequest(
  data: CreateRequestRequest
): Promise<CreateRequestResponse> {
  // Include accessToken in request body for sync authentication
  // Sync will extract user ID from token and use it as requester
  const accessToken = localStorage.getItem('accessToken')
  const response = await apiClient.post<CreateRequestResponse>(
    buildApiPath('ItemRequesting/createRequest'),
    {
      item: data.item,
      type: data.type,
      notes: data.requesterNotes,
      startTime: data.requestedStartTime,
      endTime: data.requestedEndTime,
      accessToken
    }
  )
  return extractData(response)
}

export async function acceptRequest(data: { request: string }): Promise<void> {
  // Include accessToken in request body for sync authentication
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemRequesting/acceptRequest'), { request: data.request, accessToken })
}

export async function rejectRequest(data: { request: string }): Promise<void> {
  // Include accessToken in request body for sync authentication
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemRequesting/rejectRequest'), { request: data.request, accessToken })
}

export async function cancelRequest(data: {
  request: string
  user: string
}): Promise<void> {
  // Include accessToken in request body for sync authentication
  // Sync will verify the user is the requester
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemRequesting/cancelRequest'), { request: data.request, accessToken })
}

export async function getRequest(data: GetRequestRequest): Promise<ItemRequest> {
  const response = await apiClient.post<Array<{ requestDoc: ItemRequest }>>(
    buildApiPath('ItemRequesting/_getRequest'),
    data
  )
  const result = extractData(response)
  return result[0].requestDoc
}

export async function getItemForRequest(
  data: GetItemForRequestRequest
): Promise<GetItemForRequestResponse> {
  const response = await apiClient.post<Array<GetItemForRequestResponse>>(
    buildApiPath('ItemRequesting/_getItemForRequest'),
    data
  )
  const result = extractData(response)
  return result[0]
}

export async function getOtherPendingRequests(
  data: GetOtherPendingRequestsRequest
): Promise<GetOtherPendingRequestsResponse[]> {
  const response = await apiClient.post<Array<GetOtherPendingRequestsResponse>>(
    buildApiPath('ItemRequesting/_getOtherPendingRequests'),
    data
  )
  return extractData(response)
}

// Get all requests for a specific item (for owners to see incoming requests)
export async function getRequestsByItem(data: { item: string }): Promise<ItemRequest[]> {
  const response = await apiClient.post<ItemRequest[]>(
    buildApiPath('ItemRequesting/_getRequestsByItem'),
    data
  )
  return extractData(response)
}

// Get all requests made by a specific user (for users to see their outgoing requests)
export async function getRequestsByRequester(data: { requester: string }): Promise<ItemRequest[]> {
  const response = await apiClient.post<ItemRequest[]>(
    buildApiPath('ItemRequesting/_getRequestsByRequester'),
    data
  )
  return extractData(response)
}

