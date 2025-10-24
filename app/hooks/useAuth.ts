import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

import { authStore } from '../store/auth/auth.store'

export const useAuth = () => {
	const isAuthenticated = authStore(state => state.isAuthenticated)
	const setIsAuthenticated = authStore(state => state.setIsAuthenticated)

	const auth = () => setIsAuthenticated(true)
	const exit = async () => {
		setIsAuthenticated(false)
		await AsyncStorage.setItem('jwt-token', '')
		await SecureStore.deleteItemAsync('refresh-token')
	}

	return {
		isAuthenticated,
		auth,
		exit
	}
}
