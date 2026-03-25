import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '../constants'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

const initialState = { user: null, token: null, ready: false }

/** Keep only the fields we need persisted (SecureStore has a 2 KB limit). */
function compactUser(u) {
  if (!u) return null
  return { id: u.id, full_name: u.full_name, email: u.email, role: u.role, phone: u.phone, avatar_url: u.avatar_url }
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
            dispatch({ type: 'RESTORE', user: freshUser, token })
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
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token)
        await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(compactUser(user)))
        dispatch({ type: 'LOGIN', user: compactUser(user), token })
      },
      logout: async () => {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN)
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER)
        dispatch({ type: 'LOGOUT' })
      },
      updateUser: async (fields) => {
        const updated = compactUser({ ...state.user, ...fields })
        await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(updated))
        dispatch({ type: 'UPDATE_USER', payload: fields })
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
