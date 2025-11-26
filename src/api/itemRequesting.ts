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
  const response = await apiClient.post<CreateRequestResponse>(
    buildApiPath('ItemRequesting/createRequest'),
    data
  )
  return extractData(response)
}

export async function acceptRequest(data: { request: string }): Promise<void> {
  await apiClient.post(buildApiPath('ItemRequesting/acceptRequest'), data)
}

export async function rejectRequest(data: { request: string }): Promise<void> {
  await apiClient.post(buildApiPath('ItemRequesting/rejectRequest'), data)
}

export async function cancelRequest(data: {
  request: string
  user: string
}): Promise<void> {
  await apiClient.post(buildApiPath('ItemRequesting/cancelRequest'), data)
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

