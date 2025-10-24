import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'

import {
	EnumAsyncStorage,
	EnumSecureStore,
	IAuthResponse,
	ITokens
} from '@/types/interface/auth.interface'

import { FindAllUsersQuery } from '@/graphql/generated/output'

export const getAccessToken = async () => {
	const accessToken = await getItemAsync(EnumSecureStore.ACCESS_TOKEN)
	return accessToken || null
}

export const saveTokensStorage = async (data: ITokens) => {
	await setItemAsync(EnumSecureStore.ACCESS_TOKEN, data.accessToken)
	await setItemAsync(EnumSecureStore.REFRESH_TOKEN, data.refreshToken)
}

export const deleteTokensStorage = async () => {
	await deleteItemAsync(EnumSecureStore.ACCESS_TOKEN)
	await deleteItemAsync(EnumSecureStore.REFRESH_TOKEN)
}

export const getUserIdFromStorage = async (): Promise<
	FindAllUsersQuery['findAllUsers'][0]['id']
> => {
	try {
		return JSON.parse(
			(await AsyncStorage.getItem(EnumAsyncStorage.USER_ID)) || '{}'
		)
	} catch (e) {
		return ''
	}
}

export const saveToStorage = async (data: IAuthResponse) => {
	await saveTokensStorage(data)
	try {
		await AsyncStorage.setItem(
			EnumAsyncStorage.USER_ID,
			JSON.stringify(data.user.id)
		)
	} catch (e) {}
}
