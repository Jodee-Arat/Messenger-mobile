import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { AuthStore } from './auth.type'

export const authStore = create(
	persist<AuthStore>(
		set => ({
			isAuthenticated: false,
			setIsAuthenticated: (value: boolean) =>
				set({ isAuthenticated: value })
		}),
		{
			name: 'auth',
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
)
