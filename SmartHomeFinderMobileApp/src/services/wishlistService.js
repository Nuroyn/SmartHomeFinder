import { api } from './api'

export const wishlistService = {
  fetch: () => api.get('/api/users/wishlist'),
  fetchIds: () => api.get('/api/users/wishlist/ids'),
  add: (propertyId) => api.post('/api/users/wishlist', { propertyId }),
  remove: (propertyId) => api.delete(`/api/users/wishlist/${propertyId}`),
}
