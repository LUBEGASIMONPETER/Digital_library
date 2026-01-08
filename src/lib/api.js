export function apiBase() {
  const raw = import.meta.env.VITE_BACKEND_URL || ''
  return String(raw).replace(/\/$/, '')
}

export async function apiFetch(path, options = {}) {
  const base = apiBase()
  // If we have a base URL set, use it; otherwise use relative paths that will be proxied by Vite
  const url = path.match(/^https?:\/\//i) ? path : (base ? `${base}${path}` : path)
  
  // Add user ID to headers if available in localStorage
  const headers = { ...options.headers }
  try {
    const authUser = localStorage.getItem('auth_user')
    if (authUser) {
      const user = JSON.parse(authUser)
      if (user && user.id) {
        headers['X-User-ID'] = user.id
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
