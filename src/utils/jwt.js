/**
 * Utility functions for working with JWT tokens
 */

/**
 * Decode a JWT token without verification (for getting payload)
 * Note: This does NOT verify the signature. Always verify tokens on the backend.
 */
export function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Get user ID from access token
 */
export function getUserIdFromToken(accessToken) {
  if (!accessToken) return null
  const payload = decodeJWT(accessToken)
  return payload?.sub || null
}

/**
 * Check if token is expired (client-side check only)
 */
export function isTokenExpired(token) {
  if (!token) return true
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) return true
  const expirationTime = payload.exp * 1000 // Convert to milliseconds
  return Date.now() >= expirationTime
}
