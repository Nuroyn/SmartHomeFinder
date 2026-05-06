import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '../constants'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

const initialState = { user: null, token: null, ready: false }

function normalizeUser(u, previousUser = null) {
  if (!u) return null

  const avatarUrl = u.avatar_url || u.avatar || previousUser?.avatar_url || previousUser?.avatar || null
  const isVerified =
    typeof u.is_verified === 'boolean'
      ? u.is_verified
      : (typeof u.verified === 'boolean' ? u.verified : (previousUser?.is_verified ?? false))

  return {
    ...u,
    avatar_url: avatarUrl,
    avatar: avatarUrl,
    is_verified: isVerified,
    verified: isVerified,
  }
}

/** Keep only the fields we need persisted (SecureStore has a 2 KB limit). */
function compactUser(u) {
  if (!u) return null
  const user = normalizeUser(u)
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar_url: user.avatar_url,
    avatar: user.avatar,
    is_verified: user.is_verified,
    verified: user.verified,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE':
      return { ...state, user: action.user, token: action.token, ready: true }
    case 'LOGIN':
      return { ...state, user: action.user, token: action.token }
    case 'LOGOUT':
      return { ...state, user: null, token: null }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Restore persisted session on app launch
  useEffect(() => {
    ;(async () => {
      try {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN)
        const raw = await SecureStore.getItemAsync(STORAGE_KEYS.USER)
        const user = raw ? JSON.parse(raw) : null

        if (token && user) {
          // Validate token is still good
          try {
            const { user: freshUser } = await authService.getProfile()
            dispatch({ type: 'RESTORE', user: normalizeUser(freshUser, user), token })
          } catch {
            // Token expired / invalid — clear
            await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN)
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER)
            dispatch({ type: 'RESTORE', user: null, token: null })
          }
        } else {
          dispatch({ type: 'RESTORE', user: null, token: null })
        }
      } catch {
        dispatch({ type: 'RESTORE', user: null, token: null })
      }
    })()
  }, [])

  const actions = useMemo(
    () => ({
      login: async (user, token) => {
        const normalized = compactUser(user)
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token)
        await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(normalized))
        dispatch({ type: 'LOGIN', user: normalized, token })
      },
      logout: async () => {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN)
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER)
        dispatch({ type: 'LOGOUT' })
      },
      updateUser: async (fields) => {
        const updated = compactUser(normalizeUser({ ...state.user, ...fields }, state.user))
        await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(updated))
        dispatch({ type: 'UPDATE_USER', payload: updated })
      },
    }),
    [state.user],
  )

  const value = useMemo(
    () => ({
      user: state.user,
      token: state.token,
      isLoggedIn: !!state.token,
      ready: state.ready,
      ...actions,
    }),
    [state, actions],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
