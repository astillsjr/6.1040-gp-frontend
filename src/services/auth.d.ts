// Type declarations for auth.js (temporary until migration complete)
export interface AuthService {
  isAuthenticated(): boolean
  getTokens(): { accessToken: string | null; refreshToken: string | null }
  getCurrentUserId(): string | null
  setTokens(accessToken: string, refreshToken: string): void
  clearTokens(): void
  register(username: string, password: string, email: string): Promise<{
    success: boolean
    user?: string
    error?: string
  }>
  login(username: string, password: string): Promise<{
    success: boolean
    error?: string
  }>
  logout(): Promise<void>
}

export declare const authService: AuthService

