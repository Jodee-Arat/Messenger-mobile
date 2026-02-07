import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'

import { EnumAsyncStorage } from '@/types/interface/auth.interface'

import { userStore } from '@/store/user/user.store'

export const useUser = () => {
	const userIdFromStore = userStore(state => state.userId)
	const setUserIdStore = userStore(state => state.setUserId)

	const [userId, setUserIdState] = useState<string>(userIdFromStore || '')

	// При монтировании подтягиваем из AsyncStorage, если store пустой
	useEffect(() => {
		const init = async () => {
			if (userIdFromStore === '') {
				try {
					const stored = await AsyncStorage.getItem(
						EnumAsyncStorage.USER_ID
					)
					if (stored) {
						const id = JSON.parse(stored)
						setUserIdStore(id)
						setUserIdState(id)
					}
				} catch (e) {
					console.error(
						'[useUser] failed to read userId from storage',
						e
					)
				}
			} else {
				setUserIdState(userIdFromStore)
			}
		}
		init()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Обновление userId и синхронизация store + AsyncStorage
	const setUserId = useCallback(async (id: string) => {
		setUserIdStore(id)
		setUserIdState(id)
		try {
			if (id) {
				await AsyncStorage.setItem(
					EnumAsyncStorage.USER_ID,
					JSON.stringify(id)
				)
			} else {
				await AsyncStorage.removeItem(EnumAsyncStorage.USER_ID)
			}
		} catch (e) {
			console.error('[useUser] failed to save userId', e)
		}
	}, [])

	return {
		userId,
		setUserId
	}
}
