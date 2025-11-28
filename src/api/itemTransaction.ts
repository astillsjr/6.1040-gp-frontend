// API client for ItemTransaction concept
import { apiClient, buildApiPath, extractData } from './client'

export type TransactionType = 'BORROW' | 'TRANSFER' | 'ITEM'
export type TransactionStatus = 'PENDING_PICKUP' | 'IN_PROGRESS' | 'PENDING_RETURN' | 'COMPLETED' | 'CANCELLED'

export interface ItemTransaction {
  _id: string
  from: string
  to: string
  item: string
  type: TransactionType
  status: TransactionStatus
  fromNotes: string
  toNotes: string
  createdAt: Date
  pickedUpAt: Date | null
  returnedAt: Date | null
}

export interface CreateTransactionRequest {
  from: string
  to: string
  item: string
  type: TransactionType
  fromNotes: string
  toNotes: string
}

export interface CreateTransactionResponse {
  transaction: string
}

export async function getTransactionsByUser(data: { user: string }): Promise<ItemTransaction[]> {
  const response = await apiClient.post<ItemTransaction[]>(
    buildApiPath('ItemTransaction/_getTransactionsByUser'),
    data
  )
  return extractData(response)
}

export async function getTransaction(data: { transaction: string }): Promise<ItemTransaction> {
  const response = await apiClient.post<Array<{ transactionDoc: ItemTransaction }>>(
    buildApiPath('ItemTransaction/_getTransaction'),
    data
  )
  const result = extractData(response)
  return result[0].transactionDoc
}

export async function markPickedUp(data: { transaction: string }): Promise<void> {
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemTransaction/markPickedUp'), { ...data, accessToken })
}

export async function markReturned(data: { transaction: string }): Promise<void> {
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemTransaction/markReturned'), { ...data, accessToken })
}

export async function confirmReturn(data: { transaction: string }): Promise<void> {
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemTransaction/confirmReturn'), { ...data, accessToken })
}

export async function cancelTransaction(data: { transaction: string }): Promise<void> {
  const accessToken = localStorage.getItem('accessToken')
  await apiClient.post(buildApiPath('ItemTransaction/cancelTransaction'), { ...data, accessToken })
}
