/**
 * Utility to check if backend is accessible and get connection info
 */
export async function checkBackendConnection(apiBaseUrl) {
  try {
    const response = await fetch(`${apiBaseUrl}/`)
    const text = await response.text()
    return {
      success: true,
      message: text,
      status: response.status
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error
    }
  }
}

/**
 * Log backend connection status (useful for debugging)
 */
export async function logBackendStatus() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
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
