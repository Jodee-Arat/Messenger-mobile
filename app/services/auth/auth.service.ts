// services/auth/logout.ts (пример)
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'

import {
	EnumAsyncStorage,
	EnumSecureStore
} from '@/types/interface/auth.interface'

import { deleteTokensStorage } from '@/services/auth/auth.helper'

import { navigationRef, resetToAuth } from '@/navigation/navigate'

import { authStore } from '@/store/auth/auth.store'
import { userStore } from '@/store/user/user.store'

import { rebuildWebsocketLink } from '@/libs/apollo-client'

export const handleLogout = async () => {
	try {
		await deleteTokensStorage()
		await AsyncStorage.removeItem(EnumAsyncStorage.USER_ID)

		authStore.getState().setIsAuthenticated(false)
		userStore.getState().setUserId?.('')

		await AsyncStorage.setItem(EnumAsyncStorage.ACCESS_TOKEN, '')
		await SecureStore.deleteItemAsync(EnumSecureStore.REFRESH_TOKEN)
		await AsyncStorage.setItem(EnumAsyncStorage.USER_ID, '')

		if (navigationRef.isReady()) {
			navigationRef.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [{ name: 'Auth' }]
				})
			)
		}
	} catch (e) {
		console.error('handleLogout failed', e)
	}
}
