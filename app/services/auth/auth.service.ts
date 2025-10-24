import AsyncStorage from '@react-native-async-storage/async-storage'
import {
	CommonActions,
	useNavigationContainerRef
} from '@react-navigation/native'

import { EnumAsyncStorage } from '@/types/interface/auth.interface'

import { deleteTokensStorage, saveToStorage } from '@/services/auth/auth.helper'

export const handleLogout = async () => {
	await deleteTokensStorage()
	await AsyncStorage.removeItem(EnumAsyncStorage.USER_ID)

	const navRef = useNavigationContainerRef()

	navRef.dispatch(
		CommonActions.reset({
			index: 0,
			routes: [{ name: 'Auth' }]
		})
	)
}
