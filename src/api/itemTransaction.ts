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

export interface GetSuccessfulBorrowsCountResponse {
  count: number
}

// Count successful matches by counting items with accepted requests
// This represents the number of successful matches (when a request is accepted, a match is created)
// We count items with accepted requests rather than relying on a backend endpoint that may return wrong data
export async function getSuccessfulBorrowsCount(): Promise<number> {
  try {
    console.log('📊 Counting successful matches (items with accepted requests)...')
    
    // Count items with accepted requests (this represents successful matches)
    // Import here to avoid circular dependencies
    const { getAllItems } = await import('./items')
    const { getRequestsByItem } = await import('./itemRequesting')
    
    const allItemsResponse = await getAllItems()
    const allItems = allItemsResponse.items
    
    let matchedCount = 0
    // Check each item for accepted requests
    for (const item of allItems) {
      try {
        const requests = await getRequestsByItem({ item: item._id })
        if (requests.some((req) => req.status === 'ACCEPTED')) {
          matchedCount++
        }
      } catch (err) {
        // Skip items we can't check (e.g., items without requests)
        // This is expected for items that haven't been requested
      }
    }
    
    console.log(`✅ Counted ${matchedCount} successful matches (items with accepted requests)`)
    return matchedCount
  } catch (error: any) {
    console.error('❌ Error counting successful matches:', error)
    // Return 0 on error instead of throwing, so the page still loads
    return 0
  }
}
