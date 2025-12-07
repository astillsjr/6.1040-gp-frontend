// API client for Communication concept
import { apiClient, buildApiPath, extractData } from './client'

export interface BackendMessage {
  _id: string
  conversation: string
  author: string
  content: string
  createdAt: string
  readAt: string | null
}

export interface BackendConversation {
  _id: string
  participant1: string
  participant2: string
  transaction: string
  createdAt: string
  lastMessageAt: string
}

export interface CreateConversationRequest {
  participant1: string
  participant2: string
  transaction: string
  accessToken: string
}

export interface CreateConversationResponse {
  conversation: string
}

export interface SendMessageRequest {
  conversation: string
  content: string
  accessToken: string
}

export interface SendMessageResponse {
  message: string
}

export interface MarkMessageReadRequest {
  message: string
}

export interface MarkConversationReadRequest {
  conversation: string
  accessToken: string
}

export interface GetMessagesResponse {
  messages: BackendMessage[]
}

export interface GetConversationResponse {
  conversationDoc: BackendConversation
}

export interface GetConversationsByUserResponse {
  conversations: BackendConversation[]
}

/**
 * Create a new conversation for a transaction
 */
export async function createConversation(
  data: CreateConversationRequest
): Promise<CreateConversationResponse> {
  const response = await apiClient.post<CreateConversationResponse>(
    buildApiPath('Communication/createConversation'),
    data
  )
  return extractData(response)
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  data: SendMessageRequest
): Promise<SendMessageResponse> {
  const response = await apiClient.post<SendMessageResponse>(
    buildApiPath('Communication/sendMessage'),
    data
  )
  return extractData(response)
}

/**
 * Mark a specific message as read
 */
export async function markMessageRead(
  data: MarkMessageReadRequest
): Promise<void> {
  await apiClient.post(buildApiPath('Communication/markMessageRead'), data)
}

/**
 * Mark all unread messages in a conversation as read
 */
export async function markConversationRead(
  data: MarkConversationReadRequest
): Promise<void> {
  await apiClient.post(buildApiPath('Communication/markConversationRead'), data)
}

/**
 * Get all messages in a conversation
 */
export async function getMessages(
  data: { conversation: string }
): Promise<BackendMessage[]> {
  const response = await apiClient.post<GetMessagesResponse[]>(
    buildApiPath('Communication/_getMessages'),
    data
  )
  const result = extractData(response)
  // Response is an array with one element containing messages array
  return result[0]?.messages || []
}

/**
 * Get a conversation by ID
 * NOTE: This endpoint is not available. Use getConversationsByUser and filter client-side instead.
 * @deprecated This endpoint is unavailable - use getConversationsByUser and filter by conversation ID
 */
export async function getConversation(
  data: { conversation: string; user: string }
): Promise<BackendConversation | null> {
  // Replace with getConversationsByUser since _getConversation is unavailable
  const conversations = await getConversationsByUser({ user: data.user })
  return conversations.find(c => c._id === data.conversation) || null
}

/**
 * Get conversation by transaction ID
 * NOTE: This endpoint is not available. Use getConversationsByUser and filter client-side instead.
 * @deprecated This endpoint is unavailable - use getConversationsByUser and filter by transaction ID
 */
export async function getConversationByTransaction(
  data: { transaction: string; user: string }
): Promise<BackendConversation | null> {
  // Replace with getConversationsByUser since _getConversationByTransaction is unavailable
  const conversations = await getConversationsByUser({ user: data.user })
  return conversations.find(c => c.transaction === data.transaction) || null
}

/**
 * Get all conversations for a user
 */
export async function getConversationsByUser(
  data: { user: string }
): Promise<BackendConversation[]> {
  const response = await apiClient.post<GetConversationsByUserResponse>(
    buildApiPath('Communication/_getConversationsByUser'),
    data
  )
  const result = extractData(response)
  return result.conversations || []
}

/**
 * Get unread messages for a user
 */
export async function getUnreadMessagesByUser(
  data: { user: string }
): Promise<BackendMessage[]> {
  const response = await apiClient.post<BackendMessage[]>(
    buildApiPath('Communication/_getUnreadMessagesByUser'),
    data
  )
  return extractData(response)
}

