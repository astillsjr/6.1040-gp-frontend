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

