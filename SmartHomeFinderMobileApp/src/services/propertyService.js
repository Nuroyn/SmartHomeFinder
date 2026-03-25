import { api } from './api'

function toQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
  return entries.length ? '?' + new URLSearchParams(entries).toString() : ''
}

export const propertyService = {
  /** Public: fetch approved + published properties (with optional search/filter) */
  fetchPublic: (params = {}) => api.get(`/api/users/properties${toQuery(params)}`),

  /** Public: single property by id */
  fetchById: (id) => api.get(`/api/users/properties/${id}`),

  /** Landlord: get own properties */
  fetchMine: () => api.get('/api/users/properties/mine'),

  /** Landlord: submit a new property */
  create: (payload) => api.post('/api/users/properties', payload),

  /** Landlord: update property GPS */
  verifyLocation: (id, coords) => api.patch(`/api/users/properties/${id}/verify-location`, coords),

  /** User: submit a property inquiry */
  requestProperty: (payload) => api.post('/api/users/property-request', payload),
}
