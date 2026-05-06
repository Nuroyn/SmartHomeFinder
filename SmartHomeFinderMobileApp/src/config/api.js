import Constants from 'expo-constants'
import { Platform } from 'react-native'

const extra = Constants.expoConfig?.extra ?? {}
const ENV_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

function resolveDevHost() {
	const hostUri =
		Constants.expoConfig?.hostUri ||
		Constants.expoGoConfig?.debuggerHost ||
		Constants.manifest?.debuggerHost ||
		Constants.manifest2?.extra?.expoGo?.debuggerHost

	if (hostUri && typeof hostUri === 'string') {
		return hostUri.split(':')[0]
	}

	if (Platform.OS === 'android') return '10.0.2.2'
	if (Platform.OS === 'ios') return 'localhost'
	return 'localhost'
}

function isValidApiBaseUrl(value) {
	return (
		typeof value === 'string' &&
		value.trim().length > 0 &&
		!value.includes('YOUR_LOCAL_IP')
	)
}

const DEV_HOST = resolveDevHost()
const DEV_API_BASE_URL = `http://${DEV_HOST}:5000`
const extraApiBaseUrl = isValidApiBaseUrl(extra.apiBaseUrl) ? extra.apiBaseUrl : null
const API_BASE_URL = ENV_API_BASE_URL || extraApiBaseUrl || DEV_API_BASE_URL

export { API_BASE_URL }
