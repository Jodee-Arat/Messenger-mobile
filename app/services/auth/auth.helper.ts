import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'

import {
	EnumAsyncStorage,
	EnumSecureStore,
	IAuthResponse,
	ITokens
} from '@/types/interface/auth.interface'

import { clearSavedSecretLinkedWebSessionId } from '@/services/secret/saved-secret-link.service'

import { FindAllUsersQuery } from '@/graphql/generated/output'

// Получение access token
export const getAccessToken = async () => {
	const asyncStorageToken = await AsyncStorage.getItem(
		EnumAsyncStorage.ACCESS_TOKEN
	)
	if (asyncStorageToken) {
		return asyncStorageToken
	}

	const secureStoreToken = await getItemAsync(EnumAsyncStorage.ACCESS_TOKEN)
	if (secureStoreToken) {
		await AsyncStorage.setItem(
			EnumAsyncStorage.ACCESS_TOKEN,
			secureStoreToken
		)
		await deleteItemAsync(EnumAsyncStorage.ACCESS_TOKEN)
	}

	return secureStoreToken || null
}

// Сохранение токенов
export const saveTokensStorage = async (data: ITokens) => {
	await AsyncStorage.setItem(EnumAsyncStorage.ACCESS_TOKEN, data.accessToken)
	await deleteItemAsync(EnumAsyncStorage.ACCESS_TOKEN)
	await setItemAsync(EnumSecureStore.REFRESH_TOKEN, data.refreshToken)
}

// Удаление токенов
export const deleteTokensStorage = async () => {
	await AsyncStorage.removeItem(EnumAsyncStorage.ACCESS_TOKEN)
	await deleteItemAsync(EnumAsyncStorage.ACCESS_TOKEN)
	await AsyncStorage.removeItem(EnumAsyncStorage.SESSION_ID)
	await deleteItemAsync(EnumSecureStore.REFRESH_TOKEN)
	await deleteItemAsync(EnumSecureStore.SECRET_SESSION_ID)
	await AsyncStorage.removeItem(EnumAsyncStorage.MY_PRE_KEYS)
	await clearSavedSecretLinkedWebSessionId()
}

// Получение userId
export const getUserIdFromStorage = async (): Promise<
	FindAllUsersQuery['findAllUsers'][0]['id']
> => {
	try {
		const stored = await AsyncStorage.getItem(EnumAsyncStorage.USER_ID)
		return JSON.parse(stored || '{}')
	} catch (e) {
		console.log('[getUserIdFromStorage] parse error', e)
		return ''
	}
}

// Сохранение userId + токены
export const saveToStorage = async (data: IAuthResponse) => {
	await saveTokensStorage(data)
	try {
		await AsyncStorage.setItem(
			EnumAsyncStorage.USER_ID,
			JSON.stringify(data.user.id)
		)
	} catch (e) {
		console.log('[saveToStorage] error saving userId', e)
	}
}
