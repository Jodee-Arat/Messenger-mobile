// services/auth/logout.ts (пример)
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'

import {
	EnumAsyncStorage,
	EnumSecureStore
} from '@/types/interface/auth.interface'

import { deleteTokensStorage } from '@/services/auth/auth.helper'
import { revokeStoredSecretSession } from '@/services/secret/secret-session.service'

import { clearLocalSecretChatData } from '@/utils/secret-chat/secretChat'

import { navigationRef } from '@/navigation/navigate'

import { authStore } from '@/store/auth/auth.store'
import { userStore } from '@/store/user/user.store'

import { client, rebuildWebsocketLink } from '@/libs/apollo-client'
import { SERVER_URL } from '@/libs/constants/url.constant'

const LOGOUT_USER_MUTATION = `
	mutation LogoutUser {
		logoutUser
	}
`

const readAccessToken = async () => {
	const asyncStorageToken = await AsyncStorage.getItem(
		EnumAsyncStorage.ACCESS_TOKEN
	)

	if (asyncStorageToken) {
		return asyncStorageToken
	}

	return SecureStore.getItemAsync(EnumAsyncStorage.ACCESS_TOKEN)
}

const bestEffortLogoutAuthSession = async () => {
	const accessToken = await readAccessToken()
	const sessionId = await AsyncStorage.getItem(EnumAsyncStorage.SESSION_ID)

	if (!accessToken && !sessionId) {
		return false
	}

	try {
		const response = await fetch(SERVER_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'apollo-require-preflight': 'true',
				...(accessToken
					? {
							authorization: `Bearer ${accessToken}`
						}
					: {}),
				...(sessionId
					? {
							'x-session-id': sessionId
						}
					: {})
			},
			body: JSON.stringify({
				query: LOGOUT_USER_MUTATION
			})
		})

		const responseText = await response.text()
		let payload: {
			data?: { logoutUser?: boolean }
			errors?: unknown[]
		} | null = null

		try {
			payload = responseText ? JSON.parse(responseText) : null
		} catch {
			payload = null
		}

		if (!response.ok || payload?.errors?.length) {
			console.warn('[Auth] Failed to logout server session', {
				status: response.status,
				errors: payload?.errors ?? responseText
			})
			return false
		}

		return payload?.data?.logoutUser === true
	} catch (error) {
		console.warn('[Auth] Failed to logout server session', error)
		return false
	}
}

export const handleLogout = async () => {
	try {
		await Promise.allSettled([
			bestEffortLogoutAuthSession(),
			revokeStoredSecretSession()
		])
		await deleteTokensStorage()
		await AsyncStorage.removeItem(EnumAsyncStorage.USER_ID)
		await clearLocalSecretChatData()

		authStore.getState().setIsAuthenticated(false)
		authStore.getState().setIsAuthChecked(true)
		userStore.getState().setUserId?.('')

		await AsyncStorage.removeItem(EnumAsyncStorage.ACCESS_TOKEN)
		await AsyncStorage.removeItem(EnumAsyncStorage.SESSION_ID)
		await SecureStore.deleteItemAsync(EnumSecureStore.REFRESH_TOKEN)
		await SecureStore.deleteItemAsync(EnumSecureStore.SECRET_SESSION_ID)
		await AsyncStorage.removeItem(EnumAsyncStorage.USER_ID)
		await client.clearStore()
		rebuildWebsocketLink()

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
