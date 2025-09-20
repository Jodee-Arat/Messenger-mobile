import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { UserStore } from './user.type'

export const userStore = create(
	persist<UserStore>(
		set => ({
			userId: '',
			setUserId: (value: string) => set({ userId: value })
		}),
		{
			name: 'user',
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
)
