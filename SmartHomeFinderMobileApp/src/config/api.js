import Constants from 'expo-constants'
import { Platform } from 'react-native'

const extra = Constants.expoConfig?.extra ?? {}

// Resolve API base URL:
// 1. app.json extra.apiBaseUrl (production / staging)
// 2. Android emulator uses 10.0.2.2 to reach host machine
// 3. iOS simulator can use localhost directly
// 4. Physical devices need your Mac's LAN IP (set in app.json extra.apiBaseUrl)
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
const API_BASE_URL = extra.apiBaseUrl || `http://${DEV_HOST}:5002`

export { API_BASE_URL }
