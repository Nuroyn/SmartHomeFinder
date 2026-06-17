import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const isWeb = Platform.OS === 'web'

/**
 * Secure storage abstraction that works on both native and web.
 * - On web: uses localStorage
 * - On native: uses expo-secure-store
 */

export async function getItemAsync(key) {
  if (!key) return null

  if (isWeb) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }

  return await SecureStore.getItemAsync(key)
}

export async function setItemAsync(key, value) {
  if (!key) return
  if (value == null) value = ''

  if (isWeb) {
    try {
      window.localStorage.setItem(key, value)
      return
    } catch {
      return
    }
  }

  await SecureStore.setItemAsync(key, value)
}

export async function deleteItemAsync(key) {
  if (!key) return

  if (isWeb) {
    try {
      window.localStorage.removeItem(key)
      return
    } catch {
      return
    }
  }

  await SecureStore.deleteItemAsync(key)
}
