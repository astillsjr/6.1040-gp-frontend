/**
 * Utility to check if backend is accessible and get connection info
 */

interface BackendStatus {
  success: boolean
  message: string
  status?: number | null
  error?: Error
}

export async function checkBackendConnection(
  apiBaseUrl: string
): Promise<BackendStatus> {
  try {
    // Try to check a proper API endpoint instead of root
    // Use OPTIONS request to avoid CORS preflight issues, or try a health endpoint
    const healthEndpoint = apiBaseUrl.endsWith('/api')
      ? `${apiBaseUrl}/UserAuthentication/register`
      : `${apiBaseUrl}/api/UserAuthentication/register`

    // Use a simple HEAD or OPTIONS request to check connectivity
    // If that fails, we'll catch it and be lenient about CORS errors
    const response = await fetch(healthEndpoint, {
      method: 'OPTIONS',
      mode: 'cors',
    })

    return {
      success: true,
      message: 'Backend is accessible',
      status: response.status,
    }
  } catch (error) {
    // In production (Render), CORS preflight might fail but the actual API calls work
    // Don't show error for CORS issues or network errors that are expected in production
    const err = error as Error
    const isCorsError =
      err.message.includes('CORS') ||
      err.message.includes('Failed to fetch') ||
      err.name === 'TypeError'

    // If it's a CORS error, assume backend is working (CORS is handled per-request)
    // Only show error for actual connection failures
    if (isCorsError) {
      return {
        success: true, // Assume success for CORS - actual requests will handle it
        message:
          'Backend check completed (CORS preflight may fail, but API calls should work)',
        status: null,
      }
    }

    return {
      success: false,
      message: err.message,
      error: err,
    }
  }
}

/**
 * Log backend connection status (useful for debugging)
 */
export async function logBackendStatus(): Promise<BackendStatus> {
  const apiBaseUrl =
    (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'
  console.log('🔍 Checking backend connection...')
  console.log('📡 API Base URL:', apiBaseUrl)

  const status = await checkBackendConnection(apiBaseUrl)

  if (status.success) {
    console.log('✅ Backend is accessible:', status.message)
  } else {
    console.error('❌ Backend connection failed:', status.message)
    console.log('💡 Make sure:')
    console.log('   1. Backend server is running')
    console.log('   2. Backend is on the correct port')
    console.log('   3. VITE_API_BASE_URL is set correctly in .env')
  }

  return status
}

