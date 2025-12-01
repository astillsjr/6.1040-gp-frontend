// API client for UserAuthentication concept
import { apiClient, buildApiPath, extractData } from './client'

export interface RegisterRequest {
  username: string
  password: string
  email: string
}

export interface RegisterResponse {
  user: string
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface ChangePasswordRequest {
  accessToken: string
  oldPassword: string
  newPassword: string
}

export interface DeleteAccountRequest {
  accessToken: string
  password: string
}

export interface GetUserFromTokenRequest {
  accessToken: string
}

export interface GetUserFromTokenResponse {
  user: string
}

export interface GetUserCountResponse {
  userCount: number
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(
    buildApiPath('UserAuthentication/register'),
    data
  )
  return extractData(response)
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    buildApiPath('UserAuthentication/login'),
    data
  )
  return extractData(response)
}

export async function refreshAccessToken(
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>(
    buildApiPath('UserAuthentication/refreshAccessToken'),
    data
  )
  return extractData(response)
}

export async function logout(data: RefreshTokenRequest): Promise<void> {
  await apiClient.post(buildApiPath('UserAuthentication/logout'), data)
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.post(buildApiPath('UserAuthentication/changePassword'), data)
}

export async function deleteAccount(data: DeleteAccountRequest): Promise<void> {
  await apiClient.post(buildApiPath('UserAuthentication/deleteAccount'), data)
}

export async function getUserFromToken(
  data: GetUserFromTokenRequest
): Promise<GetUserFromTokenResponse> {
  const response = await apiClient.post<GetUserFromTokenResponse[]>(
    buildApiPath('UserAuthentication/_getUserFromToken'),
    data
  )
  const result = extractData(response)
  return result[0]
}

export async function getUserCount(): Promise<number> {
  try {
    console.log('🌐 Calling getUserCount endpoint...')
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 8 seconds')), 8000)
    })
    
    // Race between the API call and timeout
    const apiCall = apiClient.post<GetUserCountResponse[]>(
      buildApiPath('UserAuthentication/_getUserCount'),
      {},
      { timeout: 10000 }
    )
    
    const response = await Promise.race([apiCall, timeoutPromise])
    const result = extractData(response)
    console.log('✅ User count response:', result)
    
    if (Array.isArray(result) && result.length > 0 && result[0]?.userCount !== undefined) {
      return result[0].userCount
    }
    
    console.warn('⚠️ Unexpected user count response format:', result)
    return 0
  } catch (error: any) {
    console.error('❌ Error fetching user count:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    })
    // Return 0 on error instead of throwing, so the page still loads
    return 0
  }
}

