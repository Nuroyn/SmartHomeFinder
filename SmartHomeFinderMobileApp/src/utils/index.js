/**
 * Utility helpers shared across screens.
 */

/** Format price in Naira */
export function formatPrice(amount) {
  if (amount == null) return '—'
  return '₦' + Number(amount).toLocaleString('en-NG')
}

/** Title-case a string */
export function titleCase(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Truncate text to maxLen characters */
export function truncate(str, maxLen = 80) {
  if (!str || str.length <= maxLen) return str ?? ''
  return str.slice(0, maxLen).trimEnd() + '…'
}
