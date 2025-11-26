// API client for ItemTransaction concept
import { apiClient, buildApiPath, extractData } from './client'

export type TransactionType = 'BORROW' | 'TRANSFER' | 'ITEM'
export type TransactionStatus =
  | 'PENDING_PICKUP'
  | 'IN_PROGRESS'
  | 'PENDING_RETURN'
  | 'COMPLETED'
  | 'CANCELLED'

export interface Transaction {
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

export interface GetTransactionRequest {
  transaction: string
}

export async function createTransaction(
  data: CreateTransactionRequest
): Promise<CreateTransactionResponse> {
  const response = await apiClient.post<CreateTransactionResponse>(
    buildApiPath('ItemTransaction/createTransaction'),
    data
  )
  return extractData(response)
}

export async function markPickedUp(data: { transaction: string }): Promise<void> {
  await apiClient.post(buildApiPath('ItemTransaction/markPickedUp'), data)
}

export async function markReturned(data: { transaction: string }): Promise<void> {
  await apiClient.post(buildApiPath('ItemTransaction/markReturned'), data)
}

export async function confirmReturn(data: { transaction: string }): Promise<void> {
  await apiClient.post(buildApiPath('ItemTransaction/confirmReturn'), data)
}

export async function cancelTransaction(
  data: { transaction: string }
): Promise<void> {
  await apiClient.post(buildApiPath('ItemTransaction/cancelTransaction'), data)
}

export async function getTransaction(
  data: GetTransactionRequest
): Promise<Transaction> {
  const response = await apiClient.post<Array<{ transactionDoc: Transaction }>>(
    buildApiPath('ItemTransaction/_getTransaction'),
    data
  )
  const result = extractData(response)
  return result[0].transactionDoc
}

