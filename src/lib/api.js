export function apiBase() {
  const raw = import.meta.env.VITE_BACKEND_URL || ''
  return String(raw).replace(/\/$/, '')
}

export async function apiFetch(path, options = {}) {
  const base = apiBase()
  const url = path.match(/^https?:\/\//i) ? path : (base ? `${base}${path}` : path)
  return fetch(url, options)
}

export default apiFetch
