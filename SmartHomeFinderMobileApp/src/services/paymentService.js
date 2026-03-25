import { api } from './api'

function toQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
  return entries.length ? '?' + new URLSearchParams(entries).toString() : ''
}

export const paymentService = {
  initiate: (propertyId) => api.post('/api/payments/paystack/initiate', { propertyId }),
  verify: (reference) => api.get(`/api/payments/verify?reference=${encodeURIComponent(reference)}`),
  virtualAccount: (preferredBank) =>
    api.post('/api/payments/paystack/virtual-account', preferredBank ? { preferredBank } : {}),
  fetchMyTransactions: (params = {}) => api.get(`/api/v1/transactions/my${toQuery(params)}`),
}
