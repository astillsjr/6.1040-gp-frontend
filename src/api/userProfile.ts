// API client for UserProfile concept
import { apiClient, buildApiPath, extractData } from './client'

export interface UserProfile {
  _id: string
  displayName: string
  dorm: string
  bio: string
  createdAt: Date
  lenderScore: number
  borrowerScore: number
}

export interface CreateProfileRequest {
  user: string
  displayName: string
  dorm: string
}

export interface CreateProfileResponse {
  profile: string
}

export interface UpdateProfileRequest {
  user: string
  displayName: string
  dorm: string
  bio: string
}

export interface UpdateScoresRequest {
  user: string
  lenderScore: number
  borrowerScore: number
}

export interface GetProfileRequest {
  user: string
}

export interface GetUsersByDormRequest {
  dorm: string
}

export interface GetUsersByDormResponse {
  user: string
  displayName: string
}

export async function createProfile(
  data: CreateProfileRequest
): Promise<CreateProfileResponse> {
  const response = await apiClient.post<CreateProfileResponse>(
    buildApiPath('UserProfile/createProfile'),
    data
  )
  return extractData(response)
}

export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  await apiClient.post(buildApiPath('UserProfile/updateProfile'), data)
}

export async function updateScores(data: UpdateScoresRequest): Promise<void> {
  await apiClient.post(buildApiPath('UserProfile/updateScores'), data)
}

export async function getProfile(
  data: GetProfileRequest
): Promise<UserProfile | null> {
  const response = await apiClient.post<Array<{ profile: UserProfile }>>(
    buildApiPath('UserProfile/_getProfile'),
    data
  )
  const result = extractData(response)
  return result.length > 0 ? result[0].profile : null
}

export async function getUsersByDorm(
  data: GetUsersByDormRequest
): Promise<GetUsersByDormResponse[]> {
  const response = await apiClient.post<GetUsersByDormResponse[]>(
    buildApiPath('UserProfile/_getUsersByDorm'),
    data
  )
  return extractData(response)
}

