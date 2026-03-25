import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '../constants'
import { API_BASE_URL } from '../config/api'

/**
 * Lightweight fetch wrapper that auto-attaches the JWT token.
 */
async function request(path, options = {}) {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN)

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  // Remove any explicitly-undefined header values
  Object.keys(headers).forEach((k) => { if (headers[k] === undefined) delete headers[k] })

  const url = `${API_BASE_URL}${path}`
  console.log('[API]', options.method || 'GET', url)

  const res = await fetch(url, { ...options, headers })

  // Try to parse JSON; fall back to text
  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    const message = typeof data === 'object' ? data.message : data
    const err = new Error(message || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),

  /** Upload a file via multipart/form-data. */
  upload: (path, formData) =>
    request(path, { method: 'POST', body: formData }),
}
