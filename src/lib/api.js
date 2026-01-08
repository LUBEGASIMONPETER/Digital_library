export function apiBase() {
  const raw = import.meta.env.VITE_BACKEND_URL || ''
  return String(raw).replace(/\/$/, '')
}

export async function apiFetch(path, options = {}) {
  const base = apiBase()
  // If we have a base URL set, use it; otherwise use relative paths that will be proxied by Vite
  const url = path.match(/^https?:\/\//i) ? path : (base ? `${base}${path}` : path)
  
  // Add user ID and token to headers if available in localStorage
  const headers = { ...options.headers }
  try {
    const authUser = localStorage.getItem('auth_user')
    if (authUser) {
      const user = JSON.parse(authUser)
      if (user && user.id) {
        headers['X-User-ID'] = user.id
      }
      // Add JWT token if available (for OAuth users)
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`
      }
    }
  } catch (e) {
    // ignore
  }

  // Add timeout to prevent hanging requests
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      // Check if the response indicates auth is required
      const data = await response.clone().json().catch(() => ({}))
      if (data.code === 'AUTH_REQUIRED' || data.code === 'USER_NOT_FOUND') {
        // Clear auth state and redirect to login
        try {
          localStorage.removeItem('auth_user')
        } catch (e) {}
        
        // Only redirect if not already on auth pages
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login?error=session_expired'
        }
      }
    }
    
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.error('Request timeout:', url)
    }
    throw error
  }
}

export default apiFetch
