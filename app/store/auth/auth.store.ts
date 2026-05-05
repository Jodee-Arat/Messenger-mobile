import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { AuthStore } from './auth.type'

export const authStore = create(
	persist<AuthStore>(
		set => ({
			isAuthenticated: false,
			isAuthChecked: false,
			_hasHydrated: false,
			setIsAuthenticated: (value: boolean) =>
				set({ isAuthenticated: value }),
			setIsAuthChecked: (value: boolean) => set({ isAuthChecked: value }),
			setHasHydrated: (value: boolean) => set({ _hasHydrated: value })
		}),
		{
			name: 'auth',
			storage: createJSONStorage(() => AsyncStorage),
			onRehydrateStorage: () => state => {
				state?.setIsAuthChecked(false)
				state?.setHasHydrated(true)
			}
		}
	)
)
