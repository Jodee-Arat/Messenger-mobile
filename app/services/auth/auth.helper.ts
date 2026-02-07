import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'

import {
	EnumAsyncStorage,
	EnumSecureStore,
	IAuthResponse,
	ITokens
} from '@/types/interface/auth.interface'

import { FindAllUsersQuery } from '@/graphql/generated/output'

// Получение access token
export const getAccessToken = async () => {
	const accessToken = await getItemAsync(EnumAsyncStorage.ACCESS_TOKEN)
	return accessToken || null
}

// Сохранение токенов
export const saveTokensStorage = async (data: ITokens) => {
	await setItemAsync(EnumAsyncStorage.ACCESS_TOKEN, data.accessToken)
	await setItemAsync(EnumSecureStore.REFRESH_TOKEN, data.refreshToken)
}

// Удаление токенов
export const deleteTokensStorage = async () => {
	await deleteItemAsync(EnumAsyncStorage.ACCESS_TOKEN)
	await deleteItemAsync(EnumSecureStore.REFRESH_TOKEN)
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
